import { Timeline } from "@/core/domain/entities/timeline";

interface MoveSegmentInput {
  segmentId: string;
  delta: number;
}

export function moveSegment(
  timeline: Timeline,
  input: MoveSegmentInput
): Timeline {
  const sortedSegments = [...timeline.segments].sort(
    (a, b) => a.startTime - b.startTime
  );

  const index = sortedSegments.findIndex(
    (s) => s.id === input.segmentId
  );

  if (index === -1) return timeline;

  const segment = sortedSegments[index];
  let nextStart = segment.startTime + input.delta;

  // Clamp to start of timeline
  if (nextStart < 0) nextStart = 0;

  const prev = sortedSegments[index - 1];
  const next = sortedSegments[index + 1];

  // Prevent overlap with previous segment
  if (prev) {
    const minStart = prev.startTime + prev.duration;
    if (nextStart < minStart) {
      nextStart = minStart;
    }
  }

  // Prevent overlap with next segment
  if (next) {
    const maxStart = next.startTime - segment.duration;
    if (nextStart > maxStart) {
      nextStart = maxStart;
    }
  }

  const updatedSegments = sortedSegments.map((s) =>
    s.id === segment.id
      ? { ...s, startTime: nextStart }
      : s
  );

  return {
    ...timeline,        // ✅ overlays & duration preserved
    segments: updatedSegments,
  };
}
