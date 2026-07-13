"use client";

import { useEffect, useRef, useState } from "react";
import {
  TRACK_MAP,
  TRACKS,
  imageUrl,
  formatCount,
  formatDate,
  toArabicNum,
  COMMENT_MAX,
  type Track,
} from "@/lib/roadx/data";
import { useRoadX } from "@/contexts/roadx-context";
import { StreamingLinks } from "./track-card";
import { Button, Card, Pill, SectionTitle, EmptyState, cx, inputClass } from "./ui";
import {
  IconHeart,
  IconHeartFill,
  IconComment,
  IconSend,
  IconTrash,
  IconMusicNote,
} from "./icons";

export function MusicView({
  trackId,
  onOpenTrack,
}: {
  trackId: string;
  onOpenTrack: (id: string) => void;
}) {
  const {
    isLiked,
    toggleLike,
    likeCount,
    commentCount,
    commentsFor,
    addComment,
    deleteComment,
  } = useRoadX();

  const track = TRACK_MAP[trackId] ?? TRACKS[0];
  const [draft, setDraft] = useState("");
  const [burst, setBurst] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraft("");
  }, [trackId]);

  const liked = isLiked(track.id);
  const comments = commentsFor(track.id);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    addComment(track.id, text);
    setDraft("");
  };

  const onLike = () => {
    if (!liked) setBurst((b) => b + 1);
    toggleLike(track.id);
  };

  return (
    <div className="rx-fade-in flex flex-col gap-5 px-4 py-5 pb-6">
      {/* Sidebar-style header: image + meta */}
      <Card className="overflow-hidden">
        <div className="flex gap-4 p-4">
          <img
            src={imageUrl(track.query, 220, 220) || "/placeholder.svg"}
            alt={track.title}
            className="h-28 w-28 shrink-0 rounded-xl object-cover shadow-lg"
          />
          <div className="flex min-w-0 flex-col justify-center gap-1.5">
            <Pill className="w-fit bg-gold/15 text-gold">{track.genre}</Pill>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              {track.title}
            </h1>
            <p className="text-base text-gold">{track.artist}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(track.releaseDate)}
            </p>
          </div>
        </div>

        {/* Like + comment counts */}
        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          <button
            onClick={onLike}
            aria-pressed={liked}
            className={cx(
              "rx-press inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors",
              liked
                ? "bg-gold text-gold-foreground"
                : "border border-border bg-secondary text-foreground",
            )}
          >
            <span key={burst} className={liked ? "rx-heart" : ""}>
              {liked ? <IconHeartFill size={18} /> : <IconHeart size={18} />}
            </span>
            <span className="rx-nums">{formatCount(likeCount(track))}</span>
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-bold text-foreground">
            <IconComment size={18} className="text-gold" />
            <span className="rx-nums">{formatCount(commentCount(track))}</span>
          </div>
        </div>
      </Card>

      {/* Summary + streaming */}
      <section className="flex flex-col gap-3">
        <SectionTitle>عن المقطوعة</SectionTitle>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {track.summary}
        </p>
        <StreamingLinks track={track} />
      </section>

      {/* Comments */}
      <section className="flex flex-col gap-3">
        <SectionTitle>
          التعليقات ({toArabicNum(comments.length)})
        </SectionTitle>

        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, COMMENT_MAX))}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="أضف تعليقك..."
            className={cx(inputClass, "resize-none")}
          />
          <Button
            variant="gold"
            className="h-[46px] px-4"
            onClick={submit}
            disabled={!draft.trim()}
            aria-label="إرسال"
          >
            <IconSend size={18} />
          </Button>
        </div>
        <p className="text-left text-[11px] text-muted-foreground rx-nums">
          {toArabicNum(draft.length)}/{toArabicNum(COMMENT_MAX)}
        </p>

        <div ref={listRef} className="flex flex-col gap-2">
          {comments.length === 0 ? (
            <EmptyState
              icon={<IconComment size={34} />}
              title="لا توجد تعليقات بعد"
              hint="كن أول من يشارك رأيه في هذه المقطوعة"
            />
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rx-fade-up flex items-start gap-2 rounded-xl border border-border bg-card p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <IconMusicNote size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gold">أنت</p>
                  <p className="whitespace-pre-wrap break-words text-sm text-foreground">
                    {c.text}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => deleteComment(c.id)}
                  aria-label="حذف"
                  className="rx-press text-muted-foreground hover:text-destructive"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* More tracks */}
      <section className="flex flex-col gap-3">
        <SectionTitle>مقطوعات أخرى</SectionTitle>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 rx-no-scrollbar">
          {TRACKS.filter((t) => t.id !== track.id)
            .slice(0, 6)
            .map((t) => (
              <MiniTrack key={t.id} track={t} onOpen={() => onOpenTrack(t.id)} />
            ))}
        </div>
      </section>
    </div>
  );
}

function MiniTrack({ track, onOpen }: { track: Track; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="rx-press flex w-32 shrink-0 flex-col gap-1.5 text-right"
    >
      <img
        src={imageUrl(track.query, 200, 200) || "/placeholder.svg"}
        alt={track.title}
        className="aspect-square w-full rounded-xl object-cover"
      />
      <p className="rx-clamp-1 text-sm font-bold text-foreground">{track.title}</p>
      <p className="rx-clamp-1 text-xs text-muted-foreground">{track.artist}</p>
    </button>
  );
}
