"use client"

import { useEditorDispatch } from "@/core/applications/contexts/EditorContext"

export function TextStyleControls({ overlayId }: { overlayId: string }) {
  const dispatch = useEditorDispatch()

  return (
    <div className="text-style-controls flex items-center gap-2">
      {/* FONT SIZE */}
      <input
        type="number"
        min={8}
        max={96}
        defaultValue={16}
        onChange={e =>
          dispatch({
            type: "UPDATE_TEXT_STYLE",
            payload: {
              overlayId,
              style: { fontSize: Number(e.target.value) },
            },
          })
        }
      />

      {/* TEXT COLOR */}
      <input
        type="color"
        onChange={e =>
          dispatch({
            type: "UPDATE_TEXT_STYLE",
            payload: {
              overlayId,
              style: { color: e.target.value },
            },
          })
        }
      />

      {/* BACKGROUND COLOR */}
      <input
        type="color"
        onChange={e =>
          dispatch({
            type: "UPDATE_TEXT_STYLE",
            payload: {
              overlayId,
              style: { backgroundColor: e.target.value },
            },
          })
        }
      />

      {/* BACKGROUND OPACITY */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        defaultValue={0.4}
        onChange={e =>
          dispatch({
            type: "UPDATE_TEXT_STYLE",
            payload: {
              overlayId,
              style: {
                backgroundOpacity: Number(e.target.value),
              },
            },
          })
        }
      />
    </div>
  )
}
