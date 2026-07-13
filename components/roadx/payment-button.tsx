"use client";

import { useState } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { PRODUCT_CONFIG } from "@/lib/product-config";
import { Button } from "./ui";
import { IconShield, IconSparkle } from "./icons";

interface PaymentButtonProps {
  onSuccess?: () => void;
}

export function PaymentButton({ onSuccess }: PaymentButtonProps) {
  const { products, sdk } = usePiAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productId = PRODUCT_CONFIG.PRODUCT_6a53f50a552e08825455dbf5;
  const product = products?.find((p) => p.id === productId);

  if (!product) {
    return (
      <Button disabled variant="outline" className="text-xs">
        منصة التحكم غير متاحة
      </Button>
    );
  }

  const amount = product.price_in_pi;
  const label = `${product.name} (${amount} Pi)`;

  const handlePayment = async () => {
    if (!sdk) {
      setError("SDK not initialized");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await sdk.makePurchase(product.slug);

      if (result.ok) {
        console.log("[Payment] Purchase successful:", {
          productId: result.productId,
          paymentId: result.paymentId,
          txid: result.txid,
        });
        onSuccess?.();
      } else {
        setError("الدفع فشل. يرجى المحاولة مرة أخرى.");
      }
    } catch (err: any) {
      const code = err?.code;
      const message =
        code === "product_not_found"
          ? "المنتج غير موجود"
          : code === "purchase_cancelled"
            ? "تم إلغاء عملية الشراء"
            : code === "purchase_error"
              ? "حدث خطأ في الدفع"
              : "حدث خطأ غير متوقع";
      setError(message);
      console.error("[Payment] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        onClick={handlePayment}
        disabled={loading}
        variant="gold"
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold"
      >
        <IconShield size={16} />
        <span className="rx-clamp-1">{label}</span>
      </Button>
      {error && (
        <div className="absolute top-full right-0 mt-2 rounded-lg bg-red-900/90 px-3 py-2 text-xs text-white whitespace-nowrap shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

interface SubscriptionButtonProps {
  onSuccess?: () => void;
}

export function SubscriptionButton({ onSuccess }: SubscriptionButtonProps) {
  const { products, sdk } = usePiAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productId = PRODUCT_CONFIG.PRODUCT_6a5400ec093f77b293b37533;
  const product = products?.find((p) => p.id === productId);

  if (!product) {
    return (
      <Button disabled variant="outline" className="text-xs">
        الاشتراك غير متاح
      </Button>
    );
  }

  const amount = product.price_in_pi;
  const label = `${product.name} (${amount} Pi)`;

  const handlePayment = async () => {
    if (!sdk) {
      setError("SDK not initialized");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await sdk.makePurchase(product.slug);

      if (result.ok) {
        console.log("[Subscription] Purchase successful:", {
          productId: result.productId,
          paymentId: result.paymentId,
          txid: result.txid,
        });
        onSuccess?.();
      } else {
        setError("الدفع فشل. يرجى المحاولة مرة أخرى.");
      }
    } catch (err: any) {
      const code = err?.code;
      const message =
        code === "product_not_found"
          ? "المنتج غير موجود"
          : code === "purchase_cancelled"
            ? "تم إلغاء عملية الشراء"
            : code === "purchase_error"
              ? "حدث خطأ في الدفع"
              : "حدث خطأ غير متوقع";
      setError(message);
      console.error("[Subscription] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        onClick={handlePayment}
        disabled={loading}
        variant="primary"
        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-bold"
      >
        <IconSparkle size={16} />
        <span className="rx-clamp-1">{label}</span>
      </Button>
      {error && (
        <div className="absolute top-full right-0 mt-2 rounded-lg bg-red-900/90 px-3 py-2 text-xs text-white whitespace-nowrap shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
