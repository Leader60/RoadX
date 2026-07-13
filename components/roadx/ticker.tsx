import { TICKER_ITEMS } from "@/lib/roadx/data";
import { IconSparkle } from "./icons";

export function NewsTicker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="flex items-center gap-2 border-y border-gold/30 bg-navy-deep/60 py-2">
      <span className="flex shrink-0 items-center gap-1 px-3 text-xs font-bold text-gold">
        <IconSparkle size={14} />
        جديد
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="rx-ticker-track">
          {items.map((item, i) => (
            <span
              key={i}
              className="mx-6 text-sm text-foreground/90"
              aria-hidden={i >= TICKER_ITEMS.length}
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
