"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PLAYLISTS } from "@/lib/roadx/data";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  deezer_url: string;
  preview_url: string | null;
  duration_ms: number;
}

export default function PlaylistPage() {
  const { id } = useParams();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const playlist = PLAYLISTS.find((p) => p.id === id);

  useEffect(() => {
    if (id) fetchTracks();
  }, [id]);

  const fetchTracks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/roadx/deezer/playlist?id=${id}&limit=30`);
      if (!res.ok) throw new Error("فشل جلب البيانات");
      const data = await res.json();
      setTracks(data.tracks);
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
            className="rx-press inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-gold hover:bg-gold hover:text-gold-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
            الرئيسية
          </a>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gold">
              {playlist?.title || "قائمة التشغيل"}
            </h1>
            {playlist?.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{playlist.description}</p>
            )}
          </div>
          <div className="w-[100px]" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="h-12 w-12 mx-auto rounded-full border-4 border-gold border-t-transparent rx-spin mb-4" />
            <p className="text-muted-foreground">جاري تحميل الأغاني...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12 text-red-400">
            <p>{error}</p>
            <button onClick={fetchTracks} className="mt-4 px-6 py-2 bg-gold text-gold-foreground rounded-xl rx-press">
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Tracks */}
        {!loading && !error && tracks.length > 0 && (
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <a
                key={track.id}
                href={track.deezer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:border-gold/50 transition-all group"
              >
                <span className="w-8 text-center text-lg font-bold text-gold shrink-0">{index + 1}</span>

                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gold/10 text-gold shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>
                </div>

                <img
                  src={track.image || "/placeholder.svg"}
                  alt={track.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />

                <div className="flex-1 min-w-0 text-right">
                  <p className="font-bold text-foreground rx-clamp-1 group-hover:text-gold transition-colors">{track.title}</p>
                  <p className="text-xs text-muted-foreground rx-clamp-1">{track.artist}</p>
                </div>

                <span className="text-xs text-muted-foreground shrink-0">{formatTime(track.duration_ms)}</span>
              </a>
            ))}
          </div>
        )}

        {!loading && !error && tracks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>لا توجد أغاني في هذه القائمة</p>
          </div>
        )}
      </div>
    </div>
  );
}
