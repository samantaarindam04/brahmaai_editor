import { VideoSegment } from "../entities/videoSegment";
import {
  mapTimelineToSegment,
  SegmentTimeMapping,
} from "./mapTimelineToSegment";

export function resolveActiveSegment(
  timelineTime: number,
  segments: VideoSegment[]
): SegmentTimeMapping | null {
  if (segments.length === 0) {
    return null;
  }

  return mapTimelineToSegment(timelineTime, segments);
}
