import { useEffect, useRef } from "react";
import { EditorActions } from "@/core/applications/states/editorAction";

export function usePlayback(
  isPlaying: boolean,
  dispatch: React.Dispatch<EditorActions>
) {
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      last.current = null;
      return;
    }

    const tick = (now: number) => {
      if (last.current !== null) {
        dispatch({
          type: "SET_TIME",
          payload: (now - last.current) / 1000,
        });
      }
      last.current = now;
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isPlaying, dispatch]);
}
