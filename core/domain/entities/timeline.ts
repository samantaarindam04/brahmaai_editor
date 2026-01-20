import { VideoSegment } from "./videoSegment";
import { Overlay } from "./overlay";
export interface Timeline{
  segments: VideoSegment[],
  overlays: Overlay[],
  duration: number
}