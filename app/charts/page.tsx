"use client";

import { useState, useEffect, useRef } from "react";
import { COUNTRIES, SITE_NAME } from "@/lib/constants";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  image: string;
  deezer_url: string;
  preview_url: string | null;
  duration_ms: number;
  rank: number;
}

export default function ChartsPage() {
  const [selectedCountry, setSelectedCountry] = useState("global");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchTracks = async (countryCode: string) => {
    setLoading(true);
    setError("");
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
    setPlayingId(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [selectedCountry]);

  const togglePlay = (track: Track) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (track.preview_url) {
        const audio = new Audio(track.preview_url);
        audio.play();
        audioRef.current = audio;
        setPlayingId(track.id);
        audio.onended = () => setPlayingId(null);
      }
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold mb-2">{SITE_NAME}</h1>
          <p className="text-sm text-muted-foreground">أكثر المقاطع رواجاً حسب كل دولة</p>
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
                {track.preview_url && (
                  <button
                    onClick={() => togglePlay(track)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gold/10 text-gold hover:bg-gold hover:text-gold-foreground transition-all rx-press shrink-0"
                  >
                    {playingId === track.id ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                      </svg>
                    )}
                  </button>
                )}

                {/* Image */}
                <a
                  href={track.deezer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <img
                    src={track.image || "/placeholder.svg"}
                    alt={track.title}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                </a>

                {/* Info */}
                <a
                  href={track.deezer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-0 text-right"
                >
                  <p className="font-bold text-foreground rx-clamp-1 group-hover:text-gold transition-colors">
                    {track.title}
                  </p>
                  <p className="text-xs text-muted-foreground rx-clamp-1">{track.artist}</p>
                </a>

                {/* Duration */}
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatTime(track.duration_ms)}
                </span>
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
