"use client";

import { useRef } from "react";
import { useEditor } from "@/core/applications/contexts/EditorContext";
import { usePlaybackCoordinator } from "@/core/applications/hooks/usePlaybackCoordinator";
import { OverlayBox } from "./OverlayBox";

export function VideoPreview() {
  const { state, dispatch } = useEditor();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  usePlaybackCoordinator({
    state,
    dispatch,
    videoElementRef: videoRef,
  });

  return (
    <div
      ref={containerRef}
      className="video-preview relative w-full overflow-hidden flex-1 border border-dashed border-gray-700 bg-black flex items-center justify-center"

      onMouseDownCapture={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-overlay-root]")) {
          return;
        }
        dispatch({
          type: "DESELECT_OVERLAY",
        })
      }
      }
    >
      <video ref={videoRef} className="video-js" />

      {state.timeline.overlays.map(o => (
        <OverlayBox
          key={o.id}
          overlay={o}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}
