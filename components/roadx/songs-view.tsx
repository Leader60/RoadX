"use client";

import { useState } from "react";
import { TRACKS, sortedByDate } from "@/lib/roadx/data";
import { TrackRow } from "./track-card";
import { SectionTitle, cx, inputClass, EmptyState } from "./ui";
import { IconList } from "./icons";

export function SongsView({ onOpenTrack }: { onOpenTrack: (id: string) => void }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = sortedByDate().filter(
    (t) =>
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.genre.toLowerCase().includes(query),
  );

  return (
    <div className="rx-fade-in flex flex-col gap-4 px-4 py-5 pb-6">
      <SectionTitle>كل الأغاني ({TRACKS.length})</SectionTitle>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث بالعنوان أو الفنان..."
        className={cx(inputClass)}
      />
      {list.length === 0 ? (
        <EmptyState
          icon={<IconList size={34} />}
          title="لا توجد نتائج"
          hint="جرّب كلمات بحث مختلفة"
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {list.map((t) => (
            <TrackRow key={t.id} track={t} onOpen={() => onOpenTrack(t.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
