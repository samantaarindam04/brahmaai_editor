import { VideoSegment } from "@/core/domain/entities/videoSegment";

export function normalizeSegments(segments: VideoSegment[]): VideoSegment[] {
  const sorted = [...segments].sort(
    (a, b) => a.startTime - b.startTime
  );

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const current = sorted[i];

    const prevEnd = prev.startTime + prev.duration;

    if (current.startTime < prevEnd) {
      current.startTime = prevEnd;
    }
  }

  return sorted;
}