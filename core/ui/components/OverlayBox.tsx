"use client";

import { RefObject, useRef } from "react";
import {
  useEditor,
  useEditorDispatch,
} from "@/core/applications/contexts/EditorContext";
import { Overlay } from "@/core/domain/entities/overlay";
import { OverlayResizeHandle } from "./OverlayResizeHandle";
import { TextStyleControls } from "./TextStyleControls";

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function OverlayBox({
  overlay,
  containerRef,
}: {
  overlay: Overlay;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const { state } = useEditor();
  const dispatch = useEditorDispatch();
  const start = useRef<{ x: number; y: number } | null>(null);

  /* ---------- overlay box click (select + drag only) ---------- */
  function onOverlayMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    dispatch({
      type: "SELECT_OVERLAY",
      payload: { overlayId: overlay.id },
    });

    start.current = { x: e.clientX, y: e.clientY };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function onMove(e: MouseEvent) {
    if (!start.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = (e.clientX - start.current.x) / rect.width;
    const dy = (e.clientY - start.current.y) / rect.height;

    start.current = { x: e.clientX, y: e.clientY };

    dispatch({
      type: "MOVE_OVERLAY",
      payload: {
        overlayId: overlay.id,
        dx,
        dy,
      },
    });
  }

  function onUp() {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
  }

  const bgColor = overlay.textStyle?.backgroundColor ?? "#000000";
  const bgOpacity = overlay.textStyle?.backgroundOpacity ?? 0.4;

  const isEditingText = state.editingOverlayId === overlay.id;

  return (
    <div
      data-overlay-root
      onMouseDown={onOverlayMouseDown}
      className="overlay-box cursor-move"
      style={{
        left: `${overlay.geometry.x * 100}%`,
        top: `${overlay.geometry.y * 100}%`,
        width: `${overlay.geometry.width * 100}%`,
        height: `${overlay.geometry.height * 100}%`,
        backgroundColor: hexToRgba(bgColor, bgOpacity),
      }}
    >
      {/* TEXT STYLE CONTROLS — ONLY WHEN TEXT CLICKED */}
      {isEditingText && (
        <div
          className="overlay-controls"
          onMouseDown={e => e.stopPropagation()}
        >
          <TextStyleControls overlayId={overlay.id} />
        </div>
      )}

      {/* TEXT */}
      {overlay.type === "text" && (
        <div
          contentEditable
          suppressContentEditableWarning
          className="overlay-text"
          onMouseDown={e => {
            e.stopPropagation();
            dispatch({
              type: "START_EDIT_TEXT",
              payload: { overlayId: overlay.id },
            });
          }}
          onBlur={e =>
            dispatch({
              type: "UPDATE_OVERLAY_CONTENT",
              payload: {
                overlayId: overlay.id,
                text: e.currentTarget.innerText,
              },
            })
          }
          style={{
            fontSize: `${overlay.textStyle?.fontSize ?? 16}px`,
            color: overlay.textStyle?.color ?? "#ffffff",
          }}
        >
          {overlay.text || "Type here"}
        </div>
      )}

      {state.selectedOverlayId === overlay.id && (
        <OverlayResizeHandle
          overlayId={overlay.id}
          containerRef={containerRef}
          geometry={overlay.geometry}
        />
      )}

    </div>
  );
}
