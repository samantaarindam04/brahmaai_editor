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

  const visibleOverlays = state.timeline.overlays.filter((overlay) => {
    const timing = state.overlayTimings.find(t => t.overlayId === overlay.id);
    if (!timing) return false;

    const segment = state.timeline.segments.find(s => s.id === timing.segmentId);
    if (!segment) return false;

    const absoluteStartTime = segment.startTime + timing.startTime;
    const absoluteEndTime = absoluteStartTime + timing.duration;
    const isVisibleByTime =
      state.currentTime >= absoluteStartTime &&
      state.currentTime < absoluteEndTime;
    const isSelectedWhilePaused = 
      !state.isPlaying && state.selectedOverlayId === overlay.id;

    return isVisibleByTime || isSelectedWhilePaused;
  });

  return (
    <div
      ref={containerRef}
      className="video-preview relative w-full overflow-hidden flex-1 border border-dashed border-gray-700 bg-black flex items-center justify-center"
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (target === e.currentTarget) {
          dispatch({
            type: "DESELECT_OVERLAY",
          });
        }
      }}
    >
      <video ref={videoRef} className="video-js" />

      {visibleOverlays.map(o => (
        <OverlayBox
          key={o.id}
          overlay={o}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}