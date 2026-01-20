import { useEffect, useRef } from "react";
import { EditorState } from "../states/editorState";
import { EditorActions } from "../states/editorAction";
import { resolveActiveSegment } from "@/core/domain/services/resolveActiveSegment";
import { CalcDuration } from "@/core/domain/services/timelineCalc";
import { VideoPlayerController } from "@/core/infrastructure/video/VideoPlayerController";

interface Params {
  state: EditorState;
  dispatch: React.Dispatch<EditorActions>;
  videoElementRef: React.RefObject<HTMLVideoElement | null>;
}

export function usePlaybackCoordinator({
  state,
  dispatch,
  videoElementRef,
}: Params) {
  const controllerRef = useRef<VideoPlayerController | null>(null);
  const lastVideoTimeRef = useRef<number | null>(null);
  const lastSegmentIdRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);
  const endedRef = useRef(false);
  const wasAutoRewindRef = useRef(false);

  /* --------------------------------------------
   * Track playing state for async callbacks
   * -------------------------------------------- */
  useEffect(() => {
    isPlayingRef.current = state.isPlaying;
    if (state.isPlaying) {
      endedRef.current = false;
    }
  }, [state.isPlaying]);

  /* --------------------------------------------
   * Initialize Video.js ONCE
   * -------------------------------------------- */
  useEffect(() => {
    if (!videoElementRef.current) return;

    const controller = new VideoPlayerController();
    controllerRef.current = controller;

    controller.init(videoElementRef.current, {
      onTimeUpdate: (videoTime) => {
        // ✅ FIXED: Check ended flag BEFORE processing tick
        if (!isPlayingRef.current || endedRef.current) {
          return;
        }

        if (lastVideoTimeRef.current !== null) {
          const delta = videoTime - lastVideoTimeRef.current;
          if (delta > 0) {
            dispatch({ type: "TICK", payload: delta });
          }
        }

        lastVideoTimeRef.current = videoTime;
      },
    });

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [videoElementRef, dispatch]);

  /* --------------------------------------------
   * Timeline → Segment resolution & end handling
   * -------------------------------------------- */
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller || !state.timeline) return;

    const totalDuration = CalcDuration(state.timeline.segments);

    // ✅ CRITICAL FIX: Check for end FIRST, before resolving segment
    // This prevents the race condition where currentTime >= totalDuration
    // but we still try to process a segment
    if (totalDuration > 0 && state.currentTime >= totalDuration - 0.01) {
      if (state.isPlaying) {
        console.log("[PLAYBACK] Reached end:", state.currentTime.toFixed(3), ">=", totalDuration.toFixed(3));
        
        // ✅ Set ended flag FIRST to stop ticks immediately
        endedRef.current = true;
        wasAutoRewindRef.current = true;

        // ✅ Pause the controller immediately
        controller.pause();
        
        // ✅ Dispatch pause action
        dispatch({ type: "PAUSE" });

        // ✅ Reset to beginning
        requestAnimationFrame(() => {
          dispatch({ type: "SET_TIME", payload: 0 });
          lastVideoTimeRef.current = null;
          lastSegmentIdRef.current = null;
        });
      }
      return;
    }

    // ✅ Don't process segments if we've ended
    if (endedRef.current) return;

    const active = resolveActiveSegment(
      state.currentTime,
      state.timeline.segments
    );

    // ✅ CRITICAL FIX: If no active segment during playback, STOP
    if (!active) {
      if (state.isPlaying) {
        console.log("[PLAYBACK] No active segment at time:", state.currentTime.toFixed(3), "- stopping");
        endedRef.current = true;
        controller.pause();
        dispatch({ type: "PAUSE" });
        
        // Reset to beginning
        requestAnimationFrame(() => {
          dispatch({ type: "SET_TIME", payload: 0 });
          lastVideoTimeRef.current = null;
          lastSegmentIdRef.current = null;
        });
      }
      return;
    }

    // ✅ Switch segments or continue current segment
    if (lastSegmentIdRef.current !== active.segment.id) {
      console.log("[PLAYBACK] Switching to segment:", active.segment.id, "at local time:", active.localTime.toFixed(3));
      lastSegmentIdRef.current = active.segment.id;
      lastVideoTimeRef.current = null;

      controller.loadSource(active.segment.source);
      controller.seek(active.localTime);

      if (state.isPlaying) {
        controller.play();
      }
    }
  }, [state.currentTime, state.timeline, state.isPlaying, dispatch]);

  /* --------------------------------------------
   * Play / Pause control
   * -------------------------------------------- */
  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;

    if (state.isPlaying) {
      // ✅ FIXED: Reset ended flag when playing starts
      endedRef.current = false;
      controller.play();
    } else {
      controller.pause();
    }
  }, [state.isPlaying]);

  /* --------------------------------------------
   * Reset segment ONLY on user seek, not auto-rewind
   * -------------------------------------------- */
  useEffect(() => {
    if (state.currentTime === 0 && wasAutoRewindRef.current) {
      wasAutoRewindRef.current = false;
      return;
    }

    if (state.currentTime === 0) {
      lastSegmentIdRef.current = null;
      lastVideoTimeRef.current = null;
      // ✅ FIXED: Also reset ended flag on manual rewind
      endedRef.current = false;
    }
  }, [state.currentTime]);
}