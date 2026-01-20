import videojs from "video.js";
import Player from "video.js/dist/types/player";

export interface VideoPlayerCallbacks {
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export class VideoPlayerController {
  private player: Player | null = null;
  private currentSrc: string | null = null;
  private pendingSeek: number | null = null;

  init(
    videoElement: HTMLVideoElement,
    callbacks: VideoPlayerCallbacks = {}
  ): void {
    if (this.player) return;

    this.player = videojs(videoElement, {
      controls: false,
      preload: "auto",
    });

    if (callbacks.onTimeUpdate) {
      this.player.on("timeupdate", () => {
        const time = this.player!.currentTime();

        if (typeof time === "number") {
          callbacks.onTimeUpdate?.(time);
        }
      });
    }

    if (callbacks.onEnded) {
      this.player.on("ended", () => {
        callbacks.onEnded!();
      });
    }

    this.player.on("loadedmetadata", () => {
      if (this.pendingSeek !== null) {
        this.player!.currentTime(this.pendingSeek);
        this.pendingSeek = null;
      }
    });
  }

  loadSource(src: string): void {
    if (!this.player) {
      throw new Error("Video player not initialized");
    }

    if (this.currentSrc === src) return;
    this.currentSrc = src;
    this.player.src({ src, type: "video/mp4" });
  }

  seek(time: number): void {
    if (!this.player) return;

    const readyState = this.player.readyState();
    if (readyState && readyState >= 1) {
      this.player.currentTime(Math.max(0, time));
    } else {
      this.pendingSeek = Math.max(0, time);
    }
  }

play(): void {
    if (!this.player) return;
    const playPromise = this.player.play();
    
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error("[VIDEO] Play failed:", err);
      });
    }
  }

  pause(): void {
    if (!this.player) return;
    this.player.pause();
  }

  dispose(): void {
    this.player?.dispose();
    this.player = null;
    this.currentSrc = null;
    this.pendingSeek = null;
  }
}