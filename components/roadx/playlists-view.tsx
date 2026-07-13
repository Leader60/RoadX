"use client";

import { useState } from "react";
import {
  PLAYLISTS,
  TRACK_MAP,
  imageUrl,
  toArabicNum,
  type Playlist,
} from "@/lib/roadx/data";
import { Card, Pill, SectionTitle, cx } from "./ui";
import { IconStack, IconChevronLeft, IconLock, IconPlay, IconSparkle } from "./icons";

export function PlaylistsView({ onOpenTrack }: { onOpenTrack: (id: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = openId ? PLAYLISTS.find((p) => p.id === openId) ?? null : null;

  if (active) {
    return (
      <PlaylistDetail
        playlist={active}
        onBack={() => setOpenId(null)}
        onOpenTrack={onOpenTrack}
      />
    );
  }

  return (
    <div className="rx-fade-in flex flex-col gap-4 px-4 py-5 pb-6">
      <div>
        <SectionTitle>
          <span className="inline-flex items-center gap-1">
            <IconSparkle size={16} className="text-gold" /> قوائم التشغيل الحصرية
          </span>
        </SectionTitle>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          مجموعات منتقاة بعناية — متاحة بالكامل للجميع في هذه النسخة.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PLAYLISTS.map((p) => (
          <PlaylistCard key={p.id} playlist={p} onOpen={() => setOpenId(p.id)} />
        ))}
      </div>
    </div>
  );
}

function PlaylistCard({ playlist, onOpen }: { playlist: Playlist; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="rx-press flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-right transition-colors hover:border-gold/50"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <img
          src={imageUrl(playlist.query, 320, 320) || "/placeholder.svg"}
          alt={playlist.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
        {playlist.premium && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-navy-deep/85 px-2 py-0.5 text-[10px] font-bold text-gold">
            <IconLock size={11} /> حصري
          </span>
        )}
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground rx-nums">
          {toArabicNum(playlist.trackIds.length)} مقطوعات
        </span>
      </div>
      <div className="p-2.5">
        <p className="rx-clamp-1 text-sm font-bold text-foreground">{playlist.title}</p>
        <p className="rx-clamp-2 mt-0.5 text-xs text-muted-foreground">
          {playlist.description}
        </p>
      </div>
    </button>
  );
}

function PlaylistDetail({
  playlist,
  onBack,
  onOpenTrack,
}: {
  playlist: Playlist;
  onBack: () => void;
  onOpenTrack: (id: string) => void;
}) {
  const tracks = playlist.trackIds.map((id) => TRACK_MAP[id]).filter(Boolean);
  return (
    <div className="rx-fade-in flex flex-col gap-4 pb-6">
      <div className="relative">
        <img
          src={imageUrl(playlist.query, 640, 360) || "/placeholder.svg"}
          alt={playlist.title}
          className="h-48 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-navy-deep/30" />
        <button
          onClick={onBack}
          aria-label="رجوع"
          className="rx-press absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep/70 text-gold"
        >
          <IconChevronLeft size={22} />
        </button>
        <div className="absolute bottom-3 right-4 left-4">
          <Pill className="mb-1 bg-gold/20 text-gold">قائمة حصرية</Pill>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            {playlist.title}
          </h1>
        </div>
      </div>
      <div className="px-4">
        <p className="text-sm text-muted-foreground text-pretty">
          {playlist.description}
        </p>
      </div>
      <div className="flex flex-col gap-2 px-4">
        {tracks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onOpenTrack(t.id)}
            className="rx-press flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 text-right transition-colors hover:border-gold/50"
          >
            <span className="w-5 shrink-0 text-center text-sm font-bold text-gold rx-nums">
              {toArabicNum(i + 1)}
            </span>
            <img
              src={imageUrl(t.query, 120, 120) || "/placeholder.svg"}
              alt={t.title}
              className="h-12 w-12 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="rx-clamp-1 text-sm font-bold text-foreground">{t.title}</p>
              <p className="rx-clamp-1 text-xs text-muted-foreground">{t.artist}</p>
            </div>
            <span className="text-gold">
              <IconPlay size={18} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
