import { EditorState } from "@/core/applications/states/editorState";

export function exportTimeline(state: EditorState) {
  return {
    duration: state.timeline.duration,
    segments: state.timeline.segments.map(s => ({
      id: s.id,
      source: s.source,
      startTime: s.startTime,
      duration: s.duration,
    })),
    overlays: state.timeline.overlays.map(o => ({
      id: o.id,
      text: o.text,
      geometry: o.geometry,
    })),
  };
}
