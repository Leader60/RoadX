import { TICKER_ITEMS, sortedByDate } from "@/lib/roadx/data";
import { IconSparkle } from "./icons";

export function NewsTicker() {
  // بناء نصوص الشريط تلقائياً من أحدث الأغاني المضافة للمنصة
  const latestTracks = sortedByDate().slice(0, 6);
  const trackItems = latestTracks.map(
    (t) => `إصدار جديد: "${t.title}" — ${t.artist}`
  );

  // دمج مع بعض النصوص الترويجية الثابتة، أو استخدام الأغاني فقط إن وُجدت
  const items = trackItems.length > 0
    ? [...trackItems, ...TICKER_ITEMS.slice(0, 2)]
    : TICKER_ITEMS;

  const loopItems = [...items, ...items];

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
              className="mx-6 text-sm text-foreground/90"
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
