"use client";

import { useEffect } from "react";
import type Player from "video.js/dist/types/player";
import { EditorActions } from "@/core/applications/states/editorAction";

interface UsePlaybackSyncProps {
  player: Player | null;
  dispatch: React.Dispatch<EditorActions>;
  isPlaying: boolean;
}

export function usePlaybackSync({
  player,
  dispatch,
  isPlaying,
}: UsePlaybackSyncProps) {
  useEffect(() => {
    if (!player) return;

    const handleTimeUpdate = () => {
      const time = player.currentTime();
      if (typeof time !== "number") return;
      dispatch({
        type: "SET_TIME",
        payload: time,
      });
    };

    player.on("timeupdate", handleTimeUpdate);

    return () => {
      player.off("timeupdate", handleTimeUpdate);
    };
  }, [player, dispatch]);

  useEffect(() => {
    if (!player) return;

    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, player]);
}
