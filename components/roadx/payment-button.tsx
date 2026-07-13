"use client";

import React, { useState, useEffect } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { useRoadX } from "@/contexts/roadx-context";
import { Button } from "./ui";
import { IconSparkle } from "./icons";

export function SubscriptionButton() { return null; }
export function PaymentButton() { return null; }

export function AutoSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { sdk } = usePiAuth();
  const { toast } = useRoadX();

  // حقول البيانات المطلوبة
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تواريخ الاشتراك (365 يوماً)
  const [activationDate, setActivationDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    // حساب التواريخ ديناميكياً عند تحميل المكون
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

    // التحقق من اتخاذ قرار سابق
    const hasChosen = sessionStorage.getItem("roadx_user_choice");
    if (!hasChosen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  const piUser = sdk?.state?.user || { username: "guest", uid: "guest_uid" };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast?.("يرجى ملء الحقول الإجبارية (الاسم والبريد الإلكتروني)");
      return;
    }

    setIsSubmitting(true);

    const subscriptionData = {
      fullName,
      email,
      phone,
      country,
      activationDate,
      expirationDate,
      piUsername: piUser.username,
      piUid: piUser.uid, // ربط الحساب بمعرف Pi SDK
    };

    try {
      // 1. حفظ البيانات في قاعدة البيانات الخلفية
      const response = await fetch("/api/roadx/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) throw new Error("فشل حفظ البيانات في الخادم");

      // 2. إعداد وإرسال البريد الإلكتروني للمشترك والموقع
      const mailtoLink = `mailto:${email},rdx.prv@gmail.com?subject=تأكيد اشتراك RoadX Premium&body=${encodeURIComponent(
        `مرحباً ${fullName}،\n\nتم استلام طلب اشتراكك في منصة RoadX بنجاح.\n\nتفاصيل الاشتراك:\n- الاسم الكامل: ${fullName}\n- البريد الإلكتروني: ${email}\n- رقم الهاتف: ${phone || "غير محدد"}\n- الدولة: ${country || "غير محدد"}\n- حساب Pi: @${piUser.username}\n- معرف Pi UID: ${piUser.uid}\n- تاريخ تفعيل الاشتراك: ${activationDate}\n- تاريخ انتهاء الاشتراك: ${expirationDate}\n- قيمة الاشتراك: 0.1 Pi سنوياً\n\nشكراً لانضمامك إلينا!\nفريق عمل RoadX`
      )}`;

      // فتح تطبيق البريد لإرسال النسخة المتبادلة
      window.location.href = mailtoLink;

      sessionStorage.setItem("roadx_user_choice", "requested_premium");
      setIsOpen(false);
      toast?.("تم تسجيل بياناتك بنجاح وجاري فتح البريد لتأكيد الاشتراك!");
    } catch (error) {
      toast?.("حدث خطأ أثناء حفظ البيانات، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueFree = () => {
    sessionStorage.setItem("roadx_user_choice", "free_guest");
    setIsOpen(false);
    toast?.("تم الدخول كزائر. يرجى الاشتراك للوصول لكامل الميزات وقوائم الأغاني.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-deep/95 backdrop-blur-md" />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-gold/30 bg-card p-6 text-right shadow-2xl transition-all rx-fade-in animate-in fade-in zoom-in duration-300 rx-no-scrollbar">
        <div className="flex flex-col items-center gap-2 text-center mb-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-navy-deep text-gold animate-pulse">
            <IconSparkle size={24} />
          </span>
          <h3 className="text-xl font-bold rx-gold-text">نموذج الاشتراك Premium</h3>
          <p className="text-xs text-muted-foreground">
            الرجاء إدخال بياناتك لتفعيل حسابك السنوي (365 يوماً) بقيمة 0.1 Pi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
          {/* بيانات المشترك */}
          <div className="space-y-3">
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
                  placeholder="+966..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gold mb-1">الدولة (اختياري)</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/30 p-2 text-sm text-foreground focus:border-gold focus:outline-none"
                  placeholder="مصر، السعودية..."
                />
              </div>
            </div>
          </div>

          {/* تواريخ الاشتراك ديناميكياً */}
          <div className="rounded-xl bg-secondary/40 p-3 border border-border space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">تاريخ التفعيل المجدول:</span>
              <span className="font-semibold text-foreground">{activationDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">تاريخ انتهاء الصلاحية (365 يوماً):</span>
              <span className="font-semibold text-gold">{expirationDate}</span>
            </div>
            <div className="flex justify-between border-t border-border/40 pt-2 mt-1">
              <span className="text-muted-foreground">حساب شبكة Pi الحالي:</span>
              <span className="font-bold text-gold">@{piUser.username}</span>
            </div>
          </div>

          {/* الأزرار والإجراءات */}
          <div className="space-y-2 pt-2">
            <Button
              type="submit"
              variant="gold"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-bold"
            >
              {isSubmitting ? "جاري الحفظ والتسجيل..." : "تأكيد وإرسال تفاصيل الاشتراك"}
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
      </div>
    </div>
  );
}
