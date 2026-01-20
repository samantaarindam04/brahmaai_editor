"use client";

import { useState } from "react";

const MIN_PX_PER_SEC = 20;
const MAX_PX_PER_SEC = 400;
const DEFAULT_PX_PER_SEC = 100;

export function useTimelineScale() {
  const [pxPerSec, _setPxPerSec] = useState(DEFAULT_PX_PER_SEC);

  function setPxPerSec(value: number) {
    _setPxPerSec(
      Math.min(Math.max(value, MIN_PX_PER_SEC), MAX_PX_PER_SEC)
    );
  }

  function zoomIn() {
    setPxPerSec(pxPerSec * 1.25);
  }

  function zoomOut() {
    setPxPerSec(pxPerSec * 0.8);
  }

  function fitToDuration(
    duration: number,
    viewportWidth: number
  ) {
    if (duration <= 0) return;

    const next = viewportWidth / duration;
    setPxPerSec(next);
  }

  return {
    pxPerSec,
    zoomIn,
    zoomOut,
    fitToDuration,
    setPxPerSec,
  };
}
