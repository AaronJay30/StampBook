"use client";

import { startTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { StampEditor, type StampEditorHandle } from "@/components/StampEditor";
import type { StampShape } from "@/lib/types";

const shapeOptions: Array<{ label: string; value: StampShape }> = [
  { label: "Square", value: "square" },
  { label: "Circle", value: "circle" },
  { label: "Heart", value: "heart" },
  { label: "Star", value: "star" },
  { label: "Stamp Edge", value: "stamp_edge" },
];

export function StampStudio() {
  const router = useRouter();
  const editorRef = useRef<StampEditorHandle>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [shape, setShape] = useState<StampShape>("stamp_edge");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
          imageUrl: exportedImage,
          shape,
          description,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to save the stamp.");
      }

      setDescription("");
      setSourceImage(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the stamp.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--paper-border)] bg-paper/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur">
      <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase">Stamp Studio</p>
      <h2 className="mt-2 text-3xl font-extrabold">Create a new memory stamp</h2>
      <p className="mt-3 text-sm leading-7 text-foreground/75">
        Upload a photo, frame it inside a stamp mask, and save it into the next open slot in your book.
      </p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.7fr_1fr]">
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
            Source image
            <input
              accept="image/png,image/jpeg,image/webp"
              className="rounded-2xl border border-[var(--paper-border)] bg-white px-4 py-3"
              onChange={handleFileChange}
              type="file"
            />
          </label>

          <div>
            <p className="text-sm font-semibold text-foreground">Shape pack</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {shapeOptions.map((option) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${shape === option.value ? "bg-primary text-foreground" : "bg-white text-foreground hover:bg-secondary"}`}
                  key={option.value}
                  onClick={() => setShape(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold text-foreground">
            Story note
            <textarea
              className="min-h-32 rounded-[1.5rem] border border-[var(--paper-border)] bg-white px-4 py-3 outline-none"
              maxLength={280}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Why does this memory matter?"
              value={description}
            />
          </label>

          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <button
            className="w-full rounded-full bg-primary px-5 py-3 font-bold text-foreground transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            onClick={handleSave}
            type="button"
          >
            {isSaving ? "Stamping..." : "Stamp 🌸"}
          </button>
        </div>

        <StampEditor imageSrc={sourceImage} ref={editorRef} shape={shape} />
      </div>
    </section>
  );
}
