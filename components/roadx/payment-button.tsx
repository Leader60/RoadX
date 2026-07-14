"use client";

import React, { useState, useEffect } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { useRoadX } from "@/contexts/roadx-context";
import { Button } from "./ui";
import { IconSparkle } from "./icons";

// عنوان محفظتك الشخصية لاستقبال الدفع اليدوي الاحتياطي
const YOUR_PERSONAL_PI_WALLET = "GBR3WU2DAHS5WNNYU7OPMSTF7OWSMWPPOR2IOU752HSM6S4L3PTSPBUH";

type ModalStep = "FORM" | "PAYMENT_METHOD" | "AUTO_PAYING" | "MANUAL_INSTRUCTIONS" | "SUCCESS";

export function SubscriptionButton() { return null; }
export function PaymentButton() { return null; }

export function AutoSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { sdk } = usePiAuth();
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
    // ننتقل لصفحة اختيار طريقة الدفع بعد تعبئة كامل البيانات
    setStep("PAYMENT_METHOD");
  };

  // 1. طريقة الدفع الأوتوماتيكية (عبر متصفح وبوابة Pi الرسمية)
  const initiatePiPayment = async () => {
    const globalPi = typeof window !== "undefined" ? (window as any).Pi : null;

    if (!globalPi) {
      toast?.("تنبيه: أنت خارج متصفح Pi. جاري تفعيل المحاكاة التجريبية.");
      setStep("AUTO_PAYING");
      setTimeout(async () => {
        await saveSubscriptionToDatabase("MOCK_TX_123", "guest_uid", "guest");
      }, 2000);
      return;
    }

    setStep("AUTO_PAYING");

    try {
      try {
        await globalPi.init({ version: "2.0", sandbox: false });
      } catch (e) {
        console.log("الـ SDK مهيأ مسبقاً");
      }

      const scopes = ["username", "payments"];
      const authResult = await globalPi.authenticate(scopes, (onIncompletePaymentFound: any) => {
        fetch("/api/roadx/incomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment: onIncompletePaymentFound }),
        });
      });

      if (!authResult || !authResult.user) {
        throw new Error("لم ترجع خوادم Pi بيانات مستخدم صالحة.");
      }

      const uid = authResult.user.uid;
      const username = authResult.user.username;

      const paymentData = {
        amount: 0.1,
        memo: "الاشتراك السنوي في منصة RoadX Premium",
        metadata: { fullName, email, uid },
      };

      globalPi.createPayment({
        amount: paymentData.amount,
        memo: paymentData.memo,
        metadata: paymentData.metadata,
      }, {
        onReadyForServerApproval: async (paymentId: string) => {
          try {
            await fetch("/api/roadx/approve-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
          } catch (e) {
            console.error(e);
          }
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          try {
            const response = await fetch("/api/roadx/complete-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });

            if (response.ok) {
              await saveSubscriptionToDatabase(txid, uid, username);
            } else {
              await saveSubscriptionToDatabase(txid || "TX_SUCCESS", uid, username);
            }
          } catch (e) {
            await saveSubscriptionToDatabase(txid || "TX_SUCCESS", uid, username);
          }
        },
        onCancel: (paymentId: string) => {
          toast?.("تم إلغاء الدفع الأوتوماتيكي.");
          setStep("PAYMENT_METHOD");
        },
        onError: (error: any) => {
          toast?.(`خطأ في الدفع التلقائي: ${error?.message || "يرجى المحاولة مجدداً"}`);
          setStep("PAYMENT_METHOD");
        }
      });

    } catch (err: any) {
      console.error(err);
      toast?.(`تعذر تفعيل البوابة التلقائية: ${err?.message || "قد يكون السبب الخطوة 3 في حساب المطور"}`);
      // نعيده لصفحة الخيارات ليتمكن من اختيار الدفع اليدوي كبديل فوري
      setStep("PAYMENT_METHOD");
    }
  };

  // 2. طريقة الدفع اليدوي (P2P) وتأكيد إرسال الرمز
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
    } catch (error) {
      console.error(error);
    }

    sessionStorage.setItem("roadx_user_choice", "premium_active");
    setStep("SUCCESS");
    setIsSubmitting(false);
  };

  const handleSendEmailReceipt = () => {
    const mailtoLink = `mailto:${email},rdx.prv@gmail.com?subject=تأكيد اشتراك RoadX Premium&body=${encodeURIComponent(
      `أهلاً بك في عائلة RoadX!\n\nتم استقبال طلب اشتراكك Premium بنجاح.\n\nتفاصيل الاشتراك السنوي وعقدك المالي:\n- الاسم الكامل: ${fullName}\n- البريد الإلكتروني الموثق: ${email}\n- رقم الهاتف: ${phone || "غير متوفر"}\n- الدولة: ${country || "غير متوفر"}\n- رمز المعاملة (TxID): ${txId || "معاملة أوتوماتيكية"}\n- تاريخ تفعيل الاشتراك: ${activationDate}\n- تاريخ انتهاء الصلاحية: ${expirationDate}\n- تكلفة الاشتراك: 0.1 Pi سنوياً\n\nتصفح ممتع لكافة الأغاني والمحتوى الحصري بدون أي حظر!\n\nإدارة منصة RoadX`
    )}`;
    window.location.href = mailtoLink;
  };

  const handleContinueFree = () => {
    sessionStorage.setItem("roadx_user_choice", "free_guest");
    setIsOpen(false);
    toast?.("تم الدخول كزائر. يرجى الاشتراك للوصول لكامل الميزات وقوائم الأغاني.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/95 backdrop-blur-md" />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card p-6 text-right shadow-2xl transition-all rx-no-scrollbar">
        
        {/* الخطوة 1: نموذج تعبئة البيانات الكاملة */}
        {step === "FORM" && (
          <form onSubmit={handleFormSubmit} className="space-y-4 text-right animate-in fade-in zoom-in duration-300" dir="rtl">
            <div className="flex flex-col items-center gap-2 text-center mb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-navy-deep text-gold animate-pulse">
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
              <Button type="submit" variant="gold" className="w-full py-2.5 text-sm font-bold">
                متابعة واختيار طريقة الدفع
              </Button>

              <button
                type="button"
                onClick={handleContinueFree}
                className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors text-center border border-border hover:border-gold/30 rounded-xl"
              >
                المتابعة كحساب مجاني (محدود الصلاحيات)
              </button>
            </div>
          </form>
        )}

        {/* الخطوة 2: شاشة اختيار طريقة الدفع الفورية */}
        {step === "PAYMENT_METHOD" && (
          <div className="space-y-5 text-right animate-in fade-in duration-300" dir="rtl">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gold">اختر طريقة الدفع المناسبة لك</h3>
              <p className="text-xs text-muted-foreground mt-1">تكلفة الاشتراك السنوي: 0.1 Pi</p>
            </div>

            <div className="space-y-3">
              {/* خيار 1: دفع أوتوماتيكي سريع */}
              <button
                onClick={initiatePiPayment}
                className="w-full p-4 rounded-xl border border-gold/40 bg-navy-deep/50 hover:bg-navy-deep text-right flex items-center justify-between transition-all group"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-gold group-hover:underline">دفع أوتوماتيكي سريع (موصى به)</h4>
                  <p className="text-[11px] text-muted-foreground">فتح المحفظة والمصادقة الفورية من داخل المتصفح</p>
                </div>
                <span className="text-xl">⚡</span>
              </button>

              {/* خيار 2: دفع يدوي مباشر P2P */}
              <button
                onClick={() => setStep("MANUAL_INSTRUCTIONS")}
                className="w-full p-4 rounded-xl border border-border bg-secondary/10 hover:bg-secondary/30 text-right flex items-center justify-between transition-all"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-foreground">تحويل يدوي مباشر (P2P)</h4>
                  <p className="text-[11px] text-muted-foreground">إذا تعطل الدفع التلقائي، يمكنك التحويل لمحفظتنا مباشرة</p>
                </div>
                <span className="text-xl">💳</span>
              </button>
            </div>

            <button
              onClick={() => setStep("FORM")}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2"
            >
              ← تعديل البيانات الشخصية
            </button>
          </div>
        )}

        {/* خطوة الدفع الأوتوماتيكي الفعلي */}
        {step === "AUTO_PAYING" && (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in duration-300">
            <div className="h-12 w-12 rounded-full border-4 border-gold border-t-transparent animate-spin mb-2" />
            <h3 className="text-lg font-bold text-gold">جاري الاتصال بـ Pi Wallet...</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              يرجى المصادقة وتأكيد المعاملة بقيمة <span className="font-bold text-foreground">0.1 Pi</span> فور ظهور نافذة التأكيد.
            </p>
          </div>
        )}

        {/* خطوة الدفع اليدوي البديل والاحتياطي */}
        {step === "MANUAL_INSTRUCTIONS" && (
          <div className="space-y-4 text-right animate-in fade-in duration-300" dir="rtl">
            <h3 className="text-lg font-bold text-gold text-center">خطوات الدفع اليدوي المباشر</h3>
            
            <div className="bg-secondary/20 border border-border p-3 rounded-xl text-xs space-y-1.5 leading-relaxed">
              <p>1. انسخ عنوان محفظتنا الشخصية بالأسفل.</p>
              <p>2. افتح تطبيق <span className="text-gold">Pi Wallet</span> وانقل القيمة (0.1 Pi) يدوياً.</p>
              <p>3. بعد نجاح التحويل، انسخ رمز المعاملة (TxID) وضعه في الحقل أدناه لتأكيد طلبك.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gold">عنوان محفظة الاستلام الخاص بنا:</label>
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
                  className="px-3 rounded-lg bg-gold text-navy-deep font-bold text-xs hover:bg-gold/80 transition-colors"
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
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  variant="gold" 
                  className="flex-1 py-2.5 text-xs font-bold"
                >
                  {isSubmitting ? "جاري الإرسال..." : "تأكيد وإرسال للتفعيل"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("PAYMENT_METHOD")}
                  className="px-4 py-2 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl"
                >
                  رجوع
                </button>
              </div>
            </form>
          </div>
        )}

        {/* الخطوة 3: نجاح تفعيل الاشتراك */}
        {step === "SUCCESS" && (
          <div className="space-y-5 text-right animate-in zoom-in-95 duration-300" dir="rtl">
            <div className="flex flex-col items-center gap-2 text-center mb-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce">
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
                <span className="font-bold text-gold">0.1 Pi</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2 mt-2 text-xs">
                <span className="text-muted-foreground">تاريخ الاشتراك:</span>
                <span className="font-semibold text-foreground">{activationDate}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">تاريخ انتهاء الصلاحية:</span>
                <span className="font-semibold text-gold">{expirationDate}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button onClick={handleSendEmailReceipt} variant="gold" className="w-full py-2.5 text-sm font-bold">
                إرسال نسخة من الفاتورة لبريدي الإلكتروني
              </Button>
              <Button 
                onClick={() => setIsOpen(false)} 
                className="w-full py-2.5 text-sm font-semibold bg-secondary hover:bg-secondary/80 text-foreground"
              >
                تصفح الموقع بالكامل الآن
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
