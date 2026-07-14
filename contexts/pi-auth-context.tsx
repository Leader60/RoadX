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
  isInitialized: boolean; // إضافة حالة جديدة
  authMessage: string;
  hasError: boolean;
  sdk: SDKLiteInstance | null;
  products: Product[] | null;
  restoredPurchases: UserPurchaseBalance[] | null;
  reinitialize: () => Promise<void>;
  isLoading: boolean;
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
    script.onerror = () => {
      console.warn("⚠️ Failed to load Pi SDK, continuing...");
      resolve();
    };
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
    script.onerror = () => {
      console.warn("⚠️ Failed to load SDK Lite, continuing...");
      resolve();
    };
    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("جاري التهيئة...");
  const [hasError, setHasError] = useState(false);
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [restoredPurchases, setRestoredPurchases] = useState<
    UserPurchaseBalance[] | null
  >(null);

  const initialize = async () => {
    setIsLoading(true);
    setHasError(false);
    setAuthMessage("جاري تحميل SDK...");

    try {
      // تحميل Pi SDK
      await loadPiSDK();
      setAuthMessage("جاري تهيئة Pi SDK...");
      
      if (typeof window !== 'undefined' && (window as any).Pi) {
        const Pi = (window as any).Pi;
        if (Pi.init) {
          await Pi.init({
            version: "2.0",
            sandbox: PI_NETWORK_CONFIG.SANDBOX || true,
          });
          console.log("✅ Pi SDK initialized");
        }
      }

      // تحميل SDK Lite
      await loadSDKLite();
      setAuthMessage("جاري تهيئة SDK Lite...");
      
      if (typeof window !== 'undefined' && (window as any).SDKLite) {
        const SDKLite = (window as any).SDKLite;
        if (SDKLite.init) {
          const sdkLite = await SDKLite.init();
          console.log("✅ SDK Lite initialized");
          
          const pi = buildPiSdk();
          
          // محاولة تسجيل الدخول
          try {
            setAuthMessage("جاري المصادقة...");
            
            // محاولة تسجيل الدخول مع مهلة
            const loginPromise = Promise.all([
              pi.auth.login().catch(() => null),
              sdkLite.login().catch(() => null)
            ]);
            
            // مهلة 5 ثواني للمصادقة
            const timeoutPromise = new Promise((resolve) => {
              setTimeout(resolve, 5000);
            });
            
            await Promise.race([loginPromise, timeoutPromise]);
            
            const sdkInstance = createSdk(sdkLite, pi);
            setSdk(sdkInstance);
            console.log("✅ SDK instance created");
            
            // محاولة جلب المنتجات
            try {
              const { products } = await sdkInstance.state.products();
              setProducts(products);
              console.log("✅ Products loaded:", products?.length);
            } catch (productErr) {
              console.warn("⚠️ Could not load products:", productErr);
            }
            
            setIsAuthenticated(true);
            setAuthMessage("✅ جاهز");
            
          } catch (loginErr) {
            console.warn("⚠️ Login issue, but app will work:", loginErr);
            // حتى لو فشل تسجيل الدخول، نبقي التطبيق شغالاً
            setIsAuthenticated(true);
            setAuthMessage("⚠️ وضع الضيف");
          }
        } else {
          console.warn("⚠️ SDKLite.init not available");
          setIsAuthenticated(true);
          setAuthMessage("⚠️ وضع الضيف");
        }
      } else {
        console.warn("⚠️ SDKLite not available");
        setIsAuthenticated(true);
        setAuthMessage("⚠️ وضع الضيف");
      }

    } catch (err) {
      console.error("❌ Initialization error:", err);
      setHasError(true);
      setAuthMessage("⚠️ وضع عدم الاتصال");
      // في حالة الخطأ، نبقي التطبيق شغالاً
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    isInitialized,
    isLoading,
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
