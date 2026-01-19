"use client"
import { useEditorDispatch } from "@/core/applications/contexts/EditorContext";

export default function ResizeHandle({
  side,
  segmentId,
  px,
}: {
  side: "start" | "end";
  segmentId: string;
  px: number;
}) {
  const dispatch = useEditorDispatch();
  return (
    <div
      draggable
      onDrag={e =>
        dispatch({
          type: "RESIZE_SEGMENT",
          payload: {
            segmentId,
            delta: e.movementX / px,
            edge: side,
          },
        })
      }
      style={{
        position: "absolute",
        [side]: 0,
        width: 6,
        height: "100%",
        cursor: "ew-resize",
        background: "rgba(0,0,0,0.4)",
      }}
    />
  );
}
