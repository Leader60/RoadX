"use client";

import { useRoadX } from "@/contexts/roadx-context";
import { cx } from "./ui";
import { IconSpinner } from "./icons";

export function ToastHost() {
  const { toasts } = useRoadX();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[70] flex flex-col items-center gap-2 px-4 rx-safe-top">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cx(
            "rx-toast-in pointer-events-auto max-w-sm rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg",
            t.tone === "success" && "bg-success text-navy-deep",
            t.tone === "error" && "bg-destructive text-destructive-foreground",
            t.tone === "default" && "bg-card text-card-foreground border border-border",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function StorageNotice() {
  const { storageNotice } = useRoadX();
  if (!storageNotice) return null;
  return (
    <div className="fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      <div className="rx-fade-in flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground shadow-lg">
        <span className="h-2 w-2 rounded-full bg-gold rx-pulse" />
        يجري حفظ تفاعلك في حساب Pi...
      </div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="text-3xl font-bold rx-gold-text tracking-widest">RoadX</div>
      <IconSpinner size={28} className="text-gold" />
      <p className="text-sm text-muted-foreground">جارٍ تحميل الموسيقى...</p>
    </div>
  );
}
