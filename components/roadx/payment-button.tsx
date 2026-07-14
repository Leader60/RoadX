"use client";

import React, { useState, useEffect } from "react";
import { useRoadX } from "@/contexts/roadx-context";
import { usePurchase, useUserState } from "@/lib/pi-payment";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { IconSparkle } from "./icons";

const YOUR_PERSONAL_PI_WALLET = "GBR3WU2DAHS5WNNYU7OPMSTF7OWSMWPPOR2IOU752HSM6S4L3PTSPBUH";

type ModalStep = "FORM" | "PAYMENT_METHOD" | "AUTO_PAYING" | "MANUAL_INSTRUCTIONS" | "SUCCESS" | "ERROR";

export function SubscriptionButton({ onClick, className, children }: { onClick?: () => void; className?: string; children?: React.ReactNode }) {
  const handlePress = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    window.dispatchEvent(new CustomEvent("open-subscription-modal"));
  };
  return (
    <button onClick={handlePress} className={`px-6 py-2.5 font-bold rounded-xl shadow-lg rx-press flex items-center justify-center gap-2 bg-gold text-gold-foreground hover:opacity-90 transition-all ${className || ""}`}>
      <IconSparkle size={18} /> {children || "اشترك في Premium الآن"}
    </button>
  );
}

export function AutoSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useRoadX();
  const { makePurchase } = usePurchase();
  const { restore } = useUserState();
  const { isAuthenticated, authenticate, isLoading: authLoading, sdk } = usePiAuth();

  const [step, setStep] = useState<ModalStep>("FORM");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [txId, setTxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [purchaseResult, setPurchaseResult] = useState<any>(null);
  const [activationDate, setActivationDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const PRODUCT_ID = "roadx-xp1j";

  useEffect(() => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);
    const formatDate = (d: Date) => d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    setActivationDate(formatDate(now));
    setExpirationDate(formatDate(expiry));

    const hasChosen = sessionStorage.getItem("roadx_user_choice");
    if (!hasChosen) {
      const timer = setTimeout(() => setIsOpen(true), 15000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-subscription-modal", handleOpen);
    return () => window.removeEventListener("open-subscription-modal", handleOpen);
  }, []);

  if (!isOpen) return null;

  const saveSubscriptionToDatabase = async (transactionId: string, uid: string, username: string) => {
    try {
      const response = await fetch("/api/roadx/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, country, activationDate, expirationDate, piUsername: username, piUid: uid, transactionId, productId: PRODUCT_ID }),
      });
      if (!response.ok) throw new Error("فشل حفظ البيانات");
      sessionStorage.setItem("roadx_user_choice", "premium_active");
      setStep("SUCCESS");
    } catch (err: any) {
      toast?.("خطأ في الاتصال بالخادم: " + err.message);
      setStep("PAYMENT_METHOD");
    }
  };

  const initiatePiPayment = async () => {
    setStep("AUTO_PAYING");
    setErrorMessage("");

    try {
      // 1. المصادقة
      if (!isAuthenticated) {
        await authenticate();
        await new Promise(r => setTimeout(r, 1500));
      }

      // 2. الاستعادة أولاً لتجنب تكرار الدفع
      const restored = await restore();
      const existing = restored?.purchases?.find((p: any) => p.productId === PRODUCT_ID && p.quantity > 0);
      if (existing) {
        toast?.("تم العثور على اشتراك سابق نشط!");
        await saveSubscriptionToDatabase("restored_" + Date.now(), "user", "user");
        return;
      }

      // 3. الشراء
      const result = await makePurchase(PRODUCT_ID);
      if (result?.ok) {
        setPurchaseResult(result);
        await saveSubscriptionToDatabase(result.txid, result.uid, result.username);
      } else {
        throw new Error("لم يتم تأكيد المعاملة");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "حدث خطأ غير متوقع");
      setStep("ERROR");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-md" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card p-6 text-right shadow-2xl">
        {step === "FORM" && (
          <form onSubmit={(e) => { e.preventDefault(); setStep("PAYMENT_METHOD"); }} className="space-y-4" dir="rtl">
            <h3 className="text-xl font-bold text-gold text-center">الاشتراك في RoadX Premium</h3>
            <input required placeholder="الاسم الكامل" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full p-2 rounded-lg border bg-secondary/30" />
            <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 rounded-lg border bg-secondary/30" />
            <button type="submit" className="w-full py-2.5 bg-gold text-gold-foreground rounded-xl font-bold">متابعة</button>
          </form>
        )}
        {step === "PAYMENT_METHOD" && (
          <div className="space-y-4" dir="rtl">
            <h3 className="text-lg font-bold text-gold text-center">اختر طريقة الدفع</h3>
            <button onClick={initiatePiPayment} disabled={authLoading} className="w-full p-4 rounded-xl border border-gold/40 bg-navy-deep/50">دفع أوتوماتيكي (⚡)</button>
            <button onClick={() => setStep("MANUAL_INSTRUCTIONS")} className="w-full p-4 rounded-xl border border-border bg-secondary/10">تحويل يدوي (P2P)</button>
          </div>
        )}
        {step === "AUTO_PAYING" && <div className="text-center p-8 text-gold font-bold">جاري الاتصال بـ Pi Wallet...</div>}
        {step === "ERROR" && <div className="text-center p-4 text-red-400 font-bold">{errorMessage} <button onClick={() => setStep("PAYMENT_METHOD")} className="block mt-4 underline">محاولة أخرى</button></div>}
        {step === "MANUAL_INSTRUCTIONS" && (
           <div className="space-y-4" dir="rtl">
             <h3 className="text-lg font-bold text-gold text-center">الدفع اليدوي</h3>
             <p className="text-xs">قم بالتحويل إلى: <span className="font-mono text-[10px]">{YOUR_PERSONAL_PI_WALLET}</span></p>
             <input value={txId} onChange={e => setTxId(e.target.value)} placeholder="TxID" className="w-full p-2 border rounded-lg" />
             <button onClick={() => saveSubscriptionToDatabase(txId, "p2p", "p2p")} className="w-full py-2 bg-gold text-white rounded-xl">تأكيد</button>
           </div>
        )}
        {step === "SUCCESS" && <div className="text-center p-8 text-emerald-400 font-bold">تم الاشتراك بنجاح!</div>}
      </div>
    </div>
  );
}
