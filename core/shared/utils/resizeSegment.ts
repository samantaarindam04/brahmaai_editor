import { VideoSegment } from "@/core/domain/entities/videoSegment";
import { normalizeSegments } from "@/core/shared/utils/normalizeSegment";

/**
 * Resize a segment from start or end.
 *
 * Rules:
 * - startTime can never be < 0
 * - duration can never be <= 0
 * - resizing start shifts startTime AND duration
 * - resizing end changes duration only
 * - collisions are resolved via normalizeSegments
 */
export function resizeSegment(
  segments: VideoSegment[],
  segmentId: string,
  delta: number,
  edge: "start" | "end"
): VideoSegment[] {
  const updated = segments.map((seg) => {
    if (seg.id !== segmentId) {
      return { ...seg };
    }

    if (edge === "start") {
      const newStart = Math.max(0, seg.startTime + delta);
      const diff = newStart - seg.startTime;
      const newDuration = seg.duration - diff;

      // Prevent invalid segment
      if (newDuration <= 0) {
        return { ...seg };
      }

      return {
        ...seg,
        startTime: newStart,
        duration: newDuration,
      };
    }

    // edge === "end"
    const newDuration = seg.duration + delta;

    if (newDuration <= 0) {
      return { ...seg };
    }

    return {
      ...seg,
      duration: newDuration,
    };
  });

  return normalizeSegments(updated);
}
