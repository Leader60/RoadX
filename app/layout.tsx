import type React from "react";
import type { Metadata, Viewport } from "next";
import { Amiri } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { AppWrapper } from "@/components/app-wrapper";
import Script from "next/script";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "RoadX — منصة الموسيقى العالمية",
  description: "استمتع بأقوى قوائم الأغاني والميزات الحصرية مع حساب Premium",
  generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: "#f8f9fa", // تم تغيير لون الشريط العلوي ليتناسب مع الأوف وايت
  userScalable: false,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* 1. جعل خلفية الشاشة الكاملة باللون الأوف وايت f8f9fa# */
    <html lang="ar" dir="rtl" className={`bg-[#f8f9fa] ${amiri.variable} ${GeistMono.variable}`}>
      <head>
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
        />
      </head>
      /* 2. جعل الجوانب تتوسع وتتوسط التطبيق داخل الشاشات الكبيرة */
      <body className="font-sans min-h-screen flex justify-center bg-[#f8f9fa]">
        
        {/* 3. حاوية التطبيق الرئيسية: مقيدة بعرض الموبايل ومُعطاة relative لضبط القائمة الجانبية */}
        <div className="relative w-full max-w-[430px] min-h-screen bg-background text-foreground shadow-2xl overflow-x-hidden border-x border-black/5">
          <AppWrapper>{children}</AppWrapper>
        </div>

      </body>
    </html>
  );
}
