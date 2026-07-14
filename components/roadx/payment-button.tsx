"use client";

import React, { useState, useEffect } from "react";
import { useRoadX } from "@/contexts/roadx-context";
import { Button } from "./ui";
import { IconSparkle } from "./icons";

// تم تحديث عنوان المحفظة الخاص بك هنا
const YOUR_PERSONAL_PI_WALLET = "GBR3WU2DAHS5WNNYU7OPMSTF7OWSMWPPOR2IOU752HSM6S4L3PTSPBUH";

type ModalStep = "FORM" | "PAYMENT_INSTRUCTIONS" | "SUCCESS";

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

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    setActivationDate(formatDate(now));
    setExpirationDate(formatDate(expiry));

    const hasChosen = sessionStorage.getItem("roadx_user_choice");
    if (!hasChosen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(YOUR_PERSONAL_PI_WALLET);
    setCopied(true);
    toast?.("تم نسخ عنوان المحفظة بنجاح!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast?.("يرجى ملء الحقول الإجبارية أولاً.");
      return;
    }
    setStep("PAYMENT_INSTRUCTIONS");
  };

  const handleVerifyAndSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) {
      toast?.("يرجى إدخال رمز المعاملة (TxID) للتأكيد.");
      return;
    }

    setIsSubmitting(true);
    toast?.("جاري إرسال طلب التفعيل...");

    // يتم حفظ الطلب في قاعدة البيانات، وعليك أنت التحقق من محفظتك للتأكد من وصول الـ 0.1 Pi
    try {
      await saveSubscriptionToDatabase(txId, "p2p_user", "premium_member");
    } catch (err) {
      toast?.("حدث خطأ أثناء الإرسال.");
      setIsSubmitting(false);
    }
  };

  const saveSubscriptionToDatabase = async (transactionId: string, uid: string, username: string) => {
    const subscriptionData = {
      fullName,
      email,
      phone,
      country,
      activationDate,
      expirationDate,
      piUsername: username,
      piUid: uid,
      transactionId,
    };

    try {
      await fetch("/api/roadx/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });
      
      sessionStorage.setItem("roadx_user_choice", "premium_active");
      setStep("SUCCESS");
      setIsSubmitting(false);
    } catch (error) {
      console.error("فشل حفظ البيانات:", error);
      setIsSubmitting(false);
      toast?.("فشل الاتصال بالسيرفر. حاول مجدداً.");
    }
  };

  const handleSendEmailReceipt = () => {
    const mailtoLink = `mailto:${email},rdx.prv@gmail.com?subject=تأكيد اشتراك RoadX Premium&body=${encodeURIComponent(
      `أهلاً بك في عائلة RoadX!\n\nتم إرسال طلب تفعيل حسابك Premium بنجاح.\n\nتفاصيل الاشتراك:\n- الاسم الكامل: ${fullName}\n- البريد الإلكتروني: ${email}\n- رقم المعاملة (TxID): ${txId}\n- تاريخ التفعيل: ${activationDate}\n- تاريخ انتهاء الصلاحية: ${expirationDate}\n\nسيتم مراجعة الدفع وتفعيل كامل الميزات قريباً!\n\nإدارة منصة RoadX`
    )}`;
    window.location.href = mailtoLink;
  };

  const handleContinueFree = () => {
    sessionStorage.setItem("roadx_user_choice", "free_guest");
    setIsOpen(false);
    toast?.("تم الدخول كزائر.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/95 backdrop-blur-md" />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card p-6 text-right shadow-2xl transition-all rx-no-scrollbar">
        
        {step === "FORM" && (
          <form onSubmit={handleFormSubmit} className="space-y-4 text-right animate-in fade-in zoom-in duration-300" dir="rtl">
             {/* [تم اختصار محتوى النموذج هنا لضمان مطابقة الشكل السابق] */}
            <div className="flex flex-col items-center gap-2 text-center mb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-navy-deep text-gold animate-pulse">
                <IconSparkle size={24} />
              </span>
              <h3 className="text-xl font-bold rx-gold-text">الاشتراك في RoadX Premium</h3>
            </div>
            
            <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">الاسم الكامل *</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-sm text-foreground focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">البريد الإلكتروني *</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-sm text-foreground focus:border-gold focus:outline-none" />
                </div>
            </div>

            <Button type="submit" variant="gold" className="w-full py-2.5 text-sm font-bold">متابعة للدفع</Button>
            <button type="button" onClick={handleContinueFree} className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors text-center border border-border hover:border-gold/30 rounded-xl">المتابعة كحساب مجاني</button>
          </form>
        )}

        {step === "PAYMENT_INSTRUCTIONS" && (
          <div className="space-y-4 text-right animate-in fade-in duration-300" dir="rtl">
            <h3 className="text-lg font-bold text-gold text-center">خطوات الدفع اليدوي</h3>
            <div className="bg-secondary/20 border border-border p-3.5 rounded-xl text-xs space-y-2 leading-relaxed">
              <p>1. انسخ عنوان المحفظة أدناه.</p>
              <p>2. افتح <span className="text-gold">Pi Wallet</span> وأرسل <span className="text-gold font-bold">0.1 Pi</span>.</p>
              <p>3. ضع رمز المعاملة (TxID) في الحقل أدناه لتأكيد طلبك.</p>
            </div>
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input type="text" readOnly value={YOUR_PERSONAL_PI_WALLET} className="flex-1 rounded-lg border border-border bg-secondary/50 p-2 text-[10px] text-left text-muted-foreground" />
                <button type="button" onClick={handleCopyWallet} className="px-3 rounded-lg bg-gold text-navy-deep font-bold text-xs hover:bg-gold/80">{copied ? "تم!" : "نسخ"}</button>
              </div>
            </div>
            <form onSubmit={handleVerifyAndSubscribe} className="space-y-3">
              <input type="text" required value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="الصق رمز TxID هنا" className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-xs text-left" />
              <Button type="submit" disabled={isSubmitting} variant="gold" className="w-full py-2.5 text-xs font-bold">{isSubmitting ? "جاري الإرسال..." : "تأكيد التفعيل"}</Button>
            </form>
          </div>
        )}

        {step === "SUCCESS" && (
           /* [نموذج شاشة النجاح كما هو سابقاً] */
          <div className="text-center p-6 space-y-4" dir="rtl">
            <h3 className="text-xl font-bold text-emerald-400">تم إرسال الطلب!</h3>
            <p className="text-xs text-muted-foreground">سيتم التحقق من وصول الـ Pi لمحفظتك وتفعيل الحساب قريباً.</p>
            <Button onClick={() => setIsOpen(false)} className="w-full py-2.5">إغلاق</Button>
          </div>
        )}
      </div>
    </div>
  );
}
