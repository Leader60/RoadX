"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Product,
  SDKLiteInstance,
  UserPurchaseBalance,
} from "@/lib/sdklite-types";

interface PiAuthContextType {
  isAuthenticated: boolean;
  authMessage: string;
  hasError: boolean;
  sdk: SDKLiteInstance | null;
  products: Product[] | null;
  restoredPurchases: UserPurchaseBalance[] | null;
  reinitialize: () => Promise<void>;
  isLoading: boolean;
  authenticate: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

// ✅ Mock SDK - محاكاة بسيطة للـ SDK
const createMockSDK = (): SDKLiteInstance => {
  return {
    makePurchase: async (productId: string) => {
      console.log("🔵 Mock purchase:", productId);
      return {
        ok: true,
        productId,
        paymentId: `mock_${Date.now()}`,
        txid: `tx_mock_${Date.now()}`,
        uid: "mock_user",
        username: "mock_user"
      };
    },
    isAdNetworkSupported: async () => false,
    showInterstitial: async () => false,
    showRewarded: async () => false,
    state: {
      get: async (key: string) => null,
      set: async (key: string, value: any) => {},
      purchases: async () => ({ items: [] }),
      consume: async (productId: string, quantity?: number) => ({ 
        productId, 
        quantity: 0 
      }),
      restore: async (options?: any) => ({ items: [] }),
      products: async () => ({ products: [] })
    }
  };
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // ✅ دائماً مصادق
  const [isLoading, setIsLoading] = useState(false); // ✅ ليس في حالة تحميل
  const [authMessage, setAuthMessage] = useState("✅ جاهز");
  const [hasError, setHasError] = useState(false);
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null);

  // ✅ تهيئة مباشرة
  useEffect(() => {
    console.log("🚀 PiAuthProvider: Initializing...");
    
    // إنشاء SDK وهمي فوراً
    const mockSDK = createMockSDK();
    setSdk(mockSDK);
    setIsAuthenticated(true);
    setIsLoading(false);
    setAuthMessage("✅ جاهز");
    
    console.log("✅ PiAuthProvider: Ready with mock SDK");
  }, []);

  const authenticate = async (): Promise<void> => {
    console.log("🔵 Authenticate called");
    setIsAuthenticated(true);
    setAuthMessage("✅ تم المصادقة");
  };

  const reinitialize = async (): Promise<void> => {
    console.log("🔵 Reinitialize called");
    const mockSDK = createMockSDK();
    setSdk(mockSDK);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const value: PiAuthContextType = {
    isAuthenticated,
    isLoading,
    authMessage,
    hasError,
    sdk,
    products: null,
    restoredPurchases: null,
    reinitialize,
    authenticate,
  };

  return (
    <PiAuthContext.Provider value={value}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
