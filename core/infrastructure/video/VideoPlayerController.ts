import videojs from "video.js";
import Player from "video.js/dist/types/player";

export interface VideoPlayerCallbacks {
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export class VideoPlayerController {
  private player: Player | null = null;
  private currentSrc: string | null = null;
  private pendingSeek: number | null = null; // ✅ Track pending seek

  /**
   * Initialize Video.js player ONCE
   */
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
          console.log("[VIDEO] timeupdate:", time.toFixed(3));
          callbacks.onTimeUpdate?.(time);
        }
      });
    }

    if (callbacks.onEnded) {
      this.player.on("ended", () => {
        callbacks.onEnded!();
      });
    }

    // ✅ Handle pending seeks after source loads
    this.player.on("loadedmetadata", () => {
      if (this.pendingSeek !== null) {
        console.log("[VIDEO] Applying pending seek:", this.pendingSeek);
        this.player!.currentTime(this.pendingSeek);
        this.pendingSeek = null;
      }
    });
  }

  /**
   * Load a new video source only if changed
   */
  loadSource(src: string): void {
    if (!this.player) {
      throw new Error("Video player not initialized");
    }

    if (this.currentSrc === src) return;

    console.log("[VIDEO] Loading new source:", src);
    this.currentSrc = src;
    this.player.src({ src, type: "video/mp4" });
  }

  /**
   * Seek to local segment time
   */
  seek(time: number): void {
    if (!this.player) return;

    const readyState = this.player.readyState();
    
    // ✅ If video is ready, seek immediately
    if (readyState && readyState >= 1) {
      console.log("[VIDEO] Seeking to:", time.toFixed(3));
      this.player.currentTime(Math.max(0, time));
    } else {
      // ✅ Otherwise, queue the seek for when metadata loads
      console.log("[VIDEO] Queueing seek for:", time.toFixed(3));
      this.pendingSeek = Math.max(0, time);
    }
  }

play(): void {
    if (!this.player) return;
    
    console.log("[VIDEO] Play called");
    const playPromise = this.player.play();
    
    // ✅ Check if play() returned a Promise
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.error("[VIDEO] Play failed:", err);
      });
    }
  }

  pause(): void {
    if (!this.player) return;
    
    console.log("[VIDEO] Pause called");
    this.player.pause();
  }

  dispose(): void {
    this.player?.dispose();
    this.player = null;
    this.currentSrc = null;
    this.pendingSeek = null;
  }
}