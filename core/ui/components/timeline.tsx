"use client";

import { useEditor } from "@/core/applications/contexts/EditorContext";
import { useTimelineScale } from "@/core/applications/hooks/useTimelineScale";
import TimelineSegment from "./timelineSegment";
import Playhead from "./Playhead";

export function Timeline() {
  const { state, dispatch } = useEditor();
  const { pxPerSec, zoomIn, zoomOut } = useTimelineScale();

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pxPerSec;

    dispatch({ type: "SET_TIME", payload: time });
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="timeline-controls flex gap-2 mb-2">
        <button onClick={zoomOut}>−</button>
        <button onClick={zoomIn}>+</button>
      </div>

      {/* Timeline viewport */}
      <div className="timeline-viewport h-22">
        <div
          className="timeline-canvas timeline-root border border-dashed border-gray-600 h-80 relative flex items-center text-gray-400 text-sm"
          onClick={handleTimelineClick}
          style={
            {
              "--timeline-width": `${state.timeline.duration * pxPerSec}px`,
            } as React.CSSProperties
          }
        >
          {state.timeline.segments.map((seg) => (
            <TimelineSegment
              key={seg.id}
              segment={seg}
              px={pxPerSec}
            />
          ))}

          <Playhead px={pxPerSec} />
        </div>
      </div>
    </div>
  );
}
