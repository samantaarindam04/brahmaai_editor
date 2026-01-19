import { useReducer } from "react";
import { editorReducer } from "../states/editorReducer";
import { EditorState } from "../states/editorState";

const initialState: EditorState = {
  timeline: { segments: [], overlays: [], duration: 0 },
  currentTime: 0,
  isPlaying: false,
  overlayTimings: [],
}

export function useEditorState() {
  return useReducer(editorReducer, initialState)
}