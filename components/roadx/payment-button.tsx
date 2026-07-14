"use client";

import React, { useState, useEffect } from "react";
import { useRoadX } from "@/contexts/roadx-context";
import { IconSparkle } from "./icons";

// عنوان المحفظة الشخصية لاستقبال الدفع اليدوي الاحتياطي
const YOUR_PERSONAL_PI_WALLET = "GBR3WU2DAHS5WNNYU7OPMSTF7OWSMWPPOR2IOU752HSM6S4L3PTSPBUH";

type ModalStep = "FORM" | "PAYMENT_METHOD" | "AUTO_PAYING" | "MANUAL_INSTRUCTIONS" | "SUCCESS";

interface PaymentButtonProps {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// زر الاشتراك الرئيسي (يطلق حدث لفتح المودال)
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

// زر الدفع (يطلق حدث لفتح المودال)
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
      {children || "دفع 1 Pi"}
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

  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener("open-subscription-modal", handleOpenModal);
    return () => window.removeEventListener("open-subscription-modal", handleOpenModal);
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
    setStep("PAYMENT_METHOD");
  };

  // ==========================================
  // الدالة المعدلة للدفع المباشر عبر Pi SDK
  // ==========================================
  const initiatePiPayment = async () => {
    setStep("AUTO_PAYING");
    toast?.("جاري تحضير بوابة الدفع الآمنة...");

    try {
      // التحقق من وجود Pi SDK في المتصفح
      if (typeof window === 'undefined' || !(window as any).Pi) {
        throw new Error("Pi SDK غير محمّل. يرجى فتح التطبيق من خلال Pi Browser.");
      }

      const Pi = (window as any).Pi;

      // إنشاء معرف دفع فريد
      const paymentId = `roadx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      console.log("🔄 جاري إنشاء الدفع بـ ID:", paymentId);

      // إنشاء الدفع في Pi Network
      const payment = await Pi.createPayment({
        amount: 1, // 1 Pi
        memo: `اشتراك سنوي في RoadX Premium - ${fullName}`,
        paymentId: paymentId,
        metadata: {
          fullName: fullName,
          email: email,
          phone: phone || '',
          country: country || '',
          activationDate: activationDate,
          expirationDate: expirationDate
        }
      });

      console.log("✅ تم إنشاء الدفع بنجاح:", payment);

      // التحقق من نجاح الدفع
      if (payment && payment.identifier) {
        toast?.("✅ تم تأكيد الدفع بنجاح!");
        
        // حفظ البيانات في قاعدة البيانات
        await saveSubscriptionToDatabase(
          payment.txid || payment.identifier,
          payment.user?.uid || "pi_user",
          payment.user?.username || "pi_user"
        );
      } else {
        throw new Error("لم يتم تأكيد المعاملة من شبكة Pi");
      }

    } catch (err: any) {
      console.error("❌ خطأ في الدفع:", err);
      
      // عرض رسالة خطأ مفصلة حسب نوع الخطأ
      let errorMessage = "فشل الدفع الأوتوماتيكي. ";
      if (err.message?.includes("sandbox")) {
        errorMessage += "يرجى التأكد من أن التطبيق يعمل في بيئة Pi Browser.";
      } else if (err.message?.includes("user declined")) {
        errorMessage += "تم رفض المعاملة من قبل المستخدم.";
      } else if (err.message?.includes("network")) {
        errorMessage += "مشكلة في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت.";
      } else {
        errorMessage += err?.message || "يرجى المحاولة مجدداً أو استخدام الدفع اليدوي.";
      }
      
      toast?.(errorMessage);
      setStep("PAYMENT_METHOD");
    }
  };

  // ==========================================
  // دالة التحقق من الدفع اليدوي (P2P)
  // ==========================================
  const handleVerifyManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txId.trim()) {
      toast?.("يرجى إدخال رمز المعاملة للتأكيد.");
      return;
    }

    setIsSubmitting(true);
    toast?.("جاري تسجيل طلب التفعيل اليدوي...");

    setTimeout(async () => {
      await saveSubscriptionToDatabase(txId, "p2p_user", "manual_member");
    }, 1500);
  };

  // ==========================================
  // دالة حفظ البيانات في قاعدة البيانات (معدلة)
  // ==========================================
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
      paymentId: `payment_${Date.now()}`,
      amount: 1,
      memo: `اشتراك سنوي - ${fullName}`,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/roadx/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "فشل حفظ البيانات");
      }

      console.log("✅ تم حفظ البيانات بنجاح:", result);
      
      // تخزين حالة المستخدم في Session Storage
      sessionStorage.setItem("roadx_user_choice", "premium_active");
      if (result.data?.walletAddress) {
        sessionStorage.setItem("roadx_wallet", result.data.walletAddress);
      }
      sessionStorage.setItem("roadx_expiry", expirationDate);
      
      setStep("SUCCESS");
      
    } catch (error: any) {
      console.error("❌ فشل حفظ البيانات:", error);
      toast?.(`فشل حفظ البيانات: ${error.message}`);
      
      // في حالة فشل حفظ البيانات، نعود إلى خطوة الدفع
      setStep("PAYMENT_METHOD");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // دالة إرسال الفاتورة عبر البريد
  // ==========================================
  const handleSendEmailReceipt = () => {
    const mailtoLink = `mailto:${email},rdx.prv@gmail.com?subject=تأكيد اشتراك RoadX Premium&body=${encodeURIComponent(
      `أهلاً بك في عائلة RoadX!\n\nتم استقبال طلب اشتراكك Premium بنجاح.\n\nتفاصيل الاشتراك السنوي:\n- الاسم الكامل: ${fullName}\n- البريد الإلكتروني الموثق: ${email}\n- رقم الهاتف: ${phone || "غير متوفر"}\n- الدولة: ${country || "غير متوفر"}\n- رمز المعاملة (TxID): ${txId || "معاملة أوتوماتيكية"}\n- تاريخ تفعيل الاشتراك: ${activationDate}\n- تاريخ انتهاء الصلاحية: ${expirationDate}\n- تكلفة الاشتراك: 1 Pi سنوياً\n\nإدارة منصة RoadX`
    )}`;
    window.location.href = mailtoLink;
  };

  // ==========================================
  // دالة المتابعة كحساب مجاني
  // ==========================================
  const handleContinueFree = () => {
    sessionStorage.setItem("roadx_user_choice", "free_guest");
    setIsOpen(false);
    toast?.("تم الدخول كزائر. يرجى الاشتراك للوصول لكامل الميزات وقوائم الأغاني.");
  };

  // ==========================================
  // واجهة المستخدم
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 rx-fade-in">
      {/* خلفية معتمة */}
      <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-md" onClick={() => setIsOpen(false)} />

      {/* المودال */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card p-6 text-right shadow-2xl transition-all rx-pop rx-no-scrollbar">
        
        {step === "FORM" && (
          <form onSubmit={handleFormSubmit} className="space-y-4 text-right" dir="rtl">
            <div className="flex flex-col items-center gap-2 text-center mb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-navy-deep text-gold rx-pulse">
                <IconSparkle size={24} />
              </span>
              <h3 className="text-xl font-bold rx-gold-text">الاشتراك في RoadX Premium</h3>
              <p className="text-xs text-muted-foreground">أدخل بياناتك للتجهيز لعملية الدفع</p>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gold mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  placeholder="الاسم الثلاثي"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gold mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  placeholder="example@mail.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">الهاتف (اختياري)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-sm text-foreground focus:border-gold focus:outline-none"
                    placeholder="+..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">الدولة (اختياري)</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-sm text-foreground focus:border-gold focus:outline-none"
                    placeholder="الدولة"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                type="submit" 
                className="w-full py-2.5 text-sm font-bold bg-gold text-gold-foreground rounded-xl hover:opacity-90 rx-press transition-all"
              >
                متابعة واختيار طريقة الدفع
              </button>

              <button
                type="button"
                onClick={handleContinueFree}
                className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors text-center border border-border hover:border-gold/30 rounded-xl rx-press"
              >
                المتابعة كحساب مجاني (محدود الصلاحيات)
              </button>
            </div>
          </form>
        )}

        {step === "PAYMENT_METHOD" && (
          <div className="space-y-5 text-right" dir="rtl">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gold">اختر طريقة الدفع المناسبة لك</h3>
              <p className="text-xs text-muted-foreground mt-1">تكلفة الاشتراك السنوي: 1 Pi</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={initiatePiPayment}
                className="w-full p-4 rounded-xl border border-gold/40 bg-navy-deep/50 hover:bg-navy-deep text-right flex items-center justify-between transition-all group rx-press"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-gold group-hover:underline">دفع أوتوماتيكي سريع (موصى به)</h4>
                  <p className="text-[11px] text-muted-foreground">فتح المحفظة والمصادقة الفورية من داخل المتصفح</p>
                </div>
                <span className="text-xl">⚡</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("MANUAL_INSTRUCTIONS")}
                className="w-full p-4 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/30 text-right flex items-center justify-between transition-all rx-press"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">تحويل يدوي مباشر (P2P)</h4>
                  <p className="text-[11px] text-muted-foreground">إذا تعطل الدفع التلقائي، يمكنك التحويل لمحفظتنا مباشرة</p>
                </div>
                <span className="text-xl">💳</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep("FORM")}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2"
            >
              ← تعديل البيانات الشخصية
            </button>
          </div>
        )}

        {step === "AUTO_PAYING" && (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-gold border-t-transparent rx-spin mb-2" />
            <h3 className="text-lg font-bold text-gold">جاري الاتصال بـ Pi Wallet...</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              يرجى المصادقة وتأكيد المعاملة بقيمة <span className="font-bold text-foreground">1 Pi</span> فور ظهور نافذة التأكيد.
            </p>
            <p className="text-[10px] text-muted-foreground/60">
              في حال لم تظهر النافذة، استخدم طريقة الدفع اليدوي (P2P)
            </p>
          </div>
        )}

        {step === "MANUAL_INSTRUCTIONS" && (
          <div className="space-y-4 text-right" dir="rtl">
            <h3 className="text-lg font-bold text-gold text-center">خطوات الدفع اليدوي المباشر</h3>
            
            <div className="bg-secondary/20 border border-border p-3 rounded-xl text-xs space-y-1.5 leading-relaxed">
              <p>1. انسخ عنوان محفظتنا الشخصية بالأسفل.</p>
              <p>2. افتح تطبيق <span className="text-gold">Pi Wallet</span> وانقل القيمة (1 Pi) يدوياً.</p>
              <p>3. بعد نجاح التحويل، انسخ رمز المعاملة (TxID) وضعه في الحقل أدناه لتأكيد طلبك.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gold">عنوان محفظة الاستلاف الخاص بنا:</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={YOUR_PERSONAL_PI_WALLET}
                  className="flex-1 rounded-lg border border-border bg-secondary/50 p-2 text-[10px] text-left text-muted-foreground focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyWallet}
                  className="px-3 rounded-lg bg-gold text-gold-foreground font-bold text-xs hover:opacity-90 transition-colors rx-press"
                >
                  {copied ? "تم!" : "نسخ"}
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyManualPayment} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gold mb-1">أدخل رمز المعاملة (TxID) *</label>
                <input
                  type="text"
                  required
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="الصق الرمز لتسهيل التحقق وتفعيل حسابك"
                  className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-xs text-left focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex-1 py-2.5 text-xs font-bold bg-gold text-gold-foreground rounded-xl hover:opacity-90 rx-press disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "جاري الإرسال..." : "تأكيد وإرسال للتفعيل"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("PAYMENT_METHOD")}
                  className="px-4 py-2 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl rx-press transition-all"
                >
                  رجوع
                </button>
              </div>
            </form>
          </div>
        )}

        {step === "SUCCESS" && (
          <div className="space-y-5 text-right rx-pop" dir="rtl">
            <div className="flex flex-col items-center gap-2 text-center mb-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rx-heart">
                <span className="text-2xl font-bold">✓</span>
              </span>
              <h3 className="text-xl font-bold text-emerald-400">تم التفعيل أو استلام الطلب!</h3>
              <p className="text-xs text-muted-foreground">تم تدوين بياناتك بنجاح في قاعدة البيانات للتحقق</p>
            </div>

            <div className="rounded-xl bg-secondary/40 p-4 border border-border space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الاسم الموثق:</span>
                <span className="font-semibold text-foreground">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">البريد الإلكتروني:</span>
                <span className="font-semibold text-foreground">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الهاتف:</span>
                <span className="font-semibold text-foreground">{phone || "غير متوفر"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">قيمة الدفع المرسلة:</span>
                <span className="font-bold text-gold">1 Pi</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2 mt-2 text-xs">
                <span className="text-muted-foreground">تاريخ الاشتراك:</span>
                <span className="font-semibold text-foreground rx-nums">{activationDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">تاريخ انتهاء الصلاحية:</span>
                <span className="font-semibold text-gold rx-nums">{expirationDate}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button 
                onClick={handleSendEmailReceipt} 
                className="w-full py-2.5 text-sm font-bold bg-gold text-gold-foreground rounded-xl hover:opacity-90 rx-press transition-all"
              >
                إرسال نسخة من الفاتورة لبريدي الإلكتروني
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-full py-2.5 text-sm font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-xl rx-press transition-all"
              >
                تصفح الموقع بالكامل الآن
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
