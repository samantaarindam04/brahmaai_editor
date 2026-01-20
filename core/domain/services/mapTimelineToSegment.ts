import { VideoSegment } from "../entities/videoSegment";

export interface SegmentTimeMapping {
  segment: VideoSegment;
  localTime: number;
}

export function mapTimelineToSegment(
  timelineTime: number,
  segments: VideoSegment[]
): SegmentTimeMapping | null {
  for (const segment of segments) {
    const segmentStart = segment.startTime;
    const segmentEnd = segment.startTime + segment.duration;

    if (timelineTime >= segmentStart && timelineTime < segmentEnd) {
      return {
        segment,
        localTime: timelineTime - segmentStart,
      };
    }
  }

  return null;
}
