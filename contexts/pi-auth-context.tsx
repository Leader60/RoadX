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
  authenticate: () => Promise<PiUser | null>; // يُرجع المستخدم مباشرة (يحل مشكلة الـ stale closure)
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const SANDBOX = true; // Testnet — غيّرها إلى false عند الانتقال لاحقاً إلى Mainnet

function onIncompletePaymentFound(payment: any) {
  console.log("⚠️ دفعة سابقة غير مكتملة، يُفضّل إكمالها من السيرفر:", payment);
}

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [authMessage, setAuthMessage] = useState("جاري تحميل Pi SDK...");
  const [user, setUser] = useState<PiUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    const waitForPi = async () => {
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
        await (window as any).Pi.init({ version: "2.0", sandbox: SANDBOX });
        setAuthMessage("جاهز");
      } catch (err: any) {
        setHasError(true);
        setAuthMessage("فشل تهيئة Pi SDK: " + (err?.message || ""));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    waitForPi();
    return () => { cancelled = true; };
  }, []);

  const authenticate = async (): Promise<PiUser | null> => {
    const Pi = (window as any).Pi;
    if (!Pi) {
      setHasError(true);
      setAuthMessage("Pi SDK غير متاح.");
      return null;
    }
    try {
      const auth = await Pi.authenticate(["username", "payments"], onIncompletePaymentFound);
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
