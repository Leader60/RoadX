import type React from "react";
import type { Metadata, Viewport } from "next";
import { Amiri } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { AppWrapper } from "@/components/app-wrapper";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "Made with App Studio",
  description: "RoadX — منصة الموسيقى العالمية",
    generator: 'v0.app'
};

export const viewport: Viewport = {
  themeColor: "#101a33",
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
    <html lang="ar" dir="rtl" className={`bg-background ${amiri.variable} ${GeistMono.variable}`}>
      <body className="font-sans">
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
