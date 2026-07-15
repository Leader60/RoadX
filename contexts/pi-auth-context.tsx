"use client";
import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface PiUser {
  uid: string;
  username: string;
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasError: boolean;
  authMessage: string;
  user: PiUser | null;
  authenticate: () => Promise<PiUser | null>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);
const SANDBOX = true; // Testnet

// ✅ إكمال أي دفعة قديمة عالقة تلقائياً عبر السيرفر، بدل ما تمنع أي دفعة جديدة
async function onIncompletePaymentFound(payment: any) {
  console.log("⚠️ دفعة سابقة غير مكتملة، جاري إكمالها تلقائياً:", payment);
  try {
    const paymentId = payment?.identifier;
    const txid = payment?.transaction?.txid;

    if (!paymentId) {
      console.warn("⚠️ لا يوجد معرف دفعة (paymentId) لإكمالها.");
      return;
    }

    if (txid) {
      // الدفعة وصلت لمرحلة وجود معاملة على البلوكشين — أكملها
      const res = await fetch("/api/roadx/payments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, txid }),
      });
      console.log(res.ok ? "✅ تم إكمال الدفعة القديمة بنجاح" : "❌ فشل إكمال الدفعة القديمة");
    } else {
      // لا يوجد txid بعد — على الأقل اعتمدها حتى لا تبقى عالقة بانتظار موافقة السيرفر
      const res = await fetch("/api/roadx/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      console.log(res.ok ? "✅ تم اعتماد الدفعة القديمة" : "❌ فشل اعتماد الدفعة القديمة");
    }
  } catch (err) {
    console.error("❌ خطأ أثناء معالجة الدفعة القديمة:", err);
  }
}

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [authMessage, setAuthMessage] = useState("جاري تحميل Pi SDK...");
  const [user, setUser] = useState<PiUser | null>(null);

  const authenticate = async (): Promise<PiUser | null> => {
    const Pi = (window as any).Pi;
    if (!Pi) {
      setHasError(true);
      setAuthMessage("Pi SDK غير متاح.");
      return null;
    }
    try {
      const auth = await Promise.race([
        Pi.authenticate(["username", "payments"], onIncompletePaymentFound),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("انتهت مهلة المصادقة (10 ثواني) — قد تكون هناك دفعة عالقة لم تُعالَج.")), 10000)
        ),
      ]) as any;
      const piUser: PiUser = { uid: auth.user.uid, username: auth.user.username };
      setUser(piUser);
      setIsAuthenticated(true);
      setAuthMessage("تمت المصادقة");
      return piUser;
    } catch (err: any) {
      setIsAuthenticated(false);
      setHasError(true);
      setAuthMessage("فشلت المصادقة: " + (err?.message || ""));
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    const initSdk = async () => {
      let attempts = 0;
      while (!(window as any).Pi && attempts < 50) {
        await new Promise((r) => setTimeout(r, 100));
        attempts++;
      }
      if (cancelled) return;
      if (!(window as any).Pi) {
        setHasError(true);
        setAuthMessage("لم يتم العثور على Pi SDK — تأكد أنك تفتح التطبيق داخل Pi Browser.");
        setIsLoading(false);
        return;
      }
      try {
        await Promise.race([
          (window as any).Pi.init({ version: "2.0", sandbox: SANDBOX }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("انتهت مهلة الاتصال بـ Pi.")), 8000)),
        ]);
        setAuthMessage("جاهز");
      } catch (err: any) {
        setHasError(true);
        setAuthMessage(err?.message || "فشل تهيئة Pi SDK");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    initSdk();
    return () => { cancelled = true; };
  }, []);

  return (
    <PiAuthContext.Provider value={{ isAuthenticated, isLoading, hasError, authMessage, user, authenticate }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const ctx = useContext(PiAuthContext);
  if (!ctx) throw new Error("usePiAuth must be used within a PiAuthProvider");
  return ctx;
}
