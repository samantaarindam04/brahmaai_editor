"use client";

import { ChangeEvent } from "react";
import { useEditor } from "@/core/applications/contexts/EditorContext";
import { VideoSegment } from "@/core/domain/entities/videoSegment";
import { findActiveSegment } from "@/core/domain/services/findActiveSegment";
import { TextStyleControls } from "./TextStyleControls";

export function EditorToolbar() {
  const { state, dispatch } = useEditor();

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const segment: VideoSegment = {
      id: crypto.randomUUID(),
      source: url,
      startTime: 0,
      duration: 10,
    };

    dispatch({ type: "ADD_SEGMENT", payload: segment });
    e.target.value = "";
  }

  function handlePlayPause() {
    dispatch({ type: state.isPlaying ? "PAUSE" : "PLAY" });
  }

  function handleAddOverlay() {
    const activeSegment = findActiveSegment(
      state.timeline.segments,
      state.currentTime
    );

    if (!activeSegment) return;

    const overlayId = crypto.randomUUID();

    dispatch({
      type: "ADD_OVERLAY",
      payload: {
        id: overlayId,
        type: "text",
        text: "New Overlay",
        geometry: {
          x: 0.1,
          y: 0.8,
          width: 0.4,
          height: 0.1,
        },
        startTime: state.currentTime,
        endTime: state.currentTime + 3,
        segmentIds: [activeSegment.id],
      },
    });

    dispatch({
      type: "ADD_OVERLAY_TIMING",
      payload: {
        overlayId,
        segmentId: activeSegment.id,
        startTime: state.currentTime - activeSegment.startTime,
        duration: 3,
      },
    });
  }


  return (
    <div className="editor-toolbar border-b border-gray-700 p-3 flex items-center justify-between bg-gray-900">
      <div className="text-white font-semibold mr-4">
        Video Editor
      </div>

      <div className="flex gap-2">
        {/* ADD VIDEO */}
        <label className="bg-white px-3 py-1 rounded-md cursor-pointer text-sm">
          + Add Video
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>

        {/* ADD OVERLAY */}
        <button
          onClick={handleAddOverlay}
          className="bg-white px-3 py-1 rounded-md text-sm"
        >
          + Add Overlay
        </button>

        {/* PLAY / PAUSE */}
        <button
          onClick={handlePlayPause}
          className="bg-white px-3 py-1 rounded-md text-sm"
        >
          {state.isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
      </div>
    </div>
  );
}
