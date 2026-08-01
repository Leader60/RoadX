import type { Track } from "@/lib/roadx/data";
import { formatCount, trackImage } from "@/lib/roadx/data";
import { useRoadX } from "@/contexts/roadx-context";
import { cx } from "./ui";
import { IconHeart, IconComment, IconYoutube, IconSpotify, IconApple } from "./icons";

function IconDeezer({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="14" width="4" height="4" rx="0.5" fill="currentColor" />
      <rect x="7.5" y="11" width="4" height="7" rx="0.5" fill="currentColor" />
      <rect x="13" y="8" width="4" height="10" rx="0.5" fill="currentColor" />
      <rect x="18.5" y="5" width="4" height="13" rx="0.5" fill="currentColor" />
    </svg>
  );
}

export function StreamingLinks({
  track,
  size = 18,
  className,
}: {
  track: Track;
  size?: number;
  className?: string;
}) {
  const links: { key: string; href?: string; label: string; Icon: typeof IconYoutube }[] = [
    { key: "yt", href: track.youtube, label: "يوتيوب", Icon: IconYoutube },
    { key: "sp", href: track.spotify, label: "سبوتيفاي", Icon: IconSpotify },
    { key: "ap", href: track.apple, label: "آبل ميوزك", Icon: IconApple },
    { key: "dz", href: track.deezer, label: "ديزر", Icon: IconDeezer },
  ];
  const available = links.filter((l) => l.href);
  if (available.length === 0) return null;

  const handleStreamClick = () => {
    sessionStorage.setItem("roadx_returning_from_stream", "1");
  };

  return (
    <div className={cx("flex flex-wrap items-center gap-2", className)}>
      {available.map(({ key, href, label, Icon }) => (
   <a     
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStreamClick}
          className="rx-press inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-navy-deep/40 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold hover:text-gold-foreground transition-colors"
        >
          <Icon size={size} />
          {label}
        </a>
      ))}
    </div>
  );
}

export function TrackRow({ track, onOpen }: { track: Track; onOpen: () => void }) {
  const { likeCount, commentCount } = useRoadX();
  return (
    <button
      onClick={onOpen}
      className="rx-press flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-2.5 text-right transition-colors hover:border-gold/50"
    >
      <img
        src={trackImage(track, 160, 160) || "/placeholder.svg"}
        alt={track.title}
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="rx-clamp-1 text-base font-bold text-foreground">{track.title}</p>
        <p className="rx-clamp-1 text-sm text-muted-foreground">{track.artist}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground rx-nums">
          <span className="inline-flex items-center gap-1">
            <IconHeart size={13} /> {formatCount(likeCount(track))}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconComment size={13} /> {formatCount(commentCount(track))}
          </span>
        </div>
      </div>
    </button>
  );
}

export function FeatureBox({ track, onOpen }: { track: Track; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="rx-press group flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-right transition-colors hover:border-gold/50"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={trackImage(track, 480, 270) || "/placeholder.svg"}
          alt={track.title}
          className="h-full w-full object-cover"
        />
        <span className="absolute right-2 top-2 rounded-full bg-navy-deep/80 px-2 py-0.5 text-[11px] font-bold text-gold">
          {track.genre}
        </span>
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="rx-clamp-1 text-base font-bold text-foreground">{track.title}</p>
        <p className="text-sm text-gold">{track.artist}</p>
        <p className="rx-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {track.summary}
        </p>
        <span className="mt-1 text-xs font-bold text-gold">المزيد ←</span>
      </div>
    </button>
  );
}
