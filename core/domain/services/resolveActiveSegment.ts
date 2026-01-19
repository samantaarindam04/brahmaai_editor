import { VideoSegment } from "../entities/videoSegment";
import {
  mapTimelineToSegment,
  SegmentTimeMapping,
} from "./mapTimelineToSegment";

/**
 * Resolves which segment should be actively playing
 * for a given timeline time.
 *
 * This is a semantic wrapper around mapTimelineToSegment
 * used specifically for playback decisions.
 */
export function resolveActiveSegment(
  timelineTime: number,
  segments: VideoSegment[]
): SegmentTimeMapping | null {
  if (segments.length === 0) {
    return null;
  }

  return mapTimelineToSegment(timelineTime, segments);
}
