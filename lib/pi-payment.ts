"use client";
import { usePiAuth } from "@/contexts/pi-auth-context";

export interface PurchaseResult {
  ok: true;
  paymentId: string;
  txid: string;
  uid: string;
  username: string;
}

export function usePurchase() {
  const { user } = usePiAuth();

  const makePayment = (opts: { amount: number; memo: string; metadata?: Record<string, unknown> }): Promise<PurchaseResult> => {
    return new Promise((resolve, reject) => {
      const Pi = (window as any).Pi;
      if (!Pi) return reject(new Error("Pi SDK غير متاح"));

      Pi.createPayment(
        { amount: opts.amount, memo: opts.memo, metadata: opts.metadata || {} },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            try {
              const res = await fetch("/api/roadx/payments/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId }),
              });
              if (!res.ok) throw new Error("فشل اعتماد الدفع من السيرفر");
            } catch (err: any) {
              reject(err);
            }
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              const res = await fetch("/api/roadx/payments/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentId, txid }),
              });
              if (!res.ok) throw new Error("فشل إكمال الدفع من السيرفر");
              resolve({ ok: true, paymentId, txid, uid: user?.uid || "", username: user?.username || "" });
            } catch (err: any) {
              reject(err);
            }
          },
          onCancel: () => reject(new Error("تم إلغاء الدفع من قبل المستخدم")),
          onError: (err: any) => reject(new Error(err?.message || "خطأ غير معروف بالدفع")),
        }
      );
    });
  };

  return { makePayment };
}

export function useSubscriptionStatus() {
  const { user } = usePiAuth();

  const checkStatus = async (): Promise<{ active: boolean; expirationDate?: string }> => {
    if (!user) return { active: false };
    try {
      const res = await fetch(`/api/roadx/subscription-status?uid=${encodeURIComponent(user.uid)}`);
      if (!res.ok) return { active: false };
      return await res.json();
    } catch {
      return { active: false };
    }
  };

  return { checkStatus };
}
