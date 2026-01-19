import { VideoSegment } from "../entities/videoSegment";

export interface SegmentTimeMapping {
  segment: VideoSegment;
  localTime: number;
}

/**
 * Maps a global timeline time to a specific video segment
 * and calculates the local playback time inside that segment.
 *
 * PURE DOMAIN LOGIC
 */
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
