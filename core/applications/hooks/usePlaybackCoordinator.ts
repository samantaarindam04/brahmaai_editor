import { useEffect, useRef } from "react";
import { EditorState } from "../states/editorState";
import { EditorActions } from "../states/editorAction";
import { resolveActiveSegment } from "@/core/domain/services/resolveActiveSegment";
import { CalcDuration } from "@/core/domain/services/timelineCalc";
import { VideoPlayerController } from "@/core/infrastructure/video/VideoPlayerController";

interface Params {
  state: EditorState;
  dispatch: React.Dispatch<EditorActions>;
  videoElementRef: React.RefObject<HTMLVideoElement | null>; // ✅ Allow null
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
  /**
   * 1️⃣ Initialize Video.js ONCE
   */
  // useEffect(() => {
  //   if (!videoElementRef.current) return;

  //   const controller = new VideoPlayerController();
  //   controllerRef.current = controller;

  //   controller.init(videoElementRef.current, {
  //     onTimeUpdate: (videoTime) => {
  //       if (!state.isPlaying) return;

  //       if (lastVideoTimeRef.current !== null) {
  //         const delta = videoTime - lastVideoTimeRef.current;
  //         if (delta > 0) {
  //           dispatch({ type: "TICK", payload: delta });
  //         }
  //       }

  //       lastVideoTimeRef.current = videoTime;
  //     },

  //     onEnded: () => {
  //       lastVideoTimeRef.current = null;
  //     },
  //   });

  //   return () => {
  //     controller.dispose();
  //     controllerRef.current = null;
  //   };
  // }, [videoElementRef, state.isPlaying, dispatch]); // ✅ Added dispatch to deps

  useEffect(() => {
    isPlayingRef.current = state.isPlaying;
  }, [state.isPlaying]);

  useEffect(() => {
    if (!videoElementRef.current) return;

    const controller = new VideoPlayerController();
    controllerRef.current = controller;

    controller.init(videoElementRef.current, {
      onTimeUpdate: () => {
        if (!isPlayingRef.current) return;

        const now = performance.now();

        if (lastVideoTimeRef.current !== null) {
          const delta = (now - lastVideoTimeRef.current) / 1000;

          if (delta <= 0) return;

          dispatch({ type: "TICK", payload: delta });
        }

        lastVideoTimeRef.current = now;
      },


    });

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [videoElementRef]);

  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller || !state.timeline) return;

    const totalDuration = CalcDuration(
      state.timeline.segments
    );

    if (state.currentTime >= totalDuration) {
      controller.pause();
      // 🔑 Reset editor playback state
      dispatch({ type: "PAUSE" });
      dispatch({ type: "SET_TIME", payload: 0 });

      // 🔑 Reset internal refs so replay works cleanly
      lastVideoTimeRef.current = null;
      lastSegmentIdRef.current = null;
      return;
    }

    const active = resolveActiveSegment(
      state.currentTime,
      state.timeline.segments
    );

    if (!active) return;

    if (active) {
      console.log(
        "[SEGMENT]",
        "timelineTime =", state.currentTime.toFixed(3),
        "→ segment =", active.segment.id,
        "localTime =", active.localTime.toFixed(3)
      );
    }

    if (lastSegmentIdRef.current !== active.segment.id) {

      lastSegmentIdRef.current = active.segment.id;
      lastVideoTimeRef.current = null;

      controller.loadSource(active.segment.source);
      controller.seek(active.localTime);
      if (state.isPlaying) {
        controller.play();
      }
    }
  }, [state.currentTime, state.timeline]);


  useEffect(() => {
    const controller = controllerRef.current;
    if (!controller) return;

    if (state.isPlaying) {
      controller.play();
    } else {
      controller.pause();
    }
  }, [state.isPlaying]);
}