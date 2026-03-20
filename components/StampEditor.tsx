"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, RegularPolygon, Stage, Transformer } from "react-konva";
import type Konva from "konva";

import type { StampShape } from "@/lib/types";

const CANVAS_SIZE = 280;
const MASK_INSET = 18;
const MASK_SIZE = CANVAS_SIZE - MASK_INSET * 2;

export interface StampEditorHandle {
  exportImage: () => string | null;
}

interface StampEditorProps {
  imageSrc: string | null;
  shape: StampShape;
}

function createHeartPoints(centerX: number, centerY: number, size: number) {
  const topY = centerY - size * 0.18;
  return [
    centerX, centerY + size * 0.36,
    centerX - size * 0.52, centerY - size * 0.02,
    centerX - size * 0.56, topY - size * 0.28,
    centerX - size * 0.18, topY - size * 0.44,
    centerX, topY - size * 0.12,
    centerX + size * 0.18, topY - size * 0.44,
    centerX + size * 0.56, topY - size * 0.28,
    centerX + size * 0.52, centerY - size * 0.02,
  ];
}

export const StampEditor = forwardRef<StampEditorHandle, StampEditorProps>(function StampEditor(
  { imageSrc, shape },
  ref,
) {
  const stageRef = useRef<Konva.Stage>(null);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [imageState, setImageState] = useState<{
    element: HTMLImageElement | null;
    src: string | null;
  }>({
    element: null,
    src: null,
  });
  const [transform, setTransform] = useState({
    x: CANVAS_SIZE / 2,
    y: CANVAS_SIZE / 2,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  });

  useEffect(() => {
    if (!imageSrc) {
      return;
    }

    let isActive = true;
    const nextImage = new window.Image();
    nextImage.src = imageSrc;
    nextImage.onload = () => {
      if (!isActive) {
        return;
      }

      setImageState({
        element: nextImage,
        src: imageSrc,
      });
      setTransform({
        x: CANVAS_SIZE / 2,
        y: CANVAS_SIZE / 2,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        offsetX: nextImage.width / 2,
        offsetY: nextImage.height / 2,
      });
    };

    return () => {
      isActive = false;
    };
  }, [imageSrc]);

  const imageElement = imageSrc === imageState.src ? imageState.element : null;

  useEffect(() => {
    if (imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [imageElement]);

  useImperativeHandle(ref, () => ({
    exportImage() {
      if (!stageRef.current || !imageElement) {
        return null;
      }

      return stageRef.current.toDataURL({
        pixelRatio: 2,
        mimeType: "image/png",
      });
    },
  }), [imageElement]);

  const heartPoints = useMemo(
    () => createHeartPoints(CANVAS_SIZE / 2, CANVAS_SIZE / 2, MASK_SIZE / 2),
    [],
  );

  function handleWheel(event: Konva.KonvaEventObject<WheelEvent>) {
    event.evt.preventDefault();

    const node = imageRef.current;
    if (!node) {
      return;
    }

    const currentScale = node.scaleX();
    const nextScale = event.evt.deltaY > 0 ? currentScale * 0.95 : currentScale * 1.05;
    const clampedScale = Math.min(3.2, Math.max(0.35, nextScale));

    node.scale({ x: clampedScale, y: clampedScale });
    node.getLayer()?.batchDraw();
    setTransform((current) => ({
      ...current,
      scaleX: clampedScale,
      scaleY: clampedScale,
    }));
  }

  function renderMaskOutline() {
    switch (shape) {
      case "circle":
        return (
          <Circle
            listening={false}
            radius={MASK_SIZE / 2}
            stroke="#f8afa6"
            strokeWidth={3}
            x={CANVAS_SIZE / 2}
            y={CANVAS_SIZE / 2}
          />
        );
      case "heart":
        return (
          <Line
            closed
            fill="rgba(255, 255, 255, 0.08)"
            listening={false}
            points={heartPoints}
            stroke="#f8afa6"
            strokeWidth={3}
          />
        );
      case "star":
        return (
          <RegularPolygon
            fill="rgba(255, 255, 255, 0.08)"
            listening={false}
            radius={MASK_SIZE / 2}
            sides={5}
            stroke="#f8afa6"
            strokeWidth={3}
            x={CANVAS_SIZE / 2}
            y={CANVAS_SIZE / 2}
          />
        );
      case "stamp_edge":
        return (
          <Rect
            cornerRadius={26}
            dash={[10, 8]}
            fill="rgba(255, 255, 255, 0.08)"
            height={MASK_SIZE}
            listening={false}
            stroke="#f8afa6"
            strokeWidth={3}
            width={MASK_SIZE}
            x={MASK_INSET}
            y={MASK_INSET}
          />
        );
      default:
        return (
          <Rect
            cornerRadius={24}
            fill="rgba(255, 255, 255, 0.08)"
            height={MASK_SIZE}
            listening={false}
            stroke="#f8afa6"
            strokeWidth={3}
            width={MASK_SIZE}
            x={MASK_INSET}
            y={MASK_INSET}
          />
        );
    }
  }

  function clipMask(context: Konva.Context) {
    switch (shape) {
      case "circle":
        context.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, MASK_SIZE / 2, 0, Math.PI * 2, false);
        break;
      case "heart":
        context.moveTo(heartPoints[0], heartPoints[1]);
        for (let index = 2; index < heartPoints.length; index += 2) {
          context.lineTo(heartPoints[index], heartPoints[index + 1]);
        }
        context.closePath();
        break;
      case "star": {
        const centerX = CANVAS_SIZE / 2;
        const centerY = CANVAS_SIZE / 2;
        const outerRadius = MASK_SIZE / 2;
        const innerRadius = outerRadius * 0.45;
        for (let index = 0; index < 10; index += 1) {
          const radius = index % 2 === 0 ? outerRadius : innerRadius;
          const angle = (Math.PI / 5) * index - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          if (index === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.closePath();
        break;
      }
      default:
        context.roundRect(MASK_INSET, MASK_INSET, MASK_SIZE, MASK_SIZE, shape === "stamp_edge" ? 16 : 24);
        break;
    }
  }

  return (
    <div className="rounded-[1.8rem] border border-[var(--paper-border)] bg-white p-4 shadow-[var(--shadow-soft)]">
      <Stage className="mx-auto rounded-[1.5rem] bg-secondary/30" height={CANVAS_SIZE} ref={stageRef} width={CANVAS_SIZE}>
        <Layer onWheel={handleWheel}>
          <Rect fill="rgba(255,255,255,0.55)" height={CANVAS_SIZE} width={CANVAS_SIZE} />
          <Group clipFunc={clipMask}>
            {imageElement ? (
              <KonvaImage
                draggable
                image={imageElement}
                onDragEnd={(event) => {
                  setTransform((current) => ({
                    ...current,
                    x: event.target.x(),
                    y: event.target.y(),
                  }));
                }}
                onTransformEnd={() => {
                  const node = imageRef.current;
                  if (!node) {
                    return;
                  }

                  setTransform({
                    x: node.x(),
                    y: node.y(),
                    scaleX: node.scaleX(),
                    scaleY: node.scaleY(),
                    rotation: node.rotation(),
                    offsetX: node.offsetX(),
                    offsetY: node.offsetY(),
                  });
                }}
                ref={imageRef}
                rotation={transform.rotation}
                scaleX={transform.scaleX}
                scaleY={transform.scaleY}
                x={transform.x}
                y={transform.y}
                offsetX={transform.offsetX}
                offsetY={transform.offsetY}
              />
            ) : null}
          </Group>
          {renderMaskOutline()}
          {imageElement ? (
            <Transformer
              anchorCornerRadius={14}
              anchorFill="#ffffff"
              anchorSize={14}
              borderDash={[6, 4]}
              borderStroke="#f8afa6"
              keepRatio={false}
              ref={transformerRef}
              rotateAnchorOffset={24}
            />
          ) : null}
        </Layer>
      </Stage>
      <p className="mt-3 text-xs leading-6 text-foreground/65">
        Drag to reposition, use the handles to scale or rotate, and use your mouse wheel to zoom the image inside the stamp mask.
      </p>
    </div>
  );
});
