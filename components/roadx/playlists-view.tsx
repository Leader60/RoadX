"use client";

import { useState, useEffect } from "react";
import {
  PLAYLISTS,
  ARABIC_PLAYLIST,
  ARABIC_PLAYLIST_SHEET,
  GREEK_PLAYLIST,
  GREEK_PLAYLIST_SHEET,
  imageUrl,
  type Playlist,
} from "@/lib/roadx/data";
import { SectionTitle } from "./ui";
import { IconSparkle, IconChevronLeft, IconPlay } from "./icons";

interface DeezerTrack {
  id: string;
  title: string;
  artist: string;
  image: string;
  deezer_url: string;
  duration_ms: number;
}

interface GoogleSheetTrack {
  id: string;
  title: string;
  artist: string;
  image: string;
  youtube: string;
}

export function PlaylistsView({ onOpenTrack }: { onOpenTrack: (id: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (openId === "arabic-gs") {
    return <GoogleSheetDetail playlist={ARABIC_PLAYLIST} sheetUrl={ARABIC_PLAYLIST_SHEET} onBack={() => setOpenId(null)} />;
  }

  if (openId === "greek-gs") {
    return <GoogleSheetDetail playlist={GREEK_PLAYLIST} sheetUrl={GREEK_PLAYLIST_SHEET} onBack={() => setOpenId(null)} />;
  }

  const active = openId ? PLAYLISTS.find((p) => p.id === openId) ?? null : null;
  if (active) {
    return <PlaylistDetail playlist={active} onBack={() => setOpenId(null)} />;
  }

  return (
    <div className="rx-fade-in flex flex-col gap-4 px-4 py-5 pb-6">
      <SectionTitle>
        <span className="inline-flex items-center gap-1">
          <IconSparkle size={16} className="text-gold" /> قوائم التشغيل الحصرية
        </span>
      </SectionTitle>

      <button onClick={() => setOpenId("arabic-gs")} className="rx-press flex flex-col overflow-hidden rounded-2xl border border-gold/30 bg-card transition-colors hover:border-gold">
        <div className="relative h-40 w-full overflow-hidden">
          <img src={imageUrl(ARABIC_PLAYLIST.query, 640, 360)} alt={ARABIC_PLAYLIST.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 to-transparent" />
          <div className="absolute bottom-3 right-3 left-3">
            <h3 className="text-xl font-bold text-foreground">{ARABIC_PLAYLIST.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{ARABIC_PLAYLIST.description}</p>
          </div>
        </div>
      </button>

      <button onClick={() => setOpenId("greek-gs")} className="rx-press flex flex-col overflow-hidden rounded-2xl border border-gold/30 bg-card transition-colors hover:border-gold">
        <div className="relative h-40 w-full overflow-hidden">
          <img src={imageUrl(GREEK_PLAYLIST.query, 640, 360)} alt={GREEK_PLAYLIST.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 to-transparent" />
          <div className="absolute bottom-3 right-3 left-3">
            <h3 className="text-xl font-bold text-foreground">{GREEK_PLAYLIST.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{GREEK_PLAYLIST.description}</p>
          </div>
        </div>
      </button>

      <p className="text-sm text-muted-foreground">قوائم عالمية</p>
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
    <button onClick={onOpen} className="rx-press flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-right transition-colors hover:border-gold/50">
      <div className="relative aspect-square w-full overflow-hidden">
        <img src={`https://e-cdns-images.dzcdn.net/images/playlist/${playlist.id}/500x500-000000-80-0-0.jpg`} alt={playlist.title} className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = imageUrl(playlist.query, 320, 320); }} />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
      </div>
      <div className="p-2.5">
        <p className="rx-clamp-1 text-sm font-bold text-foreground">{playlist.title}</p>
        <p className="rx-clamp-2 mt-0.5 text-xs text-muted-foreground">{playlist.description}</p>
      </div>
    </button>
  );
}

function GoogleSheetDetail({ playlist, sheetUrl, onBack }: { playlist: Playlist; sheetUrl: string; onBack: () => void }) {
  const [tracks, setTracks] = useState<GoogleSheetTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchTracks(); }, []);

  const fetchTracks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(sheetUrl);
      const csv = await res.text();
      const lines = csv.trim().split("\n");
      if (lines.length < 2) { setTracks([]); setLoading(false); return; }
      const headers = lines[0].split(",").map((h: string) => h.trim());
      const data: GoogleSheetTrack[] = lines.slice(1).map((line: string) => {
        const values = line.split(",").map((v: string) => v.trim().replace(/^"|"$/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((h: string, i: number) => { obj[h] = values[i] || ""; });
        return {
          id: obj.id || "",
          title: obj.title || "",
          artist: obj.artist || "",
          image: obj.image || "",
          youtube: obj.youtube || "",
        };
      });
      setTracks(data.filter(t => t.title));
    } catch { setError("فشل جلب البيانات"); } finally { setLoading(false); }
  };

  return (
    <div className="rx-fade-in flex flex-col gap-4 pb-6">
      <div className="relative">
        <img src={imageUrl(playlist.query, 640, 360)} alt={playlist.title} className="h-48 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-navy-deep/30" />
        <button onClick={onBack} className="rx-press absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep/70 text-gold"><IconChevronLeft size={22} /></button>
        <div className="absolute bottom-3 right-4 left-4"><h1 className="text-2xl font-bold text-foreground">{playlist.title}</h1></div>
      </div>
      {loading && <div className="text-center py-12"><div className="h-10 w-10 mx-auto rounded-full border-4 border-gold border-t-transparent rx-spin mb-3" /><p className="text-muted-foreground text-sm">جاري التحميل...</p></div>}
      {error && <div className="text-center py-12 text-red-400"><p className="text-sm">{error}</p><button onClick={fetchTracks} className="mt-3 px-5 py-2 bg-gold text-gold-foreground rounded-xl rx-press text-sm">إعادة المحاولة</button></div>}
      {!loading && !error && tracks.length > 0 && (
        <div className="flex flex-col gap-2 px-4">
          {tracks.map((t, i) => (
            <a key={t.id || i} href={t.youtube || "#"} target="_blank" rel="noopener noreferrer" className="rx-press flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 text-right transition-colors hover:border-gold/50">
              <span className="w-5 shrink-0 text-center text-sm font-bold text-gold">{i + 1}</span>
              <img src={t.image || "/placeholder.svg"} alt={t.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1"><p className="rx-clamp-1 text-sm font-bold text-foreground">{t.title}</p><p className="rx-clamp-1 text-xs text-muted-foreground">{t.artist}</p></div>
              <span className="text-gold"><IconPlay size={18} /></span>
            </a>
          ))}
        </div>
      )}
      {!loading && !error && tracks.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm"><p>لا توجد أغاني</p></div>}
    </div>
  );
}

function PlaylistDetail({ playlist, onBack }: { playlist: Playlist; onBack: () => void }) {
  const [tracks, setTracks] = useState<DeezerTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchTracks(); }, [playlist.id]);

  const fetchTracks = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/roadx/deezer/playlist?id=${playlist.id}&limit=30`);
      if (!res.ok) throw new Error("فشل جلب البيانات");
      const data = await res.json();
      setTracks(data.tracks);
    } catch { setError("حدث خطأ"); } finally { setLoading(false); }
  };

  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="rx-fade-in flex flex-col gap-4 pb-6">
      <div className="relative">
        <img src={`https://e-cdns-images.dzcdn.net/images/playlist/${playlist.id}/1000x500-000000-80-0-0.jpg`} alt={playlist.title} className="h-48 w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = imageUrl(playlist.query, 640, 360); }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-navy-deep/30" />
        <button onClick={onBack} className="rx-press absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy-deep/70 text-gold"><IconChevronLeft size={22} /></button>
        <div className="absolute bottom-3 right-4 left-4"><h1 className="text-2xl font-bold text-foreground">{playlist.title}</h1></div>
      </div>
      {loading && <div className="text-center py-12"><div className="h-10 w-10 mx-auto rounded-full border-4 border-gold border-t-transparent rx-spin mb-3" /><p className="text-muted-foreground text-sm">جاري التحميل...</p></div>}
      {error && <div className="text-center py-12 text-red-400"><p className="text-sm">{error}</p><button onClick={fetchTracks} className="mt-3 px-5 py-2 bg-gold text-gold-foreground rounded-xl rx-press text-sm">إعادة المحاولة</button></div>}
      {!loading && !error && tracks.length > 0 && (
        <div className="flex flex-col gap-2 px-4">
          {tracks.map((t, i) => (
            <a key={t.id} href={t.deezer_url} target="_blank" rel="noopener noreferrer" className="rx-press flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 text-right transition-colors hover:border-gold/50">
              <span className="w-5 shrink-0 text-center text-sm font-bold text-gold">{i + 1}</span>
              <img src={t.image || "/placeholder.svg"} alt={t.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1"><p className="rx-clamp-1 text-sm font-bold text-foreground">{t.title}</p><p className="rx-clamp-1 text-xs text-muted-foreground">{t.artist}</p></div>
              <span className="text-xs text-muted-foreground">{formatTime(t.duration_ms)}</span>
              <span className="text-gold"><IconPlay size={18} /></span>
            </a>
          ))}
        </div>
      )}
      {!loading && !error && tracks.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm"><p>لا توجد أغاني</p></div>}
    </div>
  );
}
