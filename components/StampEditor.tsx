"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage } from "react-konva";

const STAGE_WIDTH = 480;
const STAGE_HEIGHT = 600;
const OVERLAY_WIDTH = 440;
const OVERLAY_HEIGHT = Math.round((4219 / 3375) * OVERLAY_WIDTH); // ≈ 550

const NUDGE = 10;

export interface StampEditorHandle {
  centerStamp: () => void;
  exportImage: () => string | null;
  nudge: (direction: "up" | "down" | "left" | "right") => void;
}

interface StampEditorProps {
  imageSrc: string | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const StampEditor = forwardRef<StampEditorHandle, StampEditorProps>(function StampEditor(
  { imageSrc },
  ref,
) {
  const [imageState, setImageState] = useState<{ element: HTMLImageElement | null; src: string | null }>({
    element: null,
    src: null,
  });
  const [overlayState, setOverlayState] = useState<{ element: HTMLImageElement | null }>({ element: null });
  // maskRef: opaque only where the green screen was — used to clip the export to the stamp-window shape
  const maskRef = useRef<HTMLImageElement | null>(null);
  // windowBounds: the exact bounding box of the green screen in overlay-space pixels,
  // detected dynamically from the real stamp.png so the crop is always pixel-perfect.
  const [windowBounds, setWindowBounds] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const [overlayPosition, setOverlayPosition] = useState({
    x: (STAGE_WIDTH - OVERLAY_WIDTH) / 2,
    y: (STAGE_HEIGHT - OVERLAY_HEIGHT) / 2,
  });

  // Zoom control for the preview image (0.5x to 3x)
  const [zoom, setZoom] = useState(1);
  const handleZoom = (direction: "in" | "out") => {
    setZoom((z) => {
      const newZoom = direction === "in" ? z * 1.2 : z / 1.2;
      return Math.max(0.5, Math.min(3, Math.round(newZoom * 100) / 100));
    });
  };

  // Load and process stamp.png — detect green-screen bounds, build mask
  useEffect(() => {
    let active = true;
    const raw = new window.Image();
    raw.src = "/stamp.png";
    raw.onload = () => {
      if (!active) return;

      const canvas = document.createElement("canvas");
      canvas.width = raw.width;
      canvas.height = raw.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(raw, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      // Mask canvas — opaque white only where the green screen was
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = raw.width;
      maskCanvas.height = raw.height;
      const mCtx = maskCanvas.getContext("2d")!;
      const maskData = mCtx.createImageData(raw.width, raw.height);
      const md = maskData.data;

      // Scan pixels: detect green, build mask, AND compute the true bounding box
      // of the green region so we never rely on hardcoded estimates.
      let minGX = raw.width, minGY = raw.height, maxGX = 0, maxGY = 0;
      let gpx = 0, gpy = 0;
      const rawW = raw.width;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const isGreen = g > 150 && r < 150 && b < 150;

        if (isGreen) {
          // Track the exact green bounding box (row/col counters avoid expensive division)
          if (gpx < minGX) minGX = gpx;
          if (gpx > maxGX) maxGX = gpx;
          if (gpy < minGY) minGY = gpy;
          if (gpy > maxGY) maxGY = gpy;

          d[i + 3] = 0;             // Remove green from overlay
          md[i] = 255; md[i + 1] = 255; md[i + 2] = 255; md[i + 3] = 255; // Opaque in mask
        } else {
          md[i + 3] = 0;            // Transparent in mask (frame area stays invisible)
        }

        gpx++;
        if (gpx === rawW) { gpx = 0; gpy++; }
      }

      ctx.putImageData(imgData, 0, 0);
      mCtx.putImageData(maskData, 0, 0);

      // Scale green bounding box from raw-pixel coords to overlay-display coords
      const scaleX = OVERLAY_WIDTH / raw.width;
      const scaleY = OVERLAY_HEIGHT / raw.height;
      if (active) {
        setWindowBounds({
          x: minGX * scaleX,
          y: minGY * scaleY,
          w: (maxGX - minGX + 1) * scaleX,
          h: (maxGY - minGY + 1) * scaleY,
        });
      }

      // Stamp overlay (green area removed, transparent hole where photo will show)
      const stampImg = new window.Image();
      stampImg.src = canvas.toDataURL("image/png");
      stampImg.onload = () => {
        if (active) setOverlayState({ element: stampImg });
      };

      // Green-screen shape mask (for export clipping)
      const maskImg = new window.Image();
      maskImg.src = maskCanvas.toDataURL("image/png");
      maskImg.onload = () => {
        if (active) { maskRef.current = maskImg; }
      };
    };
    return () => { active = false; };
  }, []);

  // Load user photo
  useEffect(() => {
    if (!imageSrc) return;
    let active = true;
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!active) return;
      setImageState({ element: img, src: imageSrc });
      setOverlayPosition({
        x: (STAGE_WIDTH - OVERLAY_WIDTH) / 2,
        y: (STAGE_HEIGHT - OVERLAY_HEIGHT) / 2,
      });
    };
    return () => { active = false; };
  }, [imageSrc]);

  const imageElement = imageSrc === imageState.src ? imageState.element : null;
  const overlayElement = overlayState.element;

  // Photo: "contain" within 90% of stage — large but still fully visible, respecting zoom
  const photoPlacement = useMemo(() => {
    if (!imageElement) return null;
    const maxW = STAGE_WIDTH * 0.9;
    const maxH = STAGE_HEIGHT * 0.9;
    const baseScale = Math.min(maxW / imageElement.width, maxH / imageElement.height);
    const scale = baseScale * zoom;
    const w = imageElement.width * scale;
    const h = imageElement.height * scale;
    return { width: w, height: h, x: (STAGE_WIDTH - w) / 2, y: (STAGE_HEIGHT - h) / 2, scale };
  }, [imageElement, zoom]);

  // Helpers to read the computed window bounds (fallback to rough estimates if not yet loaded)
  function getWindowBounds() {
    return windowBounds ?? {
      x: OVERLAY_WIDTH * 0.14,
      y: OVERLAY_HEIGHT * 0.14,
      w: OVERLAY_WIDTH * 0.72,
      h: OVERLAY_HEIGHT * 0.52,
    };
  }

  // Constrain stamp to stay within the stage bounds
  function getConstraints() {
    return {
      minX: -OVERLAY_WIDTH,
      maxX: STAGE_WIDTH,
      minY: -OVERLAY_HEIGHT,
      maxY: STAGE_HEIGHT,
    };
  }

  function constrainPosition(x: number, y: number) {
    const c = getConstraints();
    return { x: clamp(x, c.minX, c.maxX), y: clamp(y, c.minY, c.maxY) };
  }

  function setConstrained(x: number, y: number) {
    setOverlayPosition(constrainPosition(x, y));
  }

  const constrained = constrainPosition(overlayPosition.x, overlayPosition.y);

  useImperativeHandle(ref, () => ({
    centerStamp() {
      setConstrained((STAGE_WIDTH - OVERLAY_WIDTH) / 2, (STAGE_HEIGHT - OVERLAY_HEIGHT) / 2);
    },
    nudge(direction) {
      const delta = { up: [0, -NUDGE], down: [0, NUDGE], left: [-NUDGE, 0], right: [NUDGE, 0] }[direction];
      setConstrained(constrained.x + delta[0], constrained.y + delta[1]);
    },
    exportImage() {
      if (!imageElement || !photoPlacement) return null;

      // Use the dynamically-detected green bounding box.
      // This guarantees the crop matches the exact stamp-window shape in the real image,
      // regardless of stamp.png dimensions or layout.
      const wb = getWindowBounds();

      const outW = 1200;
      const outH = Math.round(outW * (wb.h / wb.w));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Scale factor: output pixels per overlay pixel
      const outputScale = outW / wb.w;

      // Where does the stamp window start in stage space?
      const winOriginX = constrained.x + wb.x;
      const winOriginY = constrained.y + wb.y;

      // Photo position expressed relative to the window's top-left corner
      const px = (photoPlacement.x - winOriginX) * outputScale;
      const py = (photoPlacement.y - winOriginY) * outputScale;
      const pw = photoPlacement.width * outputScale;
      const ph = photoPlacement.height * outputScale;
      ctx.drawImage(imageElement, px, py, pw, ph);

      // Clip the photo to the exact perforated stamp-window shape via the mask
      if (maskRef.current) {
        const rawW = maskRef.current.naturalWidth;
        const rawH = maskRef.current.naturalHeight;
        // Sample only the green-window region of the mask
        const srcX = (wb.x / OVERLAY_WIDTH) * rawW;
        const srcY = (wb.y / OVERLAY_HEIGHT) * rawH;
        const srcW = (wb.w / OVERLAY_WIDTH) * rawW;
        const srcH = (wb.h / OVERLAY_HEIGHT) * rawH;
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(maskRef.current, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
      }

      return canvas.toDataURL("image/png");
    },
  }), [constrained.x, constrained.y, imageElement, photoPlacement, windowBounds]);

  return (
    <div className="page-texture rounded-xl border border-stone-200 bg-[#F9F7F2] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_rgba(80,70,58,0.10)]">
      {/* Zoom controls */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <button
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 hover:text-stone-700 active:bg-stone-100"
          onClick={() => handleZoom("out")}
          type="button"
        >
          <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M8 11h6" />
          </svg>
        </button>
        <div className="min-w-12 text-center font-serif text-xs italic text-stone-500">
          {Math.round(zoom * 100)}%
        </div>
        <button
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 hover:text-stone-700 active:bg-stone-100"
          onClick={() => handleZoom("in")}
          type="button"
        >
          <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M11 8v6M8 11h6" />
          </svg>
        </button>
      </div>
      <Stage className="mx-auto rounded-lg bg-[#f5f0e8]" height={STAGE_HEIGHT} width={STAGE_WIDTH}>
        <Layer>
          {/* Paper background */}
          <Rect fill="#f2ede4" height={STAGE_HEIGHT} width={STAGE_WIDTH} />

          {/* User photo — centered, static */}
          {photoPlacement && imageElement ? (
            <KonvaImage
              height={photoPlacement.height}
              image={imageElement}
              width={photoPlacement.width}
              x={photoPlacement.x}
              y={photoPlacement.y}
            />
          ) : null}

          {/* Light vignette */}
          <Rect fill="rgba(80,68,52,0.06)" height={STAGE_HEIGHT} width={STAGE_WIDTH} />

          {/* Stamp PNG overlay — draggable, green screen removed */}
          {overlayElement ? (
            <Group
              draggable
              dragBoundFunc={(pos) => constrainPosition(pos.x, pos.y)}
              onDragEnd={(e) => { setConstrained(e.target.x(), e.target.y()); }}
              x={constrained.x}
              y={constrained.y}
            >
              <KonvaImage
                height={OVERLAY_HEIGHT}
                image={overlayElement}
                width={OVERLAY_WIDTH}
              />
            </Group>
          ) : null}
        </Layer>
      </Stage>
      <p className="mt-2 text-center text-[0.68rem] font-semibold tracking-widest text-stone-400">
        Drag the stamp over your photo — the window will cut out to its exact shape
      </p>
    </div>
  );
});

