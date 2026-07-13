"use client";

import React, { useState, useEffect } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { Button } from "./ui";
import { IconClose, IconSparkle } from "./icons";

export function SubscriptionButton() {
  // هذا المكون تم تفريغه لأننا سنعرض نافذة الاشتراك تلقائياً بعد 15 ثانية
  return null;
}

export function PaymentButton() {
  // تم تفريغ زر دفع المدير بناءً على طلبك لإزالته من واجهة المستخدم
  return null;
}

export function AutoSubscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { sdk } = usePiAuth();

  // مؤقت يفتح النافذة تلقائياً بعد 15 ثانية (15000 ميللي ثانية)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  // جلب اسم المستخدم المتوفر من حساب Pi أو وضع اسم افتراضي
  const username = sdk?.state?.user?.username || "عضو شبكة Pi";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* خلفية معتمة */}
      <div 
        className="absolute inset-0 bg-navy-deep/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* نافذة الاشتراك */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-gold/30 bg-card p-6 text-right shadow-2xl transition-all rx-fade-in">
        {/* زر الإغلاق */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="إغلاق"
        >
          <IconClose size={20} />
        </button>

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
        <div className="space-y-4 text-sm text-foreground">
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

        {/* زر الإجراء السفلي */}
        <div className="mt-6">
          <Button 
            variant="gold" 
            className="w-full py-3 text-base font-bold"
            onClick={() => {
              // هنا يمكن ربط دفع الـ Pi الفعلي مستقبلاً إذا أردت تفعيل الدفع المباشر
              window.location.href = "mailto:rdx.prv@gmail.com?subject=RoadX Subscription Request";
            }}
          >
            تواصل معنا لتأكيد الاشتراك
          </Button>
        </div>
      </div>
    </div>
  );
}
