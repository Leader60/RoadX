"use client";

import { useState, useEffect } from "react";
import { COUNTRIES, SITE_NAME } from "@/lib/constants";

interface Track {
  id: string;
  title: string;
  artist: string;
  image: string;
  lastfm_url: string;
  youtube_search: string;
  rank: number;
  listeners: string;
}

export default function ChartsPage() {
  const [selectedCountry, setSelectedCountry] = useState("global");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const fetchTracks = async (countryCode: string) => {
    setLoading(true);
    setError("");
    setActiveTrack(null);
    setVideoId(null);
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

  const handlePlay = async (track: Track) => {
    setActiveTrack(track);
    setVideoId(null);
    setSearching(true);

    try {
      const query = encodeURIComponent(`${track.artist} ${track.title} audio`);
      const res = await fetch(`https://www.youtube.com/results?search_query=${query}`);
      const html = await res.text();
      const match = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (match) {
        setVideoId(match[1]);
      }
    } catch {}
    setSearching(false);
  };

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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="rx-press inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-bold text-gold hover:bg-gold hover:text-gold-foreground transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>
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
                  selectedCountry === country.code ? "bg-gold text-gold-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>

        {/* YouTube Player */}
        {activeTrack && (
          <div className="mb-4 p-4 rounded-2xl border border-gold/30 bg-card">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                {activeTrack.image ? (
                  <img src={activeTrack.image} alt={activeTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold"><circle cx="12" cy="12" r="10"/><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none"/></svg>
                )}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="font-bold text-gold rx-clamp-1">{activeTrack.title}</p>
                <p className="text-xs text-muted-foreground rx-clamp-1">{activeTrack.artist}</p>
              </div>
              <button onClick={() => { setActiveTrack(null); setVideoId(null); }} className="text-muted-foreground hover:text-gold shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </div>
            {searching ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="h-8 w-8 mx-auto rounded-full border-4 border-gold border-t-transparent rx-spin mb-2" />
                جاري البحث عن الفيديو...
              </div>
            ) : videoId ? (
              <div className="aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay"
                />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                لم يتم العثور على فيديو.{" "}
                <a href={activeTrack.youtube_search} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">ابحث في YouTube</a>
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
            <button onClick={() => fetchTracks(selectedCountry)} className="mt-4 px-6 py-2 bg-gold text-gold-foreground rounded-xl rx-press">إعادة المحاولة</button>
          </div>
        )}

        {/* Tracks */}
        {!loading && !error && tracks.length > 0 && (
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card hover:border-gold/50 transition-all group">
                <span className="w-8 text-center text-lg font-bold text-gold shrink-0">{index + 1}</span>

                <button onClick={() => handlePlay(track)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-gold-foreground transition-all rx-press shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>
                </button>

                {/* صورة الأغنية */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {track.image ? (
                    <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/50"><circle cx="12" cy="12" r="10"/><path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none"/></svg>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-right">
                  <p className="font-bold text-foreground rx-clamp-1 group-hover:text-gold transition-colors">{track.title}</p>
                  <p className="text-xs text-muted-foreground rx-clamp-1">{track.artist}</p>
                </div>

                <span className="text-[10px] text-muted-foreground shrink-0">{formatListeners(track.listeners)}</span>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && tracks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground"><p>لا توجد بيانات متاحة</p></div>
        )}
      </div>
    </div>
  );
}
