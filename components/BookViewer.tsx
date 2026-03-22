"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { StampEditor, type StampEditorHandle } from "@/components/StampEditor";
import type { BookPageView, BookView, Stamp } from "@/lib/types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type CalendarCell = {
  row: number;
  column: number;
  dayNumber: number | null;
  slot: BookPageView["slots"][number] | null;
  isToday: boolean;
  isPast: boolean;
};

type EditorState = {
  cell: { row: number; column: number; dayNumber: number };
  pageId: string;
  imageSrc: string;
} | null;

type ViewingStamp = { stamp: Stamp; dayNumber: number } | null;

function buildCalendar(
  year: number,
  month: number,
  slots: BookPageView["slots"] | null,
): CalendarCell[] {
  const numDays = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells: CalendarCell[] = [];

  for (let week = 0; week < 6; week++) {
    for (let dow = 0; dow < 7; dow++) {
      const dayNum = week * 7 + dow - firstDow + 1;
      if (dayNum < 1 || dayNum > numDays) {
        cells.push({ row: week, column: dow, dayNumber: null, slot: null, isToday: false, isPast: false });
        continue;
      }
      const d = new Date(year, month, dayNum);
      d.setHours(0, 0, 0, 0);
      const slot = slots?.find((s) => s.row === week && s.column === dow) ?? null;
      cells.push({
        row: week,
        column: dow,
        dayNumber: dayNum,
        slot,
        isToday: d.getTime() === today.getTime(),
        isPast: d.getTime() < today.getTime(),
      });
    }
  }

  return cells;
}

function getActiveWeeks(cells: CalendarCell[]): number[] {
  const weeks = new Set<number>();
  cells.forEach((c) => { if (c.dayNumber !== null) weeks.add(c.row); });
  return Array.from(weeks).sort((a, b) => a - b);
}

export function BookViewer({ bookView, readOnly = false }: { bookView: BookView; readOnly?: boolean }) {
  const router = useRouter();
  const [viewYear, setViewYear] = useState<number | null>(null);
  const [viewMonth, setViewMonth] = useState<number | null>(null);
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'upload' | 'delete' | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSavedCell, setJustSavedCell] = useState<string | null>(null);
  const [viewingStamp, setViewingStamp] = useState<ViewingStamp>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingStampId, setDeletingStampId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingCellRef = useRef<{ row: number; column: number; dayNumber: number } | null>(null);
  const editorRef = useRef<StampEditorHandle>(null);

  const [isPortrait, setIsPortrait] = useState(false);
  const [orientationLocked, setOrientationLocked] = useState(false);

  useEffect(() => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());

    const check = () => {
      const portrait = window.innerWidth < 900 && window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };
    check();
    window.addEventListener("resize", check);

    // Try to lock orientation to landscape on mobile/tablet
    async function lockLandscape() {
      if (window.screen?.orientation?.lock) {
        try {
          await (window.screen.orientation as any).lock("landscape");
          setOrientationLocked(true);
        } catch {
          setOrientationLocked(false);
        }
      } else {
        setOrientationLocked(false);
      }
    }
    // Only attempt on mobile/tablet
    if (/Mobi|Android|iPad|iPhone|iPod|Tablet/i.test(navigator.userAgent)) {
      lockLandscape();
    }

    return () => window.removeEventListener("resize", check);
  }, []);

  const monthPage = (viewYear !== null && viewMonth !== null) 
    ? bookView.pages.find((p) => p.year === viewYear && p.month === viewMonth)
    : null;
  const cells = (viewYear !== null && viewMonth !== null)
    ? buildCalendar(viewYear, viewMonth, monthPage?.slots ?? null)
    : [];
  const activeWeeks = getActiveWeeks(cells);

  function navigateMonth(dir: 1 | -1) {
    if (viewYear === null || viewMonth === null) return;
    const d = new Date(viewYear, viewMonth + dir, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  async function ensureMonthPage(): Promise<string | null> {
    if (viewYear === null || viewMonth === null) return null;
    if (monthPage) return monthPage.id;
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: viewYear, month: viewMonth }),
      });
      const data = (await res.json()) as { page?: { id: string }; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not create page.");
      if (!data.page) throw new Error("No page returned.");
      return data.page.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create page.");
      return null;
    }
  }

  function handleCellClick(cell: CalendarCell) {
    if (!cell.dayNumber) return;
    if (cell.slot?.stamp) {
      setViewingStamp({ stamp: cell.slot.stamp, dayNumber: cell.dayNumber });
      return;
    }
    if (readOnly || cell.isPast) return;
    pendingCellRef.current = { row: cell.row, column: cell.column, dayNumber: cell.dayNumber };
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setShowLoadingModal(true);
    setLoadingAction('upload');
    const file = e.target.files?.[0];
    if (!file || !pendingCellRef.current) {
      setShowLoadingModal(false);
      setLoadingAction(null);
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Upload a PNG, JPEG, or WebP image.");
      setShowLoadingModal(false);
      setLoadingAction(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large (max 10 MB).");
      setShowLoadingModal(false);
      setLoadingAction(null);
      return;
    }
    const pendingCell = pendingCellRef.current;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== "string") {
        setShowLoadingModal(false);
        setLoadingAction(null);
        return;
      }
      const imageSrc = reader.result;
      let pageId = monthPage?.id ?? null;
      if (!pageId) {
        pageId = await ensureMonthPage();
        if (!pageId) {
          setShowLoadingModal(false);
          setLoadingAction(null);
          return;
        }
      }
      setEditorState({ cell: pendingCell, pageId, imageSrc });
      setSaveError(null);
      setShowLoadingModal(false);
      setLoadingAction(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleSave() {
    if (!editorState) return;
    const exportedImage = editorRef.current?.exportImage();
    if (!exportedImage) {
      setSaveError("Position the stamp over your photo first.");
      return;
    }
    setIsSaving(true);
    setShowLoadingModal(true);
    setLoadingAction('upload');
    setSaveError(null);
    try {
      const res = await fetch("/api/stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column: editorState.cell.column,
          row: editorState.cell.row,
          imageUrl: exportedImage,
          pageId: editorState.pageId,
          shape: "stamp_edge",
          description: description.trim(),
        }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error ?? "Unable to save.");
      const savedKey = `${editorState.cell.row}-${editorState.cell.column}`;
      setEditorState(null);
      setDescription("");
      setJustSavedCell(savedKey);
      startTransition(() => { router.refresh(); });
      globalThis.setTimeout(() => { setJustSavedCell(null); }, 1400);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unable to save.");
    } finally {
      setIsSaving(false);
      setShowLoadingModal(false);
      setLoadingAction(null);
    }
  }

  async function handleDeleteStamp(stampId: string) {
    setDeletingStampId(stampId);
    setShowLoadingModal(true);
    setLoadingAction('delete');
    try {
      const res = await fetch("/api/stamps", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stampId }),
      });
      const d = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Could not remove stamp.");
      setViewingStamp(null);
      // Wait for UI to update after refresh before hiding loading
      await new Promise((resolve) => {
        startTransition(() => {
          router.refresh();
          setTimeout(resolve, 400); // Wait for UI update (tweak as needed)
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove stamp.");
    } finally {
      setDeletingStampId(null);
      setShowLoadingModal(false);
      setLoadingAction(null);
    }
  }

  function renderCell(cell: CalendarCell) {
    const savedKey = `${cell.row}-${cell.column}`;
    const isJustSaved = justSavedCell === savedKey;
    const isDeleting = !!(cell.slot?.stamp && cell.slot.stamp.id === deletingStampId);
    const canStamp = !readOnly && !cell.isPast;
    const hasStamp = !!cell.slot?.stamp;

    if (!cell.dayNumber) {
      return (
        <div
          key={`e-${cell.row}-${cell.column}`}
          className="aspect-square border-b border-r border-stone-200 bg-stone-50/30"
        />
      );
    }

    return (
      <motion.button
        animate={isDeleting ? { opacity: 0, scale: 0.7, rotate: 6 } : { opacity: 1, scale: 1, rotate: 0 }}
        className={[
          "relative aspect-square border-b border-r border-stone-200",
          "text-left transition-colors",
          cell.isToday ? "bg-amber-50" : "bg-[#FDFCF8]",
          hasStamp
            ? "cursor-pointer hover:brightness-95"
            : canStamp
              ? "cursor-pointer hover:bg-stone-100/60"
              : "cursor-default",
          !hasStamp && cell.isPast ? "opacity-40" : "",
        ].join(" ")}
        key={`${cell.row}-${cell.column}`}
        onClick={() => handleCellClick(cell)}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        type="button"
      >
        <span
          className={[
            "absolute top-1 left-1 z-10 select-none font-serif leading-none",
            "text-[0.7rem]",
            cell.isToday ? "font-bold text-amber-700" : "text-stone-400",
          ].join(" ")}
        >
          {cell.dayNumber}
        </span>
        {cell.isToday ? (
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
        ) : null}
        {hasStamp ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
            initial={isJustSaved ? { opacity: 0, scale: 1.12 } : false}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative w-full h-full min-w-[60px] min-h-[60px] flex items-center justify-center overflow-hidden">
              <Image
                alt={cell.slot!.stamp!.description || `Day ${cell.dayNumber}`}
                className="object-center object-contain scale-125"
                fill
                sizes="(max-width: 768px) 100px, 180px"
                src={cell.slot!.stamp!.imageUrl}
                unoptimized
                style={{ objectFit: 'contain', objectPosition: 'center', marginTop: '25px'}}
              />
            </div>
            {isJustSaved ? (
              <motion.div
                animate={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 bg-stone-700"
                initial={{ opacity: 0.25 }}
                transition={{ duration: 0.5 }}
              />
            ) : null}
          </motion.div>
        ) : null}
      </motion.button>
    );
  }

  return (
    <section className="w-full max-w-5xl">
      {/* Loading indicator modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white/90 px-8 py-6 shadow-xl">
            <svg className="animate-spin h-8 w-8 text-stone-700" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="font-serif text-stone-700 text-lg">
              {loadingAction === 'delete' ? 'Deleting…' : 'Uploading…'}
            </span>
          </div>
        </div>
      )}
      {isPortrait ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-stone-950/96 text-center">
          <svg className="h-14 w-14 rotate-90 text-stone-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect height="14" rx="2" ry="2" width="9" x="7.5" y="5" />
            <path d="M12 18v1m0-14v1" strokeLinecap="round" />
          </svg>
          <p className="font-serif text-sm italic text-stone-300">
            Please rotate your device to landscape
            {orientationLocked === false && (
              <><br /><span className="text-xs text-stone-400">(If your device does not rotate automatically, unlock rotation in your system settings.)</span></>
            )}
          </p>
        </div>
      ) : null}
      {error ? (
        <p className="mb-3 rounded bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
      ) : null}
      <input
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="book-shadow relative overflow-hidden rounded-sm"
        initial={{ opacity: 0, y: 10 }}
      >
        {editorState ? (
          <div className="page-texture flex w-full flex-col items-center gap-4 overflow-y-auto bg-[#F9F7F2] p-4 sm:p-6" style={{ maxHeight: "100dvh" }}>
            <div className="flex w-full items-center justify-between">
              <p className="font-serif text-sm italic text-stone-500">
                {viewMonth !== null ? MONTH_NAMES[viewMonth] : ""} {editorState.cell.dayNumber} — position the stamp
              </p>
              <button
                aria-label="Discard"
                className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-200/60 hover:text-stone-600"
                onClick={() => setEditorState(null)}
                type="button"
              >
                <svg fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 14 14" width="14">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </div>

            <StampEditor imageSrc={editorState.imageSrc} ref={editorRef} />

            <div className="w-full">
              <label className="mb-1 block font-serif text-xs italic text-stone-500">
                Add a note <span className="not-italic text-stone-400">(optional)</span>
              </label>
              <textarea
                className="w-full resize-none border border-stone-200 bg-white/80 px-3 py-2 text-sm text-stone-700 outline-none placeholder:text-stone-300 focus:border-stone-400"
                maxLength={280}
                onChange={(e) => { setDescription(e.target.value); }}
                placeholder={viewMonth !== null ? `${MONTH_NAMES[viewMonth]} ${editorState.cell.dayNumber} — a special moment` : "A special moment"}
                rows={2}
                value={description}
              />
            </div>

            {saveError ? (
              <p className="w-full rounded bg-rose-50 px-3 py-2 text-xs text-rose-600">{saveError}</p>
            ) : null}

            <div className="flex w-full flex-wrap items-center gap-3">
              <button
                className="flex items-center gap-1.5 border border-stone-200 bg-stone-50 px-4 py-2.5 font-serif text-sm italic text-stone-500 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition hover:border-stone-300 hover:bg-white hover:text-stone-700"
                onClick={() => { if (fileInputRef.current) fileInputRef.current.click(); }}
                type="button"
              >
                ↻ Choose another
              </button>
              <button
                className="ml-auto flex items-center gap-2 bg-stone-800 px-6 py-2.5 font-serif text-sm tracking-widest text-stone-100 shadow-[0_2px_10px_rgba(40,30,20,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-stone-700 hover:shadow-[0_4px_14px_rgba(40,30,20,0.28)] active:translate-y-px disabled:opacity-60"
                disabled={isSaving}
                onClick={handleSave}
                type="button"
              >
                {isSaving ? "Sealing…" : "Seal this day"}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative flex overflow-hidden">
            {/* ── Left page: Mon–Thu ── */}
            <div className="page-texture page-depth-left relative flex flex-1 flex-col bg-[#F9F7F2] p-3 sm:p-5">
            {/* ─── Left page header — fixed height so grids align ─── */}
              <div className="mb-3 flex h-14 items-center gap-3">
                <button
                  className="select-none font-serif text-3xl leading-none text-stone-400/70 transition hover:text-stone-600"
                  onClick={() => navigateMonth(-1)}
                  type="button"
                >
                  ‹
                </button>
                <span className="font-serif text-[2.6rem] italic leading-none text-stone-400/70">
                  {viewMonth !== null ? String(viewMonth + 1).padStart(2, "0") : "--"}
                </span>
              </div>

              <div className="grid grid-cols-4 border-l border-t border-stone-200">
                {["Mon", "Tue", "Wed", "Thu"].map((d) => (
                  <div
                    className="border-b-2 border-r border-stone-200/80 bg-stone-50/80 py-1.5 text-center font-serif text-[0.55rem] font-semibold tracking-[0.18em] text-stone-400 uppercase"
                    key={d}
                  >
                    {d}
                  </div>
                ))}
                {activeWeeks.flatMap((week) =>
                  [0, 1, 2, 3].map((col) => {
                    const cell = cells.find((c) => c.row === week && c.column === col)!;
                    return renderCell(cell);
                  })
                )}
              </div>
            </div>

            {/* Spine */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-4 -translate-x-1/2 bg-gradient-to-r from-stone-950/20 via-stone-950/5 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px bg-stone-300/60" />

            {/* ── Right page: Fri–Sun + empty col ── */}
            <div className="page-texture page-depth-right relative flex flex-1 flex-col bg-[#FDFCF8] p-3 sm:p-5">
            {/* ─── Right page header — same fixed height as left ─── */}
              <div className="mb-3 flex h-14 items-center justify-between">
                <span className="font-serif text-xs tracking-[0.28em] text-stone-300 uppercase">
                  {viewMonth !== null && viewYear !== null ? `${MONTH_NAMES[viewMonth]} ${viewYear}` : "Loading..."}
                </span>
                <button
                  className="select-none font-serif text-3xl leading-none text-stone-400/70 transition hover:text-stone-600"
                  onClick={() => navigateMonth(1)}
                  type="button"
                >
                  ›
                </button>
              </div>

              <div className="grid grid-cols-4 border-l border-t border-stone-200">
                {["Fri", "Sat", "Sun", ""].map((d, i) => (
                  <div
                    className="border-b-2 border-r border-stone-200/80 bg-stone-50/80 py-1.5 text-center font-serif text-[0.55rem] font-semibold tracking-[0.18em] text-stone-400 uppercase"
                    key={i}
                  >
                    {d}
                  </div>
                ))}
                {activeWeeks.flatMap((week) =>
                  [4, 5, 6, 7].map((col) => {
                    if (col === 7) {
                      return (
                        <div
                          className="aspect-square border-b border-r border-stone-100/60 bg-stone-50/10"
                          key={`n-${week}`}
                        />
                      );
                    }
                    const cell = cells.find((c) => c.row === week && c.column === col)!;
                    return renderCell(cell);
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {viewingStamp ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-stone-900/40 px-4 py-8 backdrop-blur-[2px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setViewingStamp(null)}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative my-auto w-full max-w-xs"
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Paper bg — upper-right corner clipped to reveal fold */}
              <div
                className="page-texture bg-[#F9F7F2]"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 2.4rem) 0, 100% 2.4rem, 100% 100%, 0 100%)",
                  boxShadow: "0 8px 36px rgba(40,30,20,0.20), 0 2px 6px rgba(40,30,20,0.10)",
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="relative w-full h-[340px] max-h-[60vw] mx-auto">
                    <div style={{ height: '180%', marginTop: '20px', position: 'relative', width: '100%' }}>
                      <Image
                        alt={viewingStamp.stamp.description || `Day ${viewingStamp.dayNumber}`}
                        className="object-contain"
                        fill
                        src={viewingStamp.stamp.imageUrl}
                        unoptimized
                        style={{ objectFit: 'contain', objectPosition: 'center' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-3">
                  <p className="font-serif text-xs italic tracking-widest text-stone-400 uppercase">
                    {viewMonth !== null ? MONTH_NAMES[viewMonth] : ""} {viewingStamp.dayNumber}, {viewYear}
                  </p>
                  {viewingStamp.stamp.description ? (
                    <p className="mt-2.5 font-serif text-base leading-relaxed text-stone-700">
                      {viewingStamp.stamp.description}
                    </p>
                  ) : (
                    <p className="mt-2.5 font-serif text-sm italic text-stone-300">No note added.</p>
                  )}
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                      className="font-serif text-xs italic text-stone-400 transition hover:text-stone-600"
                      onClick={() => setViewingStamp(null)}
                      type="button"
                    >
                      Close
                    </button>
                    {!readOnly ? (
                      <button
                        className="font-serif text-xs italic text-rose-400 transition hover:text-rose-600"
                        onClick={() => void handleDeleteStamp(viewingStamp.stamp.id)}
                        type="button"
                      >
                        Remove this stamp
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              {/* Folded upper-right corner — a darker paper triangle */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 h-0 w-0"
                style={{
                  borderStyle: "solid",
                  borderWidth: "2.4rem 2.4rem 0 0",
                  borderColor: "transparent transparent #a8a09a #a8a09a",
                  filter: "drop-shadow(-1px 1px 2px rgba(0,0,0,0.14))",
                }}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
