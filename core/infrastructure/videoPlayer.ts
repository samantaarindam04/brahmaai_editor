import videojs from "video.js";

export function videoPlayer(element: HTMLVideoElement) {
  return videojs(element, {
    controls: false,
    preload: "auto",
    fluid: true,
  });
}