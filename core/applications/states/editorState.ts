// state contracts

import { Timeline } from "@/core/domain/entities/timeline";
import { OverlayTiming } from "@/core/domain/value-objects/OverlayTiming";
export interface EditorState {
  timeline: Timeline;
  currentTime: number;
  isPlaying: boolean;
  overlayTimings: OverlayTiming[];
  selectedOverlayId: string | null
  editingOverlayId: string | null
}

export const initialEditorState: EditorState = {
  timeline: {
    segments: [],
    overlays: [],
    duration: 0,
  },
  overlayTimings: [],
  currentTime: 0,
  isPlaying: false,
  selectedOverlayId: null,
  editingOverlayId: null
};