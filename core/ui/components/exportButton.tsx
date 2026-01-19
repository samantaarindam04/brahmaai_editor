"use client";

import { useEditor } from "@/core/applications/contexts/EditorContext";
import { exportTimeline } from "@/core/shared/utils/exportTimeline";

export function ExportButton() {
  const { state } = useEditor();

  function onExport() {
    const json = exportTimeline(state);
    console.log("EXPORT JSON", json);
  }

  return <button onClick={onExport}>Export JSON</button>;
}
