"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import type { BookGridSlot, BookPageView } from "@/lib/types";

interface StampGridProps {
  deletingStampId?: string | null;
  justSavedSlotId?: string | null;
  onSlotClick?: (slot: BookGridSlot) => void;
  page: BookPageView;
  readOnly?: boolean;
  selectedSlotId?: string | null;
}

export function StampGrid({
  deletingStampId = null,
  justSavedSlotId = null,
  onSlotClick,
  page,
  readOnly = false,
  selectedSlotId = null,
}: StampGridProps) {
  return (
    <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-[2rem] border border-[#cbc3b8] bg-[#f6f1e8]">
      {page.slots.map((slot) => (
        <motion.button
          animate={slot.stamp?.id === deletingStampId ? {
            opacity: 0,
            rotate: 14,
            scale: 0.74,
            x: 90,
            y: -70,
          } : {
            opacity: 1,
            rotate: 0,
            scale: 1,
            x: 0,
            y: 0,
          }}
          className={`group relative aspect-[1.02] overflow-hidden border border-[#d6cfc3] bg-[#f6f2ea] text-left transition ${selectedSlotId === slot.id ? "bg-[#efe9dc]" : "hover:bg-[#f0eadf]"} ${readOnly ? "cursor-default" : slot.stamp ? "cursor-pointer" : "cursor-cell"}`}
          key={slot.id}
          onClick={() => onSlotClick?.(slot)}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          type="button"
        >
          <span className="absolute top-3 left-3 z-10 text-[0.62rem] font-semibold tracking-[0.24em] text-[#8c857b] uppercase">
            {slot.index.toString().padStart(2, "0")}
          </span>
          <div className="relative h-full w-full overflow-hidden">
            {slot.stamp ? (
              <>
                {/* Image spans the full cell */}
                <motion.div
                  animate={{ opacity: 1, rotate: 0, scale: 1, y: 0 }}
                  className="absolute inset-0"
                  initial={justSavedSlotId === slot.id
                    ? { opacity: 0, rotate: -4, scale: 1.28, y: -14 }
                    : false
                  }
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                    opacity: { duration: 0.15 },
                  }}
                  whileHover={readOnly ? undefined : { scale: 1.04, rotate: -1 }}
                >
                  <Image
                    alt={slot.stamp.description || `Stamp ${slot.index}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 33vw, 220px"
                    src={slot.stamp.imageUrl}
                    unoptimized
                  />
                </motion.div>
                {/* Ink press flash */}
                {justSavedSlotId === slot.id ? (
                  <motion.div
                    animate={{ opacity: 0 }}
                    className="pointer-events-none absolute inset-0 z-10 bg-stone-900"
                    initial={{ opacity: 0.4 }}
                    transition={{ delay: 0.08, duration: 0.5 }}
                  />
                ) : null}
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.62),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.24),rgba(244,239,231,0.96))] px-3 py-5 text-center">
                <span className="text-3xl font-light text-[#afa89d]">+</span>
                <span className="max-w-28 text-[0.7rem] font-semibold leading-5 tracking-[0.16em] text-[#938b7f] uppercase">
                  {readOnly ? "Empty square" : "Click to stamp here"}
                </span>
              </div>
            )}
          </div>
          {!readOnly ? (
            <span className="pointer-events-none absolute right-3 bottom-3 text-[0.6rem] font-semibold tracking-[0.18em] text-[#9a9388] uppercase opacity-0 transition group-hover:opacity-100">
              {slot.stamp ? "view" : "stamp"}
            </span>
          ) : null}
        </motion.button>
      ))}
    </div>
  );
}
