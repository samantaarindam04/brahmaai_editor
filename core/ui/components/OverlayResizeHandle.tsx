"use client";

import { useRef } from "react";
import { useEditorDispatch } from "@/core/applications/contexts/EditorContext";
import { OverlayGeometry } from "@/core/domain/value-objects/OverlayGeometry";

export function OverlayResizeHandle({
  overlayId,
  containerRef,
  geometry
}: {
  overlayId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  geometry: OverlayGeometry;
}) {
  const dispatch = useEditorDispatch();
  const start = useRef<{
    x: number
    y: number
    geometry: OverlayGeometry
  } | null>(null)

  function onMouseDown(e: React.MouseEvent) {
    e.stopPropagation()

    if (!containerRef.current) return

    start.current = {
      x: e.clientX,
      y: e.clientY,
      geometry: { ...geometry },
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  function onMove(e: MouseEvent) {
    if (!start.current || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const dx = (e.clientX - start.current.x) / rect.width
    const dy = (e.clientY - start.current.y) / rect.height

    dispatch({
      type: "RESIZE_OVERLAY",
      payload: {
        overlayId,
        geometry: {
          width: start.current.geometry.width + dx,
          height: start.current.geometry.height + dy,
        },
      },
    })
  }

  function onUp() {
    start.current = null
    window.removeEventListener("mousemove", onMove)
    window.removeEventListener("mouseup", onUp)
  }

  return (
    <div
      className="overlay-resize-handle"
      onMouseDown={onMouseDown}
    />
  );
}
