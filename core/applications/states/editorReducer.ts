import { EditorState } from "./editorState";
import { EditorActions } from "./editorAction";
import { resizeSegment } from "@/core/shared/utils/resizeSegment";
import { normalizeSegments } from "@/core/shared/utils/normalizeSegment";
import { constrainOverlay } from "@/core/domain/services/constrainOverlay";

function calculateDuration(segments: Array<{ startTime: number; duration: number }>): number {
  if (segments.length === 0) return 0;
  return Math.max(...segments.map(seg => seg.startTime + seg.duration));
}

export function editorReducer(
  state: EditorState,
  action: EditorActions
): EditorState {
  switch (action.type) {
    case "PLAY":
      return { ...state, isPlaying: true };

    case "PAUSE":
      return { ...state, isPlaying: false };

    case "SET_TIME":
      return {
        ...state,
        currentTime: Math.max(0, action.payload),
      };

    case "TICK": {
      if (!state.timeline) return state;

      const duration = state.timeline.duration ?? 0;
      const nextTime = state.currentTime + action.payload;

      if (nextTime >= duration) {
        return {
          ...state,
          currentTime: 0,
          isPlaying: false,
        };
      }

      return {
        ...state,
        currentTime: Math.max(0, nextTime),
      };
    }

    case "ADD_SEGMENT": {
      if (!state.timeline) return state;

      const lastSegment =
        state.timeline.segments[state.timeline.segments.length - 1];

      const startTime = lastSegment
        ? lastSegment.startTime + lastSegment.duration
        : 0;

      const newSegment = {
        ...action.payload,
        startTime,
      };

      const newSegments = [...state.timeline.segments, newSegment];

      return {
        ...state,
        timeline: {
          ...state.timeline,
          segments: newSegments,
          duration: calculateDuration(newSegments),
        },
      };
    }

    case "MOVE_SEGMENT": {
      if (!state.timeline) return state;

      const { segmentId, delta } = action.payload;

      const updatedSegments = state.timeline.segments.map((seg) =>
        seg.id === segmentId
          ? {
            ...seg,
            startTime: Math.max(0, seg.startTime + delta),
          }
          : { ...seg }
      );

      const normalized = normalizeSegments(updatedSegments);

      return {
        ...state,
        timeline: {
          ...state.timeline,
          segments: normalized,
          duration: calculateDuration(normalized),
        },
      };
    }

    case "RESIZE_SEGMENT": {
      const segments = resizeSegment(
        state.timeline.segments,
        action.payload.segmentId,
        action.payload.delta,
        action.payload.edge
      );

      return {
        ...state,
        timeline: {
          ...state.timeline,
          segments,
          duration: calculateDuration(segments),
        },
      };
    }

    case "ADD_OVERLAY":
      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: [...state.timeline.overlays, action.payload],
        },
      };

    case "UPDATE_OVERLAY_GEOMETRY":
      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: state.timeline.overlays.map((overlay) =>
            overlay.id === action.payload.overlayId
              ? { ...overlay, geometry: action.payload.geometry }
              : overlay
          ),
        },
      };

    case "ADD_OVERLAY_TIMING":
      return {
        ...state,
        overlayTimings: [...state.overlayTimings, action.payload],
      };

    case "MOVE_OVERLAY": {
      const overlay =
        state.timeline.overlays.find(
          o => o.id === action.payload.overlayId
        )

      if (!overlay) return state

      const next = constrainOverlay({
        ...overlay.geometry,
        x: overlay.geometry.x + action.payload.dx,
        y: overlay.geometry.y + action.payload.dy,
      })

      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: state.timeline.overlays.map(o =>
            o.id === overlay.id
              ? { ...o, geometry: next }
              : o
          ),
        },
      }
    }

    case "RESIZE_OVERLAY": {
      const overlay = state.timeline.overlays.find(
        o => o.id === action.payload.overlayId
      );
      if (!overlay) return state;

      const next = constrainOverlay({
        ...overlay.geometry,
        ...action.payload.geometry,
      });

      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: state.timeline.overlays.map(o =>
            o.id === overlay.id ? { ...o, geometry: next } : o
          ),
        },
      };
    }

    case "UPDATE_OVERLAY_CONTENT": {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: state.timeline.overlays.map(o =>
            o.id === action.payload.overlayId
              ? { ...o, ...action.payload }
              : o
          ),
        },
      }
    }
    case "UPDATE_TEXT_STYLE": {
      return {
        ...state,
        timeline: {
          ...state.timeline,
          overlays: state.timeline.overlays.map(o =>
            o.id === action.payload.overlayId
              ? {
                ...o,
                textStyle: {
                  fontSize: o.textStyle?.fontSize ?? 16,
                  color: o.textStyle?.color ?? "#ffffff",
                  backgroundColor:
                    o.textStyle?.backgroundColor ?? "#000000",
                  backgroundOpacity:
                    o.textStyle?.backgroundOpacity ?? 0.4,
                  ...action.payload.style,
                },
              }
              : o
          ),
        },
      }
    }

    case "UPDATE_OVERLAY_TIMING":
      return {
        ...state,
        overlayTimings: state.overlayTimings.map(t =>
          t.overlayId === action.payload.overlayId &&
            t.segmentId === action.payload.segmentId
            ? action.payload
            : t
        ),
      };
    case "SELECT_OVERLAY":
      return {
        ...state,
        selectedOverlayId: action.payload.overlayId,
        editingOverlayId: null,
      }

    case "START_EDIT_TEXT":
      return {
        ...state,
        selectedOverlayId: action.payload.overlayId,
        editingOverlayId: action.payload.overlayId,
      }

    case "DESELECT_OVERLAY":
      return {
        ...state,
        selectedOverlayId: null,
        editingOverlayId: null,
      }
    default:
      return state;
  }
}