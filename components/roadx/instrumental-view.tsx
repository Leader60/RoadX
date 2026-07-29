"use client";

import { useState, useEffect } from "react";
import { INSTRUMENTAL_SHEET } from "@/lib/roadx/data";
import { SectionTitle, EmptyState } from "./ui";
import { IconList } from "./icons";

interface InstrumentalTrack {
  id: string;
  title: string;
  artist: string;
  image: string;
  youtube: string;
}

export function InstrumentalView({ onOpenTrack }: { onOpenTrack: (id: string) => void }) {
  const [tracks, setTracks] = useState<InstrumentalTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { fetchTracks(); }, []);

  const fetchTracks = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(INSTRUMENTAL_SHEET);
      const csv = await res.text();
      const lines = csv.trim().split("\n");
      if (lines.length < 2) { setTracks([]); setLoading(false); return; }
      const headers = lines[0].split(",").map((h: string) => h.trim());
      const data: InstrumentalTrack[] = lines.slice(1).map((line: string) => {
        const values = line.split(",").map((v: string) => v.trim().replace(/^"|"$/g, ""));
        const obj: Record<string, string> = {};
        headers.forEach((h: string, i: number) => { obj[h] = values[i] || ""; });
        return { id: obj.id || "", title: obj.title || "", artist: obj.artist || "", image: obj.image || "", youtube: obj.youtube || "" };
      });
      setTracks(data.filter(t => t.title));
    } catch { setError("فشل جلب البيانات"); } finally { setLoading(false); }
  };

  return (
    <div className="rx-fade-in flex flex-col gap-4 px-4 py-5 pb-6">
      <SectionTitle>مقطوعات موسيقية ({tracks.length})</SectionTitle>
      {loading && <div className="text-center py-12"><div className="h-10 w-10 mx-auto rounded-full border-4 border-gold border-t-transparent rx-spin mb-3" /><p className="text-muted-foreground text-sm">جاري التحميل...</p></div>}
      {error && <div className="text-center py-12 text-red-400"><p className="text-sm">{error}</p><button onClick={fetchTracks} className="mt-3 px-5 py-2 bg-gold text-gold-foreground rounded-xl rx-press text-sm">إعادة المحاولة</button></div>}
      {!loading && !error && tracks.length > 0 && (
        <div className="flex flex-col gap-2">
          {tracks.map((t, i) => (
            <a key={t.id || i} href={t.youtube || "#"} target="_blank" rel="noopener noreferrer" className="rx-press flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5 text-right transition-colors hover:border-gold/50">
              <span className="w-5 shrink-0 text-center text-sm font-bold text-gold">{i + 1}</span>
              <img src={t.image || "/placeholder.svg"} alt={t.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1"><p className="rx-clamp-1 text-sm font-bold text-foreground">{t.title}</p><p className="rx-clamp-1 text-xs text-muted-foreground">{t.artist}</p></div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gold shrink-0"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>
            </a>
          ))}
        </div>
      )}
      {!loading && !error && tracks.length === 0 && <EmptyState icon={<IconList size={34} />} title="لا توجد مقطوعات" hint="لم يتم إضافة مقطوعات بعد" />}
    </div>
  );
}
