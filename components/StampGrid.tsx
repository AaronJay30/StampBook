import Image from "next/image";

import type { BookPageView } from "@/lib/types";

interface StampGridProps {
  page: BookPageView;
  readOnly?: boolean;
}

export function StampGrid({ page, readOnly = false }: StampGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {page.slots.map((slot) => (
        <article
          className="relative aspect-[0.82] overflow-hidden rounded-[1.6rem] border border-[var(--paper-border)] bg-white/90 p-2 shadow-[var(--shadow-soft)]"
          key={slot.id}
        >
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.2rem] bg-secondary/60">
            {slot.stamp ? (
              <Image
                alt={slot.stamp.description || `Stamp ${slot.index}`}
                className="h-full w-full object-cover"
                fill
                sizes="(max-width: 768px) 33vw, 180px"
                src={slot.stamp.imageUrl}
                unoptimized
              />
            ) : (
              <span className="px-4 text-center text-sm font-semibold leading-6 text-foreground/55">
                {readOnly ? "Empty slot" : "Ready for your next memory"}
              </span>
            )}
          </div>
          <span className="absolute right-3 bottom-3 rounded-full bg-white/90 px-2 py-1 text-xs font-extrabold text-accent shadow-sm">
            {slot.index}
          </span>
        </article>
      ))}
    </div>
  );
}
