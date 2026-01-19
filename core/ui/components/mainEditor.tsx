"use client";

import { useReducer } from "react";
import { editorReducer } from "@/core/applications/states/editorReducer";
import { initialEditorState } from "@/core/applications/states/editorState";

import { EditorProvider } from "@/core/applications/contexts/EditorContext";

import { Timeline } from "@/core/ui/components/timeline";
import { ExportButton } from "./exportButton";
import { VideoPreview } from "./videoPreview";
import { EditorToolbar } from "./EditorToolbar";


export function MainEditor() {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <EditorProvider value={{ state, dispatch }}>
        <EditorToolbar/>
        <VideoPreview />
        <Timeline />
        <ExportButton />
      </EditorProvider>
    </div>  
  );
}
