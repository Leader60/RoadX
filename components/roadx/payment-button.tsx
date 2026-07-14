"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRoadX } from "@/contexts/roadx-context";
import { usePurchase, useUserState } from "@/lib/pi-payment";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { IconSparkle } from "./icons";

const PRODUCT_ID = "roadx-xp1j";
const YOUR_PERSONAL_PI_WALLET = "GBR3WU2DAHS5WNNYU7OPMSTF7OWSMWPPOR2IOU752HSM6S4L3PTSPBUH";

export function AutoSubscriptionModal() {
  const { toast } = useRoadX();
  const { makePurchase } = usePurchase();
  const { restore } = useUserState();
  const { isAuthenticated, authenticate, isLoading: authLoading, sdk } = usePiAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"FORM" | "PAYMENT_METHOD" | "AUTO_PAYING" | "MANUAL_INSTRUCTIONS" | "SUCCESS" | "ERROR">("FORM");
  const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", country: "" });
  const [txId, setTxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحديث التواريخ برمجياً لضمان الدقة
  const getDates = useCallback(() => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return {
      act: now.toLocaleDateString("ar-EG", options),
      exp: expiry.toLocaleDateString("ar-EG", options)
    };
  }, []);

  // دالة الحفظ الموحدة (أكثر أماناً)
  const saveSubscription = useCallback(async (transactionId: string, uid: string, username: string) => {
    try {
      const dates = getDates();
      const response = await fetch("/api/roadx/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ...dates, transactionId, piUid: uid, piUsername: username, productId: PRODUCT_ID }),
      });

      if (!response.ok) throw new Error("فشل الاتصال بخادم التفعيل");
      
      sessionStorage.setItem("roadx_user_choice", "premium_active");
      sessionStorage.setItem("roadx_expiry", dates.exp);
      setStep("SUCCESS");
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [formData, getDates]);

  // دالة الدفع التلقائي مع تحسين معالجة الأخطاء
  const initiatePiPayment = async () => {
    setStep("AUTO_PAYING");
    try {
      if (!isAuthenticated) await authenticate();
      if (!sdk) throw new Error("SDK غير جاهز");

      const result = await makePurchase(PRODUCT_ID);
      if (result?.ok) {
        await saveSubscription(result.txid || `tx_${Date.now()}`, result.uid || "user", result.username || "user");
      } else {
        throw new Error("تم إلغاء الدفع أو فشل");
      }
    } catch (err: any) {
      setStep("ERROR");
      toast?.("خطأ في الدفع: " + (err.message || "يرجى المحاولة يدوياً"));
    }
  };

  // التأثيرات الجانبية للتحقق الأولي
  useEffect(() => {
    const timer = setTimeout(async () => {
      const restored = await restore();
      if (restored?.purchases?.some((p: any) => p.productId === PRODUCT_ID && p.quantity > 0)) {
        sessionStorage.setItem("roadx_user_choice", "premium_active");
      } else if (!sessionStorage.getItem("roadx_user_choice")) {
        setIsOpen(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [restore]);

  // ... (بقية مكونات الواجهة تظل كما هي مع استخدام الحالة الجديدة formData)
  
  if (!isOpen) return null;

  return (
    // هيكل الـ UI المحدث هنا...
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       {/* المحتوى كما هو في كودك الأصلي ولكن مع ربط الحقول بـ formData */}
    </div>
  );
}
