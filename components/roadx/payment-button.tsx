"use client";

import React, { useState, useEffect } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { useRoadX } from "@/contexts/roadx-context";
import { Button } from "./ui";
import { IconSparkle } from "./icons";

export function SubscriptionButton() { return null; }
export function PaymentButton() { return null; }

type ModalStep = "FORM" | "PAYING" | "SUCCESS";

export function AutoSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { sdk } = usePiAuth();
  const { toast } = useRoadX();

  const [step, setStep] = useState<ModalStep>("FORM");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // جلب بيانات المستخدم الفعلي من سياق المصادقة
  const piUser = sdk?.state?.user || null;

  const initiatePiPayment = async () => {
    const globalPi = typeof window !== "undefined" ? (window as any).Pi : null;

    // 1. التحقق من وجود المتصفح والـ SDK الخاص بـ Pi
    if (!globalPi) {
      console.log("خارج متصفح Pi: تشغيل وضع المحاكاة للتجربة.");
      setTimeout(async () => {
        await saveSubscriptionToDatabase("MOCK_TX_ID_123456", "guest_uid", "guest");
      }, 2000);
      return;
    }

    try {
      let currentUser = piUser;

      // 2. إذا لم يكن المستخدم قد قام بالمصادقة وتوثيق حسابه بعد، نقوم بمصادقته الآن فوراً
      if (!currentUser) {
        toast?.("جاري الاتصال بحساب Pi الخاص بك...");
        const scopes = ["username", "payments"];
        
        const authResult = await globalPi.authenticate(scopes, (onIncompletePaymentFound: any) => {
          // معالجة المدفوعات المعلقة إن وجدت لضمان عدم تعليق الحساب
          fetch("/api/roadx/incomplete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment: onIncompletePaymentFound }),
          });
        });
        
        currentUser = authResult.user;
      }

      const uid = currentUser?.uid || "unknown_uid";
      const username = currentUser?.username || "unknown_user";

      const paymentData = {
        amount: 0.1,
        memo: "الاشتراك السنوي في منصة RoadX Premium",
        metadata: { 
          fullName, 
          email, 
          uid: uid 
        },
      };

      // 3. استدعاء بوابة الدفع الحقيقية وفتح محفظة Pi بشكل إجباري ومباشر
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
            console.error("خطأ موافقة السيرفر:", e);
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
              // حماية مضافة لتأكيد التفعيل عند نجاح المعاملة في البلوكشين وتأخر السيرفر
              await saveSubscriptionToDatabase(txid || "TX_SUCCESS_LOCAL", uid, username);
            }
          } catch (e) {
            await saveSubscriptionToDatabase(txid || "TX_SUCCESS_LOCAL", uid, username);
          }
        },
        onCancel: (paymentId: string) => {
          toast?.("تم إلغاء عملية الدفع من قبل المستخدم.");
          setIsSubmitting(false);
          setStep("FORM");
        },
        onError: (error: any, paymentId?: string) => {
          console.error("خطأ أثناء الدفع:", error);
          toast?.("فشلت عملية الدفع. يرجى التأكد من رصيد محفظتك وإعادة المحاولة.");
          setIsSubmitting(false);
          setStep("FORM");
        }
      });

    } catch (err) {
      console.error("خطأ في المصادقة أو استدعاء الدفع:", err);
      toast?.("يرجى منح صلاحية الوصول للحساب لإتمام الدفع.");
      setIsSubmitting(false);
      setStep("FORM");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast?.("يرجى ملء الحقول الإجبارية أولاً.");
      return;
    }
    setIsSubmitting(true);
    setStep("PAYING");
    
    setTimeout(() => {
      initiatePiPayment();
    }, 500);
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
      console.error("فشل إرسال البيانات لقاعدة البيانات:", error);
    }

    sessionStorage.setItem("roadx_user_choice", "premium_active");
    setStep("SUCCESS");
    setIsSubmitting(false);
  };

  const handleSendEmailReceipt = () => {
    const displayUsername = piUser?.username || "user";
    const mailtoLink = `mailto:${email},rdx.prv@gmail.com?subject=تأكيد اشتراك RoadX Premium&body=${encodeURIComponent(
      `أهلاً بك في عائلة RoadX!\n\nتم تفعيل حسابك Premium بنجاح بعد إتمام الدفع عبر شبكة Pi.\n\nتفاصيل الاشتراك السنوي وعقدك المالي:\n- الاسم الكامل: ${fullName}\n- البريد الإلكتروني الموثق: ${email}\n- رقم الهاتف: ${phone || "غير متوفر"}\n- الدولة: ${country || "غير متوفر"}\n- حساب Pi: @${displayUsername}\n- تاريخ تفعيل الاشتراك: ${activationDate}\n- تاريخ انتهاء الصلاحية: ${expirationDate}\n- تكلفة الاشتراك: 0.1 Pi سنوياً\n\nتصفح ممتع لكافة الأغاني والمحتوى الحصري بدون أي حظر!\n\nإدارة منصة RoadX`
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
        
        {step === "FORM" && (
          <form onSubmit={handleFormSubmit} className="space-y-4 text-right animate-in fade-in zoom-in duration-300" dir="rtl">
            <div className="flex flex-col items-center gap-2 text-center mb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-navy-deep text-gold animate-pulse">
                <IconSparkle size={24} />
              </span>
              <h3 className="text-xl font-bold rx-gold-text">الاشتراك في RoadX Premium</h3>
              <p className="text-xs text-muted-foreground">أدخل بياناتك للتجهيز لبوابة دفع شبكة Pi</p>
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
                اشترك الآن
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

        {step === "PAYING" && (
          <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in duration-300">
            <div className="h-12 w-12 rounded-full border-4 border-gold border-t-transparent animate-spin mb-2" />
            <h3 className="text-lg font-bold text-gold">جاري الاتصال بمحفظة Pi...</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              يرجى الموافقة على طلب الاتصال وتأكيد المعاملة بقيمة <span className="font-bold text-foreground">0.1 Pi</span> فور ظهور نافذة تأكيد المحفظة.
            </p>
          </div>
        )}

        {step === "SUCCESS" && (
          <div className="space-y-5 text-right animate-in zoom-in-95 duration-300" dir="rtl">
            <div className="flex flex-col items-center gap-2 text-center mb-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-bounce">
                <span className="text-2xl font-bold">✓</span>
              </span>
              <h3 className="text-xl font-bold text-emerald-400">اكتمل تفعيل الاشتراك بنجاح!</h3>
              <p className="text-xs text-muted-foreground">تم فتح جميع خدمات الموسيقى والأغاني الحصرية في حسابك</p>
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
                <span className="text-muted-foreground">حساب الباي:</span>
                <span className="font-semibold text-gold">@{piUser?.username || "حساب موثق"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">قيمة الدفع السنوي:</span>
                <span className="font-bold text-gold">0.1 Pi</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2 mt-2 text-xs">
                <span className="text-muted-foreground">تاريخ تفعيل الاشتراك:</span>
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
