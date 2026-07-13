"use client";

import React, { useState, useEffect } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { useRoadX } from "@/contexts/roadx-context";
import { Button } from "./ui";
import { IconSparkle } from "./icons";

export function SubscriptionButton() {
  return null;
}

export function PaymentButton() {
  return null;
}

export function AutoSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { sdk } = usePiAuth();
  const { toast } = useRoadX(); // لاستدعاء التنبيهات المدمجة في قالبك

  useEffect(() => {
    // التحقق مما إذا كان المستخدم قد اتخذ قراراً مسبقاً في هذه الجلسة
    const hasChosen = sessionStorage.getItem("roadx_user_choice");
    
    if (!hasChosen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  // جلب اسم المستخدم المتوفر من حساب Pi أو وضع اسم افتراضي
  const username = sdk?.state?.user?.username || "عضو شبكة Pi";

  // تفعيل خيار المتابعة كزائر محدود الصلاحية
  const handleContinueFree = () => {
    sessionStorage.setItem("roadx_user_choice", "free_guest");
    setIsOpen(false);
    
    // تنبيه ترحيبي يوضح محدودية الصلاحيات
    if (toast) {
      toast("تم الدخول كزائر. يرجى الاشتراك للوصول لكامل الميزات وقوائم الأغاني.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* خلفية معتمة بالكامل لحجب الواجهة ومنع التفاعل خلف النافذة */}
      <div className="absolute inset-0 bg-navy-deep/95 backdrop-blur-md" />

      {/* نافذة الاشتراك */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-gold/30 bg-card p-6 text-right shadow-2xl transition-all rx-fade-in animate-in fade-in zoom-in duration-300">
        
        {/* تم حذف زر الإغلاق (X) لفرض اختيار أحد المسارين */}

        {/* أيقونة مميزة وعنوان */}
        <div className="flex flex-col items-center gap-2 text-center mb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-navy-deep text-gold animate-pulse">
            <IconSparkle size={24} />
          </span>
          <h3 className="text-xl font-bold rx-gold-text">اشتراكك في RoadX Premium</h3>
          <p className="text-xs text-muted-foreground">
            استمتع بجميع الميزات الموسيقية الحصرية بدون قيود
          </p>
        </div>

        {/* تفاصيل وبيانات المشترك */}
        <div className="space-y-4 text-sm text-foreground text-right" dir="rtl">
          <div className="rounded-xl bg-secondary/40 p-4 border border-border">
            <div className="flex justify-between border-b border-border/55 pb-2 mb-2">
              <span className="text-muted-foreground">اسم المشترك:</span>
              <span className="font-semibold text-gold">@{username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">قيمة الاشتراك:</span>
              <span className="font-bold text-gold">0.1 Pi / شهرياً</span>
            </div>
          </div>

          <div className="space-y-2 text-pretty leading-relaxed">
            <p className="text-xs text-muted-foreground text-center">
              لتفعيل الاشتراك، إتمام الدفع، أو في حال مواجهة أي مشاكل تقنية، يرجى التواصل مع الدعم الفني مباشرة عبر البريد الإلكتروني الخاص بنا:
            </p>
            <p className="text-center font-bold text-gold select-all text-sm border border-dashed border-gold/30 p-2 rounded-lg bg-navy-deep/20">
              rdx.prv@gmail.com
            </p>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="mt-6 flex flex-col gap-3">
          <Button 
            variant="gold" 
            className="w-full py-3 text-base font-bold"
            onClick={() => {
              // حفظ الحالة كطلب تفعيل اشتراك مع إبقاء الباب مفتوحاً للتواصل
              sessionStorage.setItem("roadx_user_choice", "requested_premium");
              window.location.href = "mailto:rdx.prv@gmail.com?subject=RoadX Subscription Request";
              setIsOpen(false);
            }}
          >
            تواصل لتأكيد الاشتراك
          </Button>

          <button
            onClick={handleContinueFree}
            className="w-full py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors text-center border border-border hover:border-gold/30 rounded-xl"
          >
            المتابعة بدون اشتراك (صلاحيات محدودة)
          </button>
        </div>
      </div>
    </div>
  );
}
