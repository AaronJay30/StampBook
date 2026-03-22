"use client";

import { AnimatePresence, motion } from "framer-motion";
import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { StampEditor, type StampEditorHandle } from "@/components/StampEditor";

interface StampStudioProps {
  onClose: () => void;
  slot: {
    column: number;
    index: number;
    pageId: string;
    pageNumber: number;
    row: number;
  } | null;
}

export function StampStudio({ onClose, slot }: StampStudioProps) {
  const router = useRouter();
  const editorRef = useRef<StampEditorHandle>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (slot && !sourceImage) {
      window.setTimeout(() => {
        inputRef.current?.click();
      }, 40);
    }
  }, [slot, sourceImage]);

  if (!slot) {
    return null;
  }

  const activeSlot = slot;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Upload a PNG, JPEG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Keep stamp source files under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(typeof reader.result === "string" ? reader.result : null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    const exportedImage = editorRef.current?.exportImage();
    if (!exportedImage) {
      setError("Upload an image before saving a stamp.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/stamps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          column: activeSlot.column,
          imageUrl: exportedImage,
          pageId: activeSlot.pageId,
          row: activeSlot.row,
          shape: "stamp_edge",
          description: "",
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save the stamp.");
      }

      setSourceImage(null);
      startTransition(() => {
        onClose();
        router.refresh();
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the stamp.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(87,78,66,0.18)] px-4 py-6 backdrop-blur-[2px]"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.section
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative mx-auto grid w-full max-w-5xl gap-6 rounded-[2.4rem] border border-[#d0c7ba] bg-[#f4eee5] p-5 shadow-[0_32px_80px_rgba(94,83,69,0.18)] lg:grid-cols-[0.44fr_0.56fr] lg:p-6"
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          onClick={(event) => event.stopPropagation()}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            className="absolute top-5 right-5 rounded-full border border-[#d0c7ba] bg-white/80 px-3 py-2 text-xs font-semibold tracking-[0.16em] text-[#7d7568] uppercase"
            onClick={onClose}
            type="button"
          >
            Close
          </button>

          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-[#958d81] uppercase">Square {activeSlot.index.toString().padStart(2, "0")}</p>
              <h2 className="mt-3 text-3xl font-extrabold text-[#4d453b]">Place the stamp</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-[#6f665b]">
                Your photo stays centered and steady. Move the stamp over it, keep the window inside the picture, then press it into the book.
              </p>
            </div>

            <input
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
              ref={inputRef}
              type="file"
            />

            <div className="rounded-[1.6rem] border border-[#d6cec2] bg-white/72 p-4 text-sm leading-7 text-[#6a6053]">
              {sourceImage
                ? "The green screen is removed from the real stamp PNG, and the final saved image is clipped to that stamp window shape."
                : "Choose a photo to start. If the picker did not open, use the button below."}
            </div>

            <div className="space-y-3 rounded-[1.6rem] border border-[#d6cec2] bg-white/72 p-4">
              <p className="text-sm font-semibold text-[#5e554a]">Move stamp</p>
              <div className="grid w-fit grid-cols-3 gap-2">
                <span />
                <button className="rounded-full border border-[#d0c7ba] bg-[#faf7f1] px-4 py-2 text-sm font-bold text-[#5f574c]" onClick={() => editorRef.current?.nudge("up")} type="button">↑</button>
                <span />
                <button className="rounded-full border border-[#d0c7ba] bg-[#faf7f1] px-4 py-2 text-sm font-bold text-[#5f574c]" onClick={() => editorRef.current?.nudge("left")} type="button">←</button>
                <button className="rounded-full border border-[#d0c7ba] bg-[#faf7f1] px-4 py-2 text-sm font-bold text-[#5f574c]" onClick={() => editorRef.current?.centerStamp()} type="button">•</button>
                <button className="rounded-full border border-[#d0c7ba] bg-[#faf7f1] px-4 py-2 text-sm font-bold text-[#5f574c]" onClick={() => editorRef.current?.nudge("right")} type="button">→</button>
                <span />
                <button className="rounded-full border border-[#d0c7ba] bg-[#faf7f1] px-4 py-2 text-sm font-bold text-[#5f574c]" onClick={() => editorRef.current?.nudge("down")} type="button">↓</button>
                <span />
              </div>
            </div>

            {error ? <p className="rounded-[1.4rem] bg-[#e8d9cd] px-4 py-3 text-sm text-[#7e5544]">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-[#d0c7ba] bg-white px-5 py-3 text-sm font-bold text-[#5f574c] transition hover:bg-[#ece4d5]"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                {sourceImage ? "Upload Another Photo" : "Upload Photo"}
              </button>
              <button
                className="rounded-full border border-[#d0c7ba] bg-white px-5 py-3 text-sm font-bold text-[#5f574c] transition hover:bg-[#ece4d5]"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-[#a4c5d2] px-6 py-3 text-sm font-bold text-[#34424a] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving || !sourceImage}
                onClick={handleSave}
                type="button"
              >
                {isSaving ? "Pressing stamp..." : "Press stamp into square"}
              </button>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-[#ddd4c8] bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(242,235,224,0.94))] p-4 sm:p-5">
            <StampEditor imageSrc={sourceImage} ref={editorRef} />
          </div>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
