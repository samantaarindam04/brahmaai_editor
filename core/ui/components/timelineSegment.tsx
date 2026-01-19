"use client";

import { useRef } from "react";
import { useEditor } from "@/core/applications/contexts/EditorContext";
import { VideoSegment } from "@/core/domain/entities/videoSegment";

interface Props {
  segment: VideoSegment;
  px: number;
}

/**
 * TimelineSegment
 *
 * Responsibilities:
 * - Drag segment horizontally (MOVE_SEGMENT)
 * - Resize from start or end (RESIZE_SEGMENT)
 *
 * UI emits intent only.
 * Business rules live in reducer.
 */
export default function TimelineSegment({ segment, px }: Props) {
  const { dispatch } = useEditor();

  const dragStartX = useRef<number | null>(null);
  const resizeStartX = useRef<number | null>(null);
  const resizeEdge = useRef<"start" | "end" | null>(null);

  /* ---------- DRAG ---------- */

  function onDragMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    dragStartX.current = e.clientX;

    document.addEventListener("mousemove", onDragMouseMove);
    document.addEventListener("mouseup", onDragMouseUp);
  }

  function onDragMouseMove(e: MouseEvent) {
    if (dragStartX.current === null) return;

    const deltaPx = e.clientX - dragStartX.current;
    const deltaTime = deltaPx / px;

    dispatch({
      type: "MOVE_SEGMENT",
      payload: {
        segmentId: segment.id,
        delta: deltaTime,
      },
    });

    dragStartX.current = e.clientX;
  }

  function onDragMouseUp() {
    dragStartX.current = null;
    document.removeEventListener("mousemove", onDragMouseMove);
    document.removeEventListener("mouseup", onDragMouseUp);
  }

  /* ---------- RESIZE ---------- */

  function onResizeMouseDown(
    e: React.MouseEvent<HTMLDivElement>,
    edge: "start" | "end"
  ) {
    e.stopPropagation();

    resizeStartX.current = e.clientX;
    resizeEdge.current = edge;

    document.addEventListener("mousemove", onResizeMouseMove);
    document.addEventListener("mouseup", onResizeMouseUp);
  }

  function onResizeMouseMove(e: MouseEvent) {
    if (
      resizeStartX.current === null ||
      resizeEdge.current === null
    )
      return;

    const deltaPx = e.clientX - resizeStartX.current;
    const deltaTime = deltaPx / px;

    dispatch({
      type: "RESIZE_SEGMENT",
      payload: {
        segmentId: segment.id,
        delta: deltaTime,
        edge: resizeEdge.current,
      },
    });

    resizeStartX.current = e.clientX;
  }

  function onResizeMouseUp() {
    resizeStartX.current = null;
    resizeEdge.current = null;

    document.removeEventListener("mousemove", onResizeMouseMove);
    document.removeEventListener("mouseup", onResizeMouseUp);
  }

  return (
    <div
      onMouseDown={onDragMouseDown}
      className="absolute h-10 bg-blue-600 text-white text-xs flex items-center justify-center cursor-move rounded"
      style={{
        left: segment.startTime * px,
        width: segment.duration * px,
      }}
    >
      {/* Start resize handle */}
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "start")}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-blue-800"
      />

      {segment.source}

      {/* End resize handle */}
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "end")}
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize bg-blue-800"
      />
    </div>
  );
}
