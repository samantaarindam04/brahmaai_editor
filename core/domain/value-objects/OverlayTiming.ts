export interface OverlayTiming {
  overlayId: string;
  segmentId: string;
  startTime: number;   // seconds (relative to segment)
  duration: number;    // seconds
}
