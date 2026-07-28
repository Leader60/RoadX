"use client";

import { useEffect, useState } from "react";
import { IconSparkle } from "./icons";

interface TickerItem {
  text: string;
  url: string;
}

export function NewsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
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
        const newsItems: TickerItem[] = data.tracks.map((t: any) => ({
          text: `🎵 "${t.title}" — ${t.artist} | استمع الآن`,
          url: t.youtube_search || t.lastfm_url || "#",
        }));
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
      { text: "🎵 أحدث الإصدارات العالمية تصل إلى RoadX", url: "/charts" },
      { text: "🌟 اكتشف أشهر الأغاني في كل الدول", url: "/charts" },
      { text: "🎧 استمع لأفضل المقاطع الموسيقية", url: "/charts" },
      { text: "📈 تابع ترتيب الأغاني حسب بلدك", url: "/charts" },
      { text: "🔥 أكثر الأغاني استماعاً هذا الأسبوع", url: "/charts" },
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
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-6 text-sm text-foreground/90 whitespace-nowrap hover:text-gold transition-colors"
              aria-hidden={i >= items.length}
            >
              {item.text}
              <span className="mr-6 text-gold">•</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
