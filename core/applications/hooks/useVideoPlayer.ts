"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import { useEditor } from "@/core/applications/contexts/EditorContext";
import { syncVideo } from "@/core/infrastructure/video/syncVideo";

type VideoJsPlayer = ReturnType<typeof videojs>;

export function useVideoPlayer(
  videoRef: React.RefObject<HTMLVideoElement>
) {
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const timelineRef = useRef<typeof state.timeline>(null);

  const { state, dispatch } = useEditor();

  /**
   * Keep latest timeline in a ref
   * (prevents stale closure inside Video.js events)
   */
  useEffect(() => {
    timelineRef.current = state.timeline;
  }, [state.timeline]);

  /**
   * Initialize Video.js ONCE
   */
  useEffect(() => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: false,
      preload: "auto",
    });

    playerRef.current = player;

    /**
     * VIDEO -> STATE
     */
    player.on("timeupdate", () => {
      const timeline = timelineRef.current;
      if (!timeline) return;

      const segment = timeline.segments.find((s) =>
        player.currentSrc()?.includes(s.source)
      );

      if (!segment) return;

      const localTime = player.currentTime();
      if (typeof localTime !== "number") return;

      dispatch({
        type: "SET_TIME",
        payload: segment.startTime + localTime,
      });
    });

    /**
     * SEGMENT END → AUTO-ADVANCE (Play All)
     */
    player.on("ended", () => {
      const timeline = timelineRef.current;

      if (!timeline) {
        dispatch({ type: "PAUSE" });
        return;
      }

      const segments = timeline.segments;

      const currentSegment = segments.find((s) =>
        player.currentSrc()?.includes(s.source)
      );

      if (!currentSegment) {
        dispatch({ type: "PAUSE" });
        return;
      }

      const index = segments.findIndex(
        (s) => s.id === currentSegment.id
      );

      const nextSegment = segments[index + 1];

      if (!nextSegment) {
        dispatch({ type: "PAUSE" });
        return;
      }

      dispatch({
        type: "SET_TIME",
        payload: nextSegment.startTime,
      });
    });

    return () => {
      player.dispose();
      playerRef.current = null;
    };
  }, [dispatch, videoRef]); // ✅ ESLint satisfied, player still created once

  /**
   * STATE -> VIDEO
   */
  useEffect(() => {
    if (!playerRef.current) return;

    syncVideo(
      playerRef.current,
      state.timeline,
      state.currentTime,
      state.isPlaying
    );
  }, [state.currentTime, state.isPlaying, state.timeline]);
}
