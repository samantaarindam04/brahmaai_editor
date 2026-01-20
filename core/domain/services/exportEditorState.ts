import { EditorState } from "@/core/applications/states/editorState";
import { VideoSegment } from "@/core/domain/entities/videoSegment";
import { OverlayTiming } from "@/core/domain/value-objects/OverlayTiming";

export function exportEditorState(state: EditorState) {
  return {
    segments: state.timeline.segments.map(
      (segment): VideoSegment => ({
        id: segment.id,
        source: segment.source,
        startTime: segment.startTime,
        duration: segment.duration,
      })
    ),

    overlays: state.overlayTimings.map(
      (overlay): OverlayTiming => ({
        overlayId: overlay.overlayId,
        segmentId: overlay.segmentId,
        startTime: overlay.startTime,
        duration: overlay.duration,
      })
    ),
  };
}
