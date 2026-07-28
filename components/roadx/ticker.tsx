"use client";

import { useEffect, useState } from "react";
import { IconSparkle } from "./icons";

export function NewsTicker() {
  const [items, setItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch("/api/roadx/deezer/top-tracks?country=global&limit=8");
      if (!res.ok) throw new Error("فشل جلب الأخبار");
      const data = await res.json();

      if (data.tracks && data.tracks.length > 0) {
        const newsItems = data.tracks.map((t: any) =>
          `🎵 "${t.title}" — ${t.artist} | استمع الآن`
        );
        setItems(newsItems);
      } else {
        setFallbackItems();
      }
    } catch {
      setFallbackItems();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackItems = () => {
    setItems([
      "🎵 أحدث الإصدارات العالمية تصل إلى RoadX",
      "🌟 اكتشف أشهر الأغاني في كل الدول",
      "🎧 استمع لأفضل المقاطع الموسيقية",
      "📈 تابع ترتيب الأغاني حسب بلدك",
      "🔥 أكثر الأغاني استماعاً هذا الأسبوع",
    ]);
  };

  const loopItems = [...items, ...items];

  if (loading) {
    return (
      <div className="flex items-center gap-2 border-y border-gold/30 bg-navy-deep/60 py-2">
        <span className="flex shrink-0 items-center gap-1 px-3 text-xs font-bold text-gold">
          <IconSparkle size={14} />
          جديد
        </span>
        <div className="flex-1 text-center text-sm text-muted-foreground">
          جاري تحميل آخر الأخبار...
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 border-y border-gold/30 bg-navy-deep/60 py-2">
      <span className="flex shrink-0 items-center gap-1 px-3 text-xs font-bold text-gold">
        <IconSparkle size={14} />
        جديد
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="rx-ticker-track">
          {loopItems.map((item, i) => (
            <span
              key={i}
              className="mx-6 text-sm text-foreground/90 whitespace-nowrap"
              aria-hidden={i >= items.length}
            >
              {item}
              <span className="mr-6 text-gold">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
