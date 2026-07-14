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
    <button
      onClick={handlePress}
      type="button"
      className={`px-6 py-2.5 font-bold rounded-xl shadow-lg rx-press flex items-center justify-center gap-2 bg-gold text-gold-foreground hover:opacity-90 transition-all ${className || ""}`}
    >
      <IconSparkle size={18} />
      {children || "اشترك في Premium الآن"}
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
    <button
      onClick={handlePress}
      type="button"
      className={`px-6 py-2.5 font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-xl rx-press transition-all ${className || ""}`}
    >
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activationDate, setActivationDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + 365);
    const formatDate = (date: Date) => date.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    setActivationDate(formatDate(now));
    setExpirationDate(formatDate(expiry));

    // إعادة تفعيل التايمر للظهور التلقائي
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

  const initiatePiPayment = async () => {
    setStep("AUTO_PAYING");
    toast?.("جاري الاتصال بالمحفظة...");

    const Pi = (window as any).Pi;
    if (!Pi) {
      toast?.("خطأ: لم يتم العثور على محفظة Pi. تأكد أنك تستخدم Pi Browser.");
      setStep("PAYMENT_METHOD");
      return;
    }

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
          toast?.("فشل الدفع: " + (err.message || "خطأ غير معروف"));
          setStep("PAYMENT_METHOD");
        }
      });
    } catch (err: any) {
      toast?.("خطأ: " + err.message);
      setStep("PAYMENT_METHOD");
    }
  };

  const saveSubscriptionToDatabase = async (transactionId: string, uid: string, username: string) => {
    try {
      await fetch("/api/roadx/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, country, activationDate, expirationDate, piUsername: username, piUid: uid, transactionId }),
      });
      sessionStorage.setItem("roadx_user_choice", "premium_active");
      setStep("SUCCESS");
    } catch (error) {
      toast?.("خطأ في الاتصال بالخادم.");
    }
    setIsSubmitting(false);
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
        {step === "AUTO_PAYING" && <div className="text-center p-8"><h3 className="text-lg font-bold text-gold">جاري الاتصال...</h3></div>}
        {step === "SUCCESS" && <div className="text-center p-8 text-emerald-400 font-bold">تم الاشتراك بنجاح!</div>}
      </div>
    </div>
  );
}
