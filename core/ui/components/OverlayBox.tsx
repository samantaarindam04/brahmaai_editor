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

  /* ---------- overlay box click (select + drag) ---------- */
  function onOverlayMouseDown(e: React.MouseEvent) {
    // ✅ BLOCK all interactions during playback
    if (state.isPlaying) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.stopPropagation();

    // Only select if not clicking on the text element
    const target = e.target as HTMLElement;
    if (!target.closest('[contenteditable]')) {
      dispatch({
        type: "SELECT_OVERLAY",
        payload: { overlayId: overlay.id },
      });

      start.current = { x: e.clientX, y: e.clientY };
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    }
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

  const isSelected = state.selectedOverlayId === overlay.id;
  const isEditingText = state.editingOverlayId === overlay.id;

  return (
    <div
      data-overlay-root
      onMouseDown={onOverlayMouseDown}
      className={`overlay-box ${!state.isPlaying ? 'cursor-move' : 'pointer-events-none'} ${isSelected && !state.isPlaying ? '' : ''}`}
      style={{
        position: 'absolute',
        left: `${overlay.geometry.x * 100}%`,
        top: `${overlay.geometry.y * 100}%`,
        width: `${overlay.geometry.width * 100}%`,
        height: `${overlay.geometry.height * 100}%`,
        backgroundColor: hexToRgba(bgColor, bgOpacity),
      }}
    >
      {/* TEXT STYLE CONTROLS — ONLY WHEN PAUSED AND TEXT EDITING */}
      {!state.isPlaying && isEditingText && (
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
          contentEditable={!state.isPlaying} // ✅ Only editable when paused
          suppressContentEditableWarning
          className="overlay-text"
          onMouseDown={e => {
            // ✅ BLOCK text editing during playback
            if (state.isPlaying) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }

            e.stopPropagation();
            e.preventDefault();
            
            // Select the overlay first
            dispatch({
              type: "SELECT_OVERLAY",
              payload: { overlayId: overlay.id },
            });
            
            // Then enable text editing
            dispatch({
              type: "START_EDIT_TEXT",
              payload: { overlayId: overlay.id },
            });
          }}
          onBlur={e => {
            if (!state.isPlaying) {
              dispatch({
                type: "UPDATE_OVERLAY_CONTENT",
                payload: {
                  overlayId: overlay.id,
                  text: e.currentTarget.innerText,
                },
              });
            }
          }}
          style={{
            fontSize: `${overlay.textStyle?.fontSize ?? 16}px`,
            color: overlay.textStyle?.color ?? "#ffffff",
            outline: 'none',
            cursor: state.isPlaying ? 'default' : 'text',
            userSelect: state.isPlaying ? 'none' : 'text',
          }}
        >
          {overlay.text || "Type here"}
        </div>
      )}

      {/* RESIZE HANDLES - ONLY WHEN PAUSED AND SELECTED */}
      {!state.isPlaying && isSelected && (
        <OverlayResizeHandle
          overlayId={overlay.id}
          containerRef={containerRef}
          geometry={overlay.geometry}
        />
      )}
    </div>
  );
}