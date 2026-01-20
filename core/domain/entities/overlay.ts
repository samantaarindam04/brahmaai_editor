import { OverlayGeometry } from "../value-objects/OverlayGeometry";
export type OverlayType = "text" | "image";
export interface TextStyle {
  fontSize: number
  color: string
  backgroundColor: string
  backgroundOpacity: number
}
export interface Overlay {
  id: string;
  type: OverlayType;
  content?: string;
  geometry: OverlayGeometry;
  startTime: number;
  endTime: number;
  segmentIds: string[];
  text?: string;
  textStyle?: TextStyle;
  imageSrc?: string;
}
