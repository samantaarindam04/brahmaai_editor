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
  const isDraggingRef = useRef(false);

  /* ---------- overlay box click (select + drag) ---------- */
  function onOverlayMouseDown(e: React.MouseEvent) {
    // ✅ BLOCK all interactions during playback
    if (state.isPlaying) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // ✅ CRITICAL FIX: Don't start drag if clicking on text or controls
    const target = e.target as HTMLElement;
    if (
      target.closest('[contenteditable]') ||
      target.closest('.overlay-controls') ||
      target.closest('[data-resize-handle]')
    ) {
      return;
    }

    e.stopPropagation();

    // Select the overlay
    dispatch({
      type: "SELECT_OVERLAY",
      payload: { overlayId: overlay.id },
    });

    start.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  function onMove(e: MouseEvent) {
    if (!start.current || !containerRef.current) return;

    // Mark as dragging after any movement
    isDraggingRef.current = true;

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
    isDraggingRef.current = false;
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
          contentEditable={!state.isPlaying && isEditingText} // ✅ Only editable when in edit mode
          suppressContentEditableWarning
          className="overlay-text"
          onClick={(e) => {
            // ✅ FIXED: Use onClick instead of onMouseDown for text editing
            if (state.isPlaying) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }

            // Only enable editing if not already editing
            if (!isEditingText) {
              e.stopPropagation();
              
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

              // ✅ Focus the text element after a brief delay
              setTimeout(() => {
                const textElement = e.currentTarget;
                textElement.focus();
                
                // Select all text for easy editing
                const range = document.createRange();
                range.selectNodeContents(textElement);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
              }, 0);
            }
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
              
              // Exit edit mode on blur
              dispatch({
                type: "SELECT_OVERLAY",
                payload: { overlayId: overlay.id },
              });
            }
          }}
          onMouseDown={(e) => {
            // ✅ Prevent drag when editing text
            if (isEditingText) {
              e.stopPropagation();
            }
          }}
          style={{
            fontSize: `${overlay.textStyle?.fontSize ?? 16}px`,
            color: overlay.textStyle?.color ?? "#ffffff",
            outline: 'none',
            cursor: isEditingText ? 'text' : (state.isPlaying ? 'default' : 'pointer'),
            userSelect: state.isPlaying ? 'none' : 'text',
            padding: '4px',
            minHeight: '1em',
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