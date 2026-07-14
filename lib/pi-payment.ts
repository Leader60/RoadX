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
  const { sdk, isLoading, isAuthenticated } = usePiAuth();

  const makePurchase = async (productId: string): Promise<PurchaseResult> => {
    // ✅ انتظار حتى يتم تهيئة SDK
    if (isLoading) {
      console.log("⏳ جاري انتظار تهيئة SDK...");
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isLoading) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
      });
    }

    // ✅ إذا لم يكن SDK متاحاً، نستخدم وضع المحاكاة للاختبار
    if (!sdk) {
      console.warn("⚠️ SDK غير متاح، استخدام وضع المحاكاة");
      return {
        ok: true,
        productId: productId,
        paymentId: `mock_${Date.now()}`,
        txid: `tx_mock_${Date.now()}`,
        uid: "mock_user",
        username: "mock_user"
      };
    }

    try {
      // 1. قبل البدء، نتحقق من وجود معاملات معلقة لنفس المنتج ونحاول استهلاكها لتجنب تعليق الدفع
      try {
        const activePurchases = await sdk.state.purchases();
        const pendingProduct = activePurchases?.items?.find(
          (item) => item.productId === productId
        );

        if (pendingProduct) {
          console.log("📦 تم العثور على عملية شراء معلقة لهذا المنتج، جاري استهلاكها لتنظيف الحساب...");
          await sdk.state.consume(productId);
        }
      } catch (restoreErr) {
        console.warn("⚠️ فشلت محاولة تنظيف المعاملات المعلقة تلقائياً (تجاوز):", restoreErr);
      }

      // 2. تنفيذ عملية الشراء الفعلية
      return await sdk.makePurchase(productId);
    } catch (err: any) {
      console.error("❌ خطأ أثناء تنفيذ makePurchase:", err);

      // 3. إذا فشل الدفع بسبب "المنتج مملوك بالفعل" أو خطأ مشابه
      if (err?.message?.includes("already") || err?.code === "already_owned") {
        try {
          console.log("🔄 المنتج معلق كـ 'مملوك بالفعل'.. محاولة الإصلاح التلقائي عبر الـ Restore...");
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
    try {
      return await sdk.isAdNetworkSupported();
    } catch {
      return false;
    }
  };

  const showInterstitial = async (): Promise<boolean> => {
    if (!sdk) return false;
    try {
      return await sdk.showInterstitial();
    } catch {
      return false;
    }
  };

  const showRewarded = async (productId: string): Promise<boolean> => {
    if (!sdk) return false;
    try {
      return await sdk.showRewarded(productId);
    } catch {
      return false;
    }
  };

  return { isAdNetworkSupported, showInterstitial, showRewarded };
}

export function useUserState() {
  const { sdk, isLoading } = usePiAuth();

  // ✅ دالة مساعدة للانتظار حتى تهيئة SDK
  const waitForSDK = async () => {
    if (isLoading) {
      console.log("⏳ جاري انتظار تهيئة SDK...");
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isLoading) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
      });
    }
  };

  const get = async (key: string): Promise<UserStateRecord | null> => {
    await waitForSDK();
    if (!sdk) {
      console.warn("⚠️ SDK غير متاح، إرجاع null");
      return null;
    }
    try {
      return await sdk.state.get(key);
    } catch {
      return null;
    }
  };

  const set = async (
    key: string,
    blob: Record<string, unknown>
  ): Promise<void> => {
    await waitForSDK();
    if (!sdk) throw new Error("SDK not initialized");
    return sdk.state.set(key, blob);
  };

  const purchases = async (): Promise<PurchasesResponse> => {
    await waitForSDK();
    if (!sdk) {
      console.warn("⚠️ SDK غير متاح، إرجاع قائمة فارغة");
      return { items: [] };
    }
    try {
      return await sdk.state.purchases();
    } catch {
      return { items: [] };
    }
  };

  const consume = async (
    productId: string,
    quantity?: number
  ): Promise<ConsumeResponse> => {
    await waitForSDK();
    if (!sdk) throw new Error("SDK not initialized");
    return sdk.state.consume(productId, quantity);
  };

  const restore = async (
    options?: RestoreOptions
  ): Promise<PurchasesResponse> => {
    await waitForSDK();
    if (!sdk) {
      console.warn("⚠️ SDK غير متاح، إرجاع قائمة فارغة");
      return { items: [] };
    }
    try {
      return await sdk.state.restore(options);
    } catch {
      return { items: [] };
    }
  };

  return { get, set, purchases, consume, restore };
}
