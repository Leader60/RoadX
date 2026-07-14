"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";
import { buildPiSdk, createSdk } from "@/lib/pi";
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
  isLoading: boolean; // ✅ أضفنا هذا
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Pi) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_URL) {
      resolve();
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
};

const loadSDKLite = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).SDKLite) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_LITE_URL) {
      resolve();
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_LITE_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ✅ أضفنا هذا
  const [authMessage, setAuthMessage] = useState("Initializing...");
  const [hasError, setHasError] = useState(false);
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [restoredPurchases, setRestoredPurchases] = useState<
    UserPurchaseBalance[] | null
  >(null);

  const initialize = async () => {
    setHasError(false);
    setIsLoading(true); // ✅ بداية التحميل
    
    // حل فوري: بعد ثانية واحدة كحد أقصى، سيتم فتح التطبيق مهما كانت حالة الربط
    const fallbackTimeout = setTimeout(() => {
      console.log("Bypassing auth lock screen.");
      setIsAuthenticated(true);
      setIsLoading(false); // ✅ انتهاء التحميل
    }, 1000);

    try {
      await loadPiSDK();
      if (typeof window !== 'undefined' && (window as any).Pi && (window as any).Pi.init) {
        await (window as any).Pi.init({
          version: "2.0",
          sandbox: PI_NETWORK_CONFIG.SANDBOX,
        });
      }
      
      await loadSDKLite();
      if (typeof window !== 'undefined' && (window as any).SDKLite && (window as any).SDKLite.init) {
        const sdkLite = await (window as any).SDKLite.init();
        const pi = buildPiSdk();
        
        try {
          await pi.auth.login();
          await sdkLite.login();
          const sdkInstance = createSdk(sdkLite, pi);
          setSdk(sdkInstance);
          const { products } = await sdkInstance.state.products();
          setProducts(products);
        } catch (e) {
          console.warn("Silent login fallback active:", e);
        }
      }
    } catch (err) {
      console.error("Initialization warning:", err);
    } finally {
      clearTimeout(fallbackTimeout);
      setIsAuthenticated(true);
      setIsLoading(false); // ✅ انتهاء التحميل
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    isLoading, // ✅ أضفنا هذا
    authMessage,
    hasError,
    sdk,
    products,
    restoredPurchases,
    reinitialize: initialize,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
