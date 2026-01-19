import { Timeline } from "../entities/timeline";
import { OverlayTiming } from "../value-objects/OverlayTiming";

export function exportTimeline(
  timeline: Timeline,
  overlayTimings: OverlayTiming[]
) {
  return {
    segments: timeline.segments.map((segment) => ({
      id: segment.id,
      start: segment.startTime,
      duration: segment.duration,
    })),

    overlays: timeline.overlays.map((overlay) => ({
      id: overlay.id,
      text: overlay.text,
      geometry: overlay.geometry,
      placements: overlayTimings
        .filter((t) => t.overlayId === overlay.id)
        .map((t) => ({
          segmentId: t.segmentId,
          start: t.startTime,
          duration: t.duration,
        })),
    })),
  };
}
