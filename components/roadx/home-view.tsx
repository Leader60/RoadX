"use client";

import { useState, useEffect } from "react";
import {
  featuredTrack,
  featuredBoxes,
  trackImage,
  formatCount,
  formatDate,
  type Track,
} from "@/lib/roadx/data";
import { useRoadX } from "@/contexts/roadx-context";
import { NewsTicker } from "./ticker";
import { StreamingLinks, FeatureBox } from "./track-card";
import { SectionTitle, Button } from "./ui";
import { IconHeart, IconComment, IconPlay, IconSparkle } from "./icons";

export function HomeView({ onOpenTrack }: { onOpenTrack: (id: string) => void }) {
  const { likeCount, commentCount } = useRoadX();
  const [featured, setFeatured] = useState<Track | null>(null);
  const [boxes, setBoxes] = useState<Track[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // انتظار تحميل البيانات
    const check = setInterval(() => {
      const ft = featuredTrack();
      if (ft && ft.id !== "temp") {
        setFeatured(ft);
        setBoxes(featuredBoxes());
        setReady(true);
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, []);

  if (!ready || !featured) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto rounded-full border-4 border-gold border-t-transparent rx-spin mb-4" />
          <p className="text-muted-foreground">جاري تحميل أحدث الإصدارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rx-fade-in flex flex-col gap-6 pb-6">
      {/* Title band */}
      <div className="px-4 pt-5 text-center">
        <h1 className="text-3xl font-bold rx-gold-text tracking-wide text-balance">
          أحدث الإصدارات الموسيقية العالمية
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          مختارات راقية لجمهور يقدّر الموسيقى عالية الجودة
        </p>
      </div>

      <NewsTicker />

      {/* Featured */}
      <section className="px-4">
        <SectionTitle className="mb-3">
          <span className="inline-flex items-center gap-1">
            <IconSparkle size={16} className="text-gold" /> إصدار مميّز
          </span>
        </SectionTitle>
        <FeaturedCard
          track={featured}
          likes={likeCount(featured)}
          comments={commentCount(featured)}
          onOpen={() => onOpenTrack(featured.id)}
        />
      </section>

      {/* Three boxes */}
      <section className="px-4">
        <SectionTitle className="mb-3">أحدث الإصدارات</SectionTitle>
        <div className="flex flex-col gap-3">
          {boxes.map((t) => (
            <FeatureBox key={t.id} track={t} onOpen={() => onOpenTrack(t.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FeaturedCard({
  track,
  likes,
  comments,
  onOpen,
}: {
  track: Track;
  likes: number;
  comments: number;
  onOpen: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gold/30 bg-card">
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={trackImage(track, 640, 360) || "/placeholder.svg"}
          alt={track.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent" />
        <button
          onClick={onOpen}
          aria-label="افتح المقطوعة"
          className="rx-press absolute bottom-3 right-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lg"
        >
          <IconPlay size={22} />
        </button>
        <div className="absolute bottom-3 left-3 right-16">
          <p className="text-xs text-gold">{formatDate(track.releaseDate)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{track.title}</h3>
          <p className="text-sm text-gold">{track.artist}</p>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {track.summary}
        </p>
        <StreamingLinks track={track} />
        <div className="flex items-center gap-4 border-t border-border pt-3 text-sm text-muted-foreground rx-nums">
          <span className="inline-flex items-center gap-1.5">
            <IconHeart size={16} className="text-gold" /> {formatCount(likes)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconComment size={16} className="text-gold" /> {formatCount(comments)}
          </span>
          <Button variant="gold" className="ms-auto px-4 py-2" onClick={onOpen}>
            مقطوعات موسيقية
          </Button>
        </div>
      </div>
    </div>
  );
}
