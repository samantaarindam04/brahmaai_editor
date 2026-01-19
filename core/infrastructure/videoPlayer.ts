import videojs from "video.js";

export function videoPlayer(element: HTMLVideoElement) {
  return videojs(element, {
    controls: false, // ✅ Fixed: was "control" (should be plural)
    preload: "auto",
    fluid: true, // ✅ Optional: makes it responsive
  });
}