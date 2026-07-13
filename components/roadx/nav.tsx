"use client";

import { useState } from "react";
import { NAV_ITEMS, type TabId } from "@/lib/roadx/data";
import { cx, IconButton } from "./ui";
import {
  IconMenu,
  IconClose,
  IconHome,
  IconDisc,
  IconList,
  IconStack,
  IconInfo,
  IconMail,
  IconMusicNote,
} from "./icons";
import { PaymentButton, SubscriptionButton } from "./payment-button";

const TAB_ICONS: Record<TabId, typeof IconHome> = {
  home: IconHome,
  music: IconDisc,
  songs: IconList,
  playlists: IconStack,
  about: IconInfo,
  contact: IconMail,
};

export function AppHeader({
  tab,
  onNavigate,
}: {
  tab: TabId;
  onNavigate: (t: TabId) => void;
}) {
  const [open, setOpen] = useState(false);

  const go = (t: TabId) => {
    onNavigate(t);
    setOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gold/25 bg-background/95 px-4 py-3 backdrop-blur rx-safe-top">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-navy-deep text-gold">
            <IconMusicNote size={20} />
          </span>
          <div className="leading-tight">
            <div className="text-xl font-bold rx-gold-text tracking-wide">RoadX</div>
            <div className="text-[10px] text-muted-foreground">منصة الموسيقى العالمية</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SubscriptionButton />
          <PaymentButton />
          <IconButton onClick={() => setOpen(true)} aria-label="القائمة">
            <IconMenu size={24} />
          </IconButton>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-navy-deep/70 rx-fade-in"
            onClick={() => setOpen(false)}
          />
          <nav className="rx-slide-up absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col border-l border-gold/25 bg-card shadow-2xl rx-safe-top">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div className="text-xl font-bold rx-gold-text tracking-wide">RoadX</div>
              <IconButton onClick={() => setOpen(false)} aria-label="إغلاق">
                <IconClose size={22} />
              </IconButton>
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 rx-no-scrollbar">
              {NAV_ITEMS.map((item) => {
                const Icon = TAB_ICONS[item.id];
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    className={cx(
                      "rx-press flex items-center gap-3 rounded-xl px-3 py-3 text-base font-bold transition-colors",
                      active
                        ? "bg-gold text-gold-foreground"
                        : "text-foreground hover:bg-secondary",
                    )}
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border p-4 text-center text-xs text-muted-foreground">
              أحدث الإصدارات الموسيقية العالمية
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

export function BottomNav({
  tab,
  onNavigate,
}: {
  tab: TabId;
  onNavigate: (t: TabId) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-around border-t border-gold/25 bg-background/95 px-1 py-1.5 backdrop-blur rx-safe-bottom">
      {NAV_ITEMS.map((item) => {
        const Icon = TAB_ICONS[item.id];
        const active = tab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cx(
              "rx-press flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-bold transition-colors",
              active ? "text-gold" : "text-muted-foreground",
            )}
          >
            <Icon size={20} />
            <span className="rx-clamp-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
