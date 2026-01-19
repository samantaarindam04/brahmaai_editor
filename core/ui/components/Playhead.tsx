"use client";

import { useEditor } from "@/core/applications/contexts/EditorContext";
import { useEffect, useRef } from "react";

interface Props {
  px: number;
}

/**
 * Playhead
 * - Pure visual projection of editor currentTime
 * - Dragging dispatches SET_TIME
 * - Uses document-level mouse listeners for robustness
 */
export default function Playhead({ px }: Props) {
  const { state, dispatch } = useEditor();
  const draggingRef = useRef(false);

  /**
   * Global mouse listeners
   * Ensures dragging works even if cursor leaves the playhead
   */
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current) return;

      const timeline = document.getElementById("timeline");
      if (!timeline) return;

      const rect = timeline.getBoundingClientRect();
      const x = e.clientX - rect.left;

      dispatch({
        type: "SET_TIME",
        payload: Math.max(0, x / px),
      });
    }

    function onMouseUp() {
      draggingRef.current = false;
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [dispatch, px]);

  return (
    <div
      onMouseDown={() => {
        draggingRef.current = true;
      }}
      className="playhead"
      style={{
        position: "absolute",
        left: state.currentTime * px,
        top: 0,
        bottom: 0,
        width: 2,
        background: "red",
        cursor: "ew-resize",
        pointerEvents: "auto",
      }}
    />
  );
}
