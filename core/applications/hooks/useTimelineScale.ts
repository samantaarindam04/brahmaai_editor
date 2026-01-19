"use client";

import { useState } from "react";

const DEFAULT_PX_PER_SEC = 100;

export function useTimelineScale() {
  const [pxPerSec, setPxPerSec] = useState(DEFAULT_PX_PER_SEC);

  function zoomIn() {
    setPxPerSec((v) => Math.min(v * 1.25, 400));
  }

  function zoomOut() {
    setPxPerSec((v) => Math.max(v * 0.8, 20));
  }

  return {
    pxPerSec,
    zoomIn,
    zoomOut,
  };
}
