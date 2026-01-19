import { VideoSegment } from "../entities/videoSegment";

export function CalcDuration(segments: VideoSegment[]): number{
  return segments.reduce((a,b) => Math.max(a, b.startTime + b.duration), 0) // a is the largest end time | starttime + duration = end time 
}