"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@/core/applications/contexts/EditorContext";
import { useTimelineScale } from "@/core/applications/hooks/useTimelineScale";
import TimelineSegment from "./timelineSegment";
import Playhead from "./Playhead";

const TRACK_LABEL_WIDTH = 128;

export function Timeline() {
  const { state, dispatch } = useEditor();
  const { pxPerSec, setPxPerSec, fitToDuration } = useTimelineScale();

  const rulerRef = useRef<HTMLDivElement | null>(null);
  const tracksRef = useRef<HTMLDivElement | null>(null);

  const duration = state.timeline.duration || 60;
  const MIN_DURATION = 60;
  const displayDuration = Math.max(duration, MIN_DURATION);

  useEffect(() => {
    const tracks = tracksRef.current;
    const ruler = rulerRef.current;
    if (!tracks || !ruler) return;

    const syncScroll = () => {
      ruler.scrollLeft = tracks.scrollLeft;
    };

    tracks.addEventListener("scroll", syncScroll);
    return () => tracks.removeEventListener("scroll", syncScroll);
  }, []);

  function formatTime(sec: number) {
    if (sec === 0) return "0.00";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const timelineWidth = displayDuration * pxPerSec;

  return (
    <div className="w-full bg-neutral-900 text-gray-200 border-t border-neutral-700">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-700">
        <div className="font-medium">Timeline</div>

        <div className="flex items-center gap-3 text-sm">
          <button
            className="px-2 py-1 bg-neutral-700 rounded hover:bg-neutral-600"
            onClick={() => {
              if (!rulerRef.current) return;
              fitToDuration(displayDuration, rulerRef.current.clientWidth);
            }}
          >
            Fit to Screen
          </button>

          <span className="text-gray-400">Zoom</span>

          <input
            type="range"
            min={20}
            max={400}
            step={1}
            value={pxPerSec}
            onChange={(e) => {
              if (!tracksRef.current) return;

              const newPx = Number(e.target.value);
              const scroller = tracksRef.current;
              const oldPx = pxPerSec;

              const leftTime = scroller.scrollLeft / oldPx;
              setPxPerSec(newPx);

              requestAnimationFrame(() => {
                scroller.scrollLeft = leftTime * newPx;
              });
            }}
            className="w-32"
          />

          <span className="text-gray-400">
            {(pxPerSec / 100).toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Ruler */}
      <div
        ref={rulerRef}
        className="relative h-12 overflow-x-scroll overflow-y-hidden border-b border-neutral-700 bg-timeline-ruler scrollbar-none"
      >
        <div
          className="relative h-full"
          style={{
            width: timelineWidth + TRACK_LABEL_WIDTH,
            paddingLeft: TRACK_LABEL_WIDTH,
          }}
        >
          {/* Baseline */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-500/60" />

          {Array.from({ length: Math.ceil(displayDuration) + 1 }).map(
            (_, sec) => {
              const isMajor = sec % 10 === 0;

              return (
                <div
                  key={`tick-${sec}`}
                  className="absolute bottom-0"
                  style={{ left: sec * pxPerSec }}
                >
                  <div className="w-px h-11 bg-neutral-600" />

                  {isMajor && (
                    <div className="absolute bottom-2 left-1 text-xs text-gray-400 whitespace-nowrap">
                      {formatTime(sec)}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Tracks */}
      <div
        ref={tracksRef}
        className="relative overflow-x-scroll overflow-y-hidden"
      >
        <div
          style={{
            width: timelineWidth + TRACK_LABEL_WIDTH,
          }}
        >
          {/* Overlay Track */}
          <div className="h-12 border-b border-neutral-700 relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 px-2 flex items-center text-sm text-gray-400 bg-neutral-900 z-10 border-r border-neutral-700">
              Overlays
            </div>

            <div className="absolute top-0 bottom-0" style={{
              left: TRACK_LABEL_WIDTH,
              right: 0
            }}>
              {state.overlayTimings.map((timing) => {
                const overlay = state.timeline.overlays.find(
                  (o) => o.id === timing.overlayId
                );
                const segment = state.timeline.segments.find(
                  (s) => s.id === timing.segmentId
                );
                if (!overlay || !segment) return null;
                const absoluteStartTime = segment.startTime + timing.startTime;

                return (
                  <div
                    key={`${timing.overlayId}-${timing.segmentId}`}
                    className="absolute h-8 top-2 bg-red-500 rounded px-2 text-xs flex items-center text-white cursor-move"
                    style={{
                      left: absoluteStartTime * pxPerSec,
                      width: timing.duration * pxPerSec,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      dispatch({
                        type: "SELECT_OVERLAY",
                        payload: { overlayId: overlay.id },
                      });

                      const startX = e.clientX;
                      const initialStartTime = timing.startTime;
                      const segmentDuration = segment?.duration ?? 0;

                      function onMove(ev: MouseEvent) {
                        const dxPx = ev.clientX - startX;
                        const deltaSec = dxPx / pxPerSec;
                        const newStartTime = Math.max(0, initialStartTime + deltaSec);
                        const maxStartTime = segmentDuration - timing.duration;
                        const constrainedStartTime = Math.min(newStartTime, Math.max(0, maxStartTime));

                        dispatch({
                          type: "UPDATE_OVERLAY_TIMING",
                          payload: {
                            ...timing,
                            startTime: constrainedStartTime,
                          },
                        });
                      }

                      function onUp() {
                        document.removeEventListener("mousemove", onMove);
                        document.removeEventListener("mouseup", onUp);
                      }

                      document.addEventListener("mousemove", onMove);
                      document.addEventListener("mouseup", onUp);
                    }}
                  >
                    {overlay.text ?? "Overlay"}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Video Track */}
          <div className="h-14 relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 px-2 flex items-center text-sm text-gray-400 bg-neutral-900 z-10 border-r border-neutral-700">
              Main Video Layer
            </div>

            <div
              className="absolute top-0 bottom-0"
              style={{
                left: TRACK_LABEL_WIDTH,
                right: 0
              }}
            >
              {state.timeline.segments.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                  No video segments added
                </div>
              ) : (
                state.timeline.segments.map((seg) => (
                  <TimelineSegment
                    key={seg.id}
                    segment={seg}
                    px={pxPerSec}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Playhead */}
        <div className="absolute top-0 bottom-0 pointer-events-none">
          <Playhead
            px={pxPerSec}
            currentTime={state.currentTime}
            isPlaying={state.isPlaying}
            offset={TRACK_LABEL_WIDTH}
          />
        </div>
      </div>
    </div>
  );
}