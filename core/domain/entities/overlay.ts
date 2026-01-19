import { OverlayGeometry } from "../value-objects/OverlayGeometry";

export type OverlayType = "text" | "image";


export interface TextStyle {
  fontSize: number        // px
  color: string           // hex / rgb
  backgroundColor: string
  backgroundOpacity: number // 👈 MUST EXIST
}

export interface Overlay {
  id: string;
  type: OverlayType;

  content?: string; // text OR image URL

  geometry: OverlayGeometry;

  startTime: number;
  endTime: number;

  segmentIds: string[];
  text?: string;
  textStyle?: TextStyle;
  imageSrc?: string;
}
