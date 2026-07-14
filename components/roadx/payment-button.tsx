"use client";

import React, { useState, useEffect } from "react";
import { useRoadX } from "@/contexts/roadx-context";
import { IconSparkle } from "./icons";

const YOUR_PERSONAL_PI_WALLET = "GBR3WU2DAHS5WNNYU7OPMSTF7OWSMWPPOR2IOU752HSM6S4L3PTSPBUH";

type ModalStep = "FORM" | "PAYMENT_METHOD" | "AUTO_PAYING" | "MANUAL_INSTRUCTIONS" | "SUCCESS";

interface PaymentButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function SubscriptionButton({ onClick, className, children }: PaymentButtonProps) {
  const handlePress = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    window.dispatchEvent(new CustomEvent("open-subscription-modal"));
  };
  return (
    <button onClick={handlePress} type="button" className={`px-6 py-2.5 font-bold rounded-xl shadow-lg rx-press flex items-center justify-center gap-2 bg-gold text-gold-foreground hover:opacity-90 transition-all ${className || ""}`}>
      <IconSparkle size={18} /> {children || "اشترك في Premium الآن"}
    </button>
  );
}

export function PaymentButton({ onClick, className, children }: PaymentButtonProps) {
  const handlePress = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    window.dispatchEvent(new CustomEvent("open-subscription-modal"));
  };
  return (
    <button onClick={handlePress} type="button" className={`px-6 py-2.5 font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-xl rx-press transition-all ${className || ""}`}>
      {children || "دفع 0.1 Pi"}
    </button>
  );
}

export function AutoSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useRoadX();
  const [step, setStep] = useState<ModalStep>("FORM");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [txId, setTxId] = useState("");
  const [activationDate, setActivationDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + 365);
    const formatDate = (date: Date) => date.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    setActivationDate(formatDate(now));
    setExpirationDate(formatDate(expiry));

    const hasChosen = sessionStorage.getItem("roadx_user_choice");
    if (!hasChosen) {
      const timer = setTimeout(() => setIsOpen(true), 15000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener("open-subscription-modal", handleOpenModal);
    return () => window.removeEventListener("open-subscription-modal", handleOpenModal);
  }, []);

  if (!isOpen) return null;

  const saveSubscriptionToDatabase = async (transactionId: string, uid: string, username: string) => {
    try {
      const response = await fetch("/api/roadx/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, country, activationDate, expirationDate, piUsername: username, piUid: uid, transactionId }),
      });
      if (response.ok) {
        sessionStorage.setItem("roadx_user_choice", "premium_active");
        setStep("SUCCESS");
      }
    } catch (error) {
      toast?.("خطأ في الاتصال بالخادم.");
    }
  };

  const initiatePiPayment = async () => {
    const Pi = (window as any).Pi;
    if (!Pi) {
      toast?.("خطأ: يرجى فتح التطبيق من خلال Pi Browser.");
      return;
    }
    setStep("AUTO_PAYING");

    try {
      await Pi.createPayment({
        amount: 0.1,
        memo: "RoadX Premium Subscription",
        metadata: { fullName, email },
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          await saveSubscriptionToDatabase(paymentId, "pi_user", "premium_member");
        },
        onReadyForServerCompletion: () => setStep("SUCCESS"),
        onCancel: () => setStep("PAYMENT_METHOD"),
        onError: (err: any) => {
          toast?.("فشل الدفع: " + (err?.message || "خطأ غير معروف"));
          setStep("PAYMENT_METHOD");
        }
      });
    } catch (err: any) {
      toast?.("خطأ في بدء الدفع: " + err.message);
      setStep("PAYMENT_METHOD");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 rx-fade-in">
      <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-md" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card p-6 text-right shadow-2xl transition-all rx-pop">
        {step === "FORM" && (
            <form onSubmit={(e) => { e.preventDefault(); setStep("PAYMENT_METHOD"); }} className="space-y-4" dir="rtl">
                <h3 className="text-xl font-bold text-gold text-center">الاشتراك في RoadX Premium</h3>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-2 rounded-lg border bg-secondary/30" placeholder="الاسم الكامل" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded-lg border bg-secondary/30" placeholder="البريد الإلكتروني" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 rounded-lg border bg-secondary/30" placeholder="رقم الهاتف" />
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full p-2 rounded-lg border bg-secondary/30" placeholder="الدولة" />
                <button type="submit" className="w-full py-2.5 bg-gold text-gold-foreground rounded-xl font-bold">متابعة</button>
            </form>
        )}
        {step === "PAYMENT_METHOD" && (
            <div className="space-y-4" dir="rtl">
                <h3 className="text-lg font-bold text-gold text-center">اختر طريقة الدفع</h3>
                <button onClick={initiatePiPayment} className="w-full p-4 rounded-xl border border-gold bg-navy-deep/50 text-right">دفع أوتوماتيكي (⚡)</button>
                <button onClick={() => setStep("MANUAL_INSTRUCTIONS")} className="w-full p-4 rounded-xl border border-border bg-secondary/10 text-right">تحويل يدوي (P2P)</button>
            </div>
        )}
        {step === "MANUAL_INSTRUCTIONS" && (
            <div className="space-y-4" dir="rtl">
                <h3 className="text-lg font-bold text-gold text-center">التحويل اليدوي</h3>
                <p className="text-sm">قم بالتحويل لمحفظة: <br/><span className="text-[10px] break-all text-gold">{YOUR_PERSONAL_PI_WALLET}</span></p>
                <input value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="أدخل رقم المعاملة (TxID)" className="w-full p-2 rounded-lg border bg-secondary/30" />
                <button onClick={() => saveSubscriptionToDatabase(txId, "p2p", "p2p")} className="w-full py-2 bg-gold text-white rounded-xl">تأكيد التحويل</button>
            </div>
        )}
        {step === "AUTO_PAYING" && <div className="text-center p-8"><h3 className="text-lg font-bold text-gold">جاري الاتصال بـ Pi...</h3></div>}
        {step === "SUCCESS" && <div className="text-center p-8 text-emerald-400 font-bold">تم الاشتراك بنجاح!</div>}
      </div>
    </div>
  );
}
