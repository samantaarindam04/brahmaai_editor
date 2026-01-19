"use client";

import { useEditor } from "@/core/applications/contexts/EditorContext";

/**
 * PlaybackControls
 *
 * Responsibilities:
 * - Toggle PLAY / PAUSE
 * - Does NOT manage time
 * - Does NOT know about segments
 *
 * "Play All" behavior comes from:
 * - currentTime already set
 * - auto-advance logic in useVideoPlayer
 */
export function PlaybackControls() {
  const { state, dispatch } = useEditor();

  function handlePlayPause() {
    if (state.isPlaying) {
      dispatch({ type: "PAUSE" });
    } else {
      dispatch({ type: "PLAY" });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePlayPause}
        className="px-3 py-1 text-sm border border-gray-600 rounded bg-gray-800 text-gray-200"
      >
        {state.isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
}
