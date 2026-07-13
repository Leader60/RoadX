"use client";

import {
  featuredTrack,
  featuredBoxes,
  imageUrl,
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
  const featured = featuredTrack();
  const boxes = featuredBoxes();

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
            <IconSparkle size={16} className="text-gold" /> المقطوعة المميّزة
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
        <SectionTitle className="mb-3">أحدث المقطوعات</SectionTitle>
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
          src={imageUrl(track.query, 640, 360) || "/placeholder.svg"}
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
            الصفحة الكاملة
          </Button>
        </div>
      </div>
    </div>
  );
}
