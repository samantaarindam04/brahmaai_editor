"use client";

import { createContext, useContext } from "react";
import { EditorState } from "../states/editorState";
import { EditorActions } from "../states/editorAction";


interface EditorContextValue {
  state: EditorState;
  dispatch: React.Dispatch<EditorActions>;
  videoElementRef: React.RefObject<HTMLVideoElement | null>;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  value,
  children,
}: {
  value: EditorContextValue;
  children: React.ReactNode;
}) {
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return ctx;
}

export function useEditorDispatch() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditorDispatch must be used within EditorProvider");
  }
  return ctx.dispatch;
}
