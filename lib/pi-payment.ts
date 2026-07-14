"use client";

import { usePiAuth } from "@/contexts/pi-auth-context";
import type {
  ConsumeResponse,
  PurchaseResult,
  PurchasesResponse,
  RestoreOptions,
  SDKLiteError,
  UserPurchaseBalance,
  UserStateRecord,
} from "@/lib/sdklite-types";

export type {
  ConsumeResponse,
  PurchaseResult,
  PurchasesResponse,
  RestoreOptions,
  SDKLiteError,
  UserPurchaseBalance,
  UserStateRecord,
};

export function usePurchase() {
  const { sdk } = usePiAuth();

  const makePurchase = async (productId: string): Promise<PurchaseResult> => {
    if (!sdk) throw new Error("SDK not initialized");

    try {
      // 1. قبل البدء، نتحقق من وجود معاملات معلقة لنفس المنتج ونحاول استهلاكها لتجنب تعليق الدفع
      try {
        const activePurchases = await sdk.state.purchases();
        const pendingProduct = activePurchases.items.find(
          (item) => item.productId === productId
        );

        if (pendingProduct) {
          console.log("تم العثور على عملية شراء معلقة لهذا المنتج، جاري استهلاكها لتنظيف الحساب...");
          await sdk.state.consume(productId);
        }
      } catch (restoreErr) {
        console.warn("فشلت محاولة تنظيف المعاملات المعلقة تلقائياً (تجاوز):", restoreErr);
      }

      // 2. تنفيذ عملية الشراء الفعلية
      return await sdk.makePurchase(productId);
    } catch (err: any) {
      console.error("خطأ أثناء تنفيذ makePurchase:", err);

      // 3. إذا فشل الدفع بسبب "المنتج مملوك بالفعل" أو خطأ مشابه، نحاول عمل Restore ثم Consume ونعيد المحاولة
      if (err?.message?.includes("already") || err?.code === "already_owned") {
        try {
          console.log("المنتج معلق كـ 'مملوك بالفعل'.. محاولة الإصلاح التلقائي عبر الـ Restore...");
          await sdk.state.restore();
          await sdk.state.consume(productId);
          // أعد محاولة الشراء بعد التنظيف مباشرة
          return await sdk.makePurchase(productId);
        } catch (retryErr) {
          throw new Error("المنتج مملوك بالفعل ولم نتمكن من إعادة تعيينه تلقائياً. يرجى المحاولة لاحقاً.");
        }
      }
      
      throw err;
    }
  };

  return { makePurchase };
}

export function useAds() {
  const { sdk } = usePiAuth();

  const isAdNetworkSupported = async (): Promise<boolean> => {
    if (!sdk) return false;
    return sdk.isAdNetworkSupported();
  };

  const showInterstitial = async (): Promise<boolean> => {
    if (!sdk) return false;
    return sdk.showInterstitial();
  };

  const showRewarded = async (productId: string): Promise<boolean> => {
    if (!sdk) return false;
    return sdk.showRewarded(productId);
  };

  return { isAdNetworkSupported, showInterstitial, showRewarded };
}

export function useUserState() {
  const { sdk } = usePiAuth();

  const get = async (key: string): Promise<UserStateRecord | null> => {
    if (!sdk) throw new Error("SDK not initialized");
    return sdk.state.get(key);
  };

  const set = async (
    key: string,
    blob: Record<string, unknown>
  ): Promise<void> => {
    if (!sdk) throw new Error("SDK not initialized");
    return sdk.state.set(key, blob);
  };

  const purchases = async (): Promise<PurchasesResponse> => {
    if (!sdk) throw new Error("SDK not initialized");
    return sdk.state.purchases();
  };

  const consume = async (
    productId: string,
    quantity?: number
  ): Promise<ConsumeResponse> => {
    if (!sdk) throw new Error("SDK not initialized");
    return sdk.state.consume(productId, quantity);
  };

  const restore = async (
    options?: RestoreOptions
  ): Promise<PurchasesResponse> => {
    if (!sdk) throw new Error("SDK not initialized");
    return sdk.state.restore(options);
  };

  return { get, set, purchases, consume, restore };
}
