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
  isLoading: boolean;
  authenticate: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("جاري التهيئة...");
  const [hasError, setHasError] = useState(false);
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [restoredPurchases, setRestoredPurchases] = useState<
    UserPurchaseBalance[] | null
  >(null);

  // ✅ دالة المصادقة المنفصلة
  const authenticate = async (): Promise<void> => {
    try {
      setAuthMessage("جاري المصادقة مع Pi Network...");
      
      if (typeof window !== 'undefined' && (window as any).Pi) {
        const Pi = (window as any).Pi;
        
        // طلب المصادقة مع الصلاحيات المطلوبة
        const authResponse = await Pi.authenticate([
          'username',
          'payments',
          'wallet_address'
        ]);
        
        console.log("✅ تمت المصادقة بنجاح:", authResponse);
        setIsAuthenticated(true);
        setAuthMessage("✅ تم المصادقة");
        setHasError(false);
      } else {
        throw new Error("Pi SDK غير متوفر");
      }
    } catch (err: any) {
      console.error("❌ فشل المصادقة:", err);
      setHasError(true);
      setAuthMessage(`⚠️ فشل المصادقة: ${err.message || "يرجى المحاولة مرة أخرى"}`);
      setIsAuthenticated(false);
      throw err;
    }
  };

  const initialize = async () => {
    setHasError(false);
    setIsLoading(true);
    setAuthMessage("جاري تحميل SDK...");

    // ✅ مهلة أمان: بعد 3 ثواني، نفتح التطبيق مهما كان
    const fallbackTimeout = setTimeout(() => {
      console.log("⏳ Fallback: Opening app after timeout");
      setIsLoading(false);
      setAuthMessage("⚠️ وضع عدم الاتصال");
    }, 3000);

    try {
      // تحميل Pi SDK
      await loadPiSDK();
      
      if (typeof window !== 'undefined' && (window as any).Pi) {
        const Pi = (window as any).Pi;
        
        // تهيئة Pi SDK
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
      
      if (typeof window !== 'undefined' && (window as any).SDKLite) {
        const SDKLite = (window as any).SDKLite;
        
        if (SDKLite.init) {
          const sdkLite = await SDKLite.init();
          console.log("✅ SDK Lite initialized");
          
          const pi = buildPiSdk();
          const sdkInstance = createSdk(sdkLite, pi);
          setSdk(sdkInstance);
          
          // محاولة جلب المنتجات
          try {
            const { products } = await sdkInstance.state.products();
            setProducts(products);
            console.log("✅ Products loaded:", products?.length);
          } catch (productErr) {
            console.warn("⚠️ Could not load products:", productErr);
          }
          
          // ✅ محاولة المصادقة التلقائية (حاول ولا توقف التطبيق إذا فشلت)
          try {
            setAuthMessage("جاري المصادقة التلقائية...");
            // نحاول المصادقة ولكن لا ننتظر طويلاً
            const authPromise = authenticate();
            const timeoutPromise = new Promise((resolve) => {
              setTimeout(() => {
                console.log("⏳ Authentication timeout, continuing...");
                resolve(null);
              }, 5000);
            });
            
            await Promise.race([authPromise, timeoutPromise]);
          } catch (authErr) {
            console.warn("⚠️ Auto-authentication timeout, user can authenticate manually");
            // لا نوقف التطبيق إذا فشلت المصادقة التلقائية
            setAuthMessage("⚠️ اضغط على زر الدفع للمصادقة");
          }
        }
      }
    } catch (err) {
      console.error("❌ Initialization error:", err);
      setHasError(true);
      setAuthMessage("⚠️ وضع عدم الاتصال - بعض الميزات غير متوفرة");
    } finally {
      clearTimeout(fallbackTimeout);
      setIsLoading(false);
      // نضمن أن التطبيق مفتوح دائماً
      setIsAuthenticated(prev => prev || false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    isLoading,
    authMessage,
    hasError,
    sdk,
    products,
    restoredPurchases,
    reinitialize: initialize,
    authenticate, // ✅ إضافة دالة المصادقة
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
