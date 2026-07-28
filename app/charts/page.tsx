"use client";

import { useState, useEffect, useRef } from "react";
import { COUNTRIES, SITE_NAME } from "@/lib/constants";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  lastfm_url: string;
  youtube_url: string;
  preview_url: string | null;
  duration_ms: number;
  rank: number;
  listeners: string;
}

export default function ChartsPage() {
  const [selectedCountry, setSelectedCountry] = useState("global");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);

  const fetchTracks = async (countryCode: string) => {
    setLoading(true);
    setError("");
    setActiveTrack(null);
    try {
      const res = await fetch(`/api/roadx/deezer/top-tracks?country=${countryCode}&limit=20`);
      if (!res.ok) throw new Error("فشل جلب البيانات");
      const data = await res.json();
      setTracks(data.tracks);
    } catch (err: any) {
      setError(err.message || "حدث خطأ ما");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks(selectedCountry);
  }, [selectedCountry]);

  const formatListeners = (num: string) => {
    const n = parseInt(num);
    if (!n) return "";
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(0) + "K";
    return num;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
            className="rx-press inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-gold hover:bg-gold hover:text-gold-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V21h14V9.5" />
            </svg>
            الرئيسية
          </a>
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gold">{SITE_NAME}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">أكثر المقاطع رواجاً حسب كل دولة</p>
          </div>
          <div className="w-[100px]" />
        </div>

        {/* Country Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country.code)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all rx-press text-center ${
                  selectedCountry === country.code
                    ? "bg-gold text-gold-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active Track Player */}
        {activeTrack && (
          <div className="mb-4 p-4 rounded-2xl border border-gold/30 bg-card">
            <div className="flex items-center gap-4">
              <img
                src={activeTrack.image || "/placeholder.svg"}
                alt={activeTrack.title}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0 text-right">
                <p className="font-bold text-gold">{activeTrack.title}</p>
                <p className="text-xs text-muted-foreground">{activeTrack.artist}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatListeners(activeTrack.listeners)} مستمع
                </p>
              </div>
              <button
                onClick={() => setActiveTrack(null)}
                className="text-muted-foreground hover:text-gold"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            {activeTrack.youtube_url && (
              <div className="mt-3 aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={activeTrack.youtube_url.replace("https://www.last.fm/music/", "https://www.youtube.com/embed/")}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="h-12 w-12 mx-auto rounded-full border-4 border-gold border-t-transparent rx-spin mb-4" />
            <p className="text-muted-foreground">جاري تحميل القائمة...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12 text-red-400">
            <p>{error}</p>
            <button
              onClick={() => fetchTracks(selectedCountry)}
              className="mt-4 px-6 py-2 bg-gold text-gold-foreground rounded-xl rx-press"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Tracks List */}
        {!loading && !error && tracks.length > 0 && (
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:border-gold/50 transition-all group"
              >
                {/* Rank */}
                <span className="w-8 text-center text-lg font-bold text-gold shrink-0">
                  {index + 1}
                </span>

                {/* Play Button */}
                <button
                  onClick={() => setActiveTrack(track)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-gold-foreground transition-all rx-press shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </button>

                {/* Image */}
                {track.image && (
                  <img
                    src={track.image || "/placeholder.svg"}
                    alt={track.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                )}

                {/* Info */}
                <a
                  href={track.lastfm_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 text-right"
                >
                  <p className="font-bold text-foreground rx-clamp-1 group-hover:text-gold transition-colors">
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground rx-clamp-1">{track.artist}</p>
                </a>

                {/* Listeners */}
                {track.listeners && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatListeners(track.listeners)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tracks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>لا توجد بيانات متاحة حالياً لهذه الدولة</p>
          </div>
        )}
      </div>
    </div>
  );
}
