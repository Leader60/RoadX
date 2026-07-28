"use client";

import { useState, useEffect } from "react";
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
} from "./icons";

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
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/roadx/subscriber-count")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  const go = (t: TabId) => {
    onNavigate(t);
    setOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 grid grid-cols-3 items-center border-b border-gold/25 bg-background/95 px-4 py-3 backdrop-blur rx-safe-top h-[70px]">
        {/* 1. الجانب الأيمن (القائمة والمشتركين): متمركز شاقولياً */}
        <div className="flex items-center justify-start gap-2 h-full">
          <IconButton onClick={() => setOpen(true)} aria-label="القائمة">
            <IconMenu size={24} />
          </IconButton>
          {count !== null && (
            <span className="text-[12px] font-bold text-gold border border-gold/30 rounded-full px-2 py-1 whitespace-nowrap">
              {count} مشترك
            </span>
          )}
        </div>

        {/* 2. المنتصف (النص): متمركز شاقولياً بفضل layout الهيدر */}
        <div className="text-center leading-tight">
          <div className="text-xl font-bold rx-gold-text tracking-wide">RoadX</div>
          <div className="text-[12px] text-muted-foreground">منصة الموسيقى العالمية</div>
        </div>

        {/* 3. الجانب الأيسر (الشعار): تم إضافة classes لتوسطه شاقولياً */}
        <div className="flex items-center justify-end h-full">
          <img
            src="/roadx-logo.png"
            alt="RoadX"
            className="h-10 w-auto object-contain my-auto self-center block"
          />
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

              {/* رابط سياسة الخصوصية وشروط الاستخدام */}
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  window.location.href = "/privacy";
                }}
                className="rx-press flex items-center gap-3 rounded-xl px-3 py-3 text-base font-bold text-foreground transition-colors hover:bg-secondary border-t border-gold/20 mt-2 pt-3"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3 5 5.5v4.5c0 5.5 7 9 7 9s7-3.5 7-9V5.5L12 3Z" />
                </svg>
                سياسة الخصوصية وشروط الاستخدام
              </a>
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
