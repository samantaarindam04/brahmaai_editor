import { Timeline } from "@/core/domain/entities/timeline";
import videojs from "video.js";

type VideoJsPlayer = ReturnType<typeof videojs>;

export function syncVideo(
  player: VideoJsPlayer,
  timeline: Timeline | undefined,
  currentTime: number,
  isPlaying: boolean
) {
  if (!timeline || timeline.segments.length === 0) return;

  const segment = timeline.segments.find(
    (s) =>
      currentTime >= s.startTime &&
      currentTime < s.startTime + s.duration
  );

  if (!segment) return;

  const videoTime = Math.max(
    0,
    Math.min(currentTime - segment.startTime, segment.duration)
  );

  const currentSrc = player.currentSrc();

  /**
   * ✅ CRITICAL FIX
   * Video.js REQUIRES a MIME type when using Object URLs
   */
  if (!currentSrc || !currentSrc.includes(segment.source)) {
    player.src({
      src: segment.source,
      type: "video/mp4", // required for Video.js compatibility
    });
    return;
  }

  if (!player) return;
  if (!player.readyState || player.readyState() < 1) {
    return;
  }
  const playerTime = player.currentTime();

  if (typeof playerTime !== "number") return;

  if (
    Math.abs(playerTime - videoTime) > 0.05
  ) {
    player.currentTime(videoTime);
  }

  if (isPlaying && player.paused()) {
    player.play();
  }

  if (!isPlaying && !player.paused()) {
    player.pause();
  }
}
