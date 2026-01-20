import { Overlay, TextStyle } from "@/core/domain/entities/overlay";
import { VideoSegment } from "@/core/domain/entities/videoSegment";
import { OverlayGeometry } from "@/core/domain/value-objects/OverlayGeometry";
import { OverlayTiming } from "@/core/domain/value-objects/OverlayTiming";

export type EditorActions =
  | { type: "PLAY" }
  | { type: "PAUSE" }

  /**
   * Explicit user-driven seek (timeline click / drag)
   */
  | { type: "SET_TIME"; payload: number }

  /**
   * Playback-driven time progression (video timeupdate)
   * delta = seconds advanced since last tick
   */
  | { type: "TICK"; payload: number }

  | { type: "ADD_SEGMENT"; payload: VideoSegment }
  | {
    type: "MOVE_SEGMENT";
    payload: { segmentId: string; delta: number };
  }
  | {
    type: "RESIZE_SEGMENT";
    payload: {
      segmentId: string;
      delta: number;
      edge: "start" | "end";
    };
  }
  | { type: "ADD_OVERLAY"; payload: Overlay }
  | { type: "ADD_OVERLAY_TIMING"; payload: OverlayTiming }
  | {
    type: "UPDATE_OVERLAY_GEOMETRY";
    payload: {
      overlayId: string;
      geometry: Overlay["geometry"];
    };
  }
  | {
    type: "MOVE_OVERLAY"
    payload: {
      overlayId: string
      dx: number
      dy: number
    }
  }
  | {
    type: "RESIZE_OVERLAY"
    payload: {
      overlayId: string
      geometry: Partial<OverlayGeometry>
    }
  }
  | {
    type: "UPDATE_OVERLAY_CONTENT"
    payload: {
      overlayId: string
      text?: string
      imageSrc?: string
    }
  }
  | {
    type: "UPDATE_TEXT_STYLE"
    payload: {
      overlayId: string
      style: Partial<TextStyle>
    }
  }
  | {
    type: "SELECT_OVERLAY"
    payload: {
      overlayId: string
    }
  }
  | {
    type: "START_EDIT_TEXT"
    payload: {
      overlayId: string
    }
  }
  | { type: "DESELECT_OVERLAY" }
  | {
    type: "UPDATE_OVERLAY_TIMING"
    payload: OverlayTiming
  }
