import { VideoSegment } from "../entities/videoSegment";

export function findActiveSegment(
  segments: VideoSegment[],
  time: number
): VideoSegment | undefined {
  return segments.find(
    s => time >= s.startTime && time < s.startTime + s.duration
  );
}
