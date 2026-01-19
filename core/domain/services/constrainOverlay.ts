import { OverlayGeometry } from "../value-objects/OverlayGeometry"

export function constrainOverlay(
  g: OverlayGeometry
): OverlayGeometry {
  return {
    x: Math.max(0, Math.min(g.x, 1 - g.width)),
    y: Math.max(0, Math.min(g.y, 1 - g.height)),
    width: Math.max(0.05, Math.min(g.width, 1)),
    height: Math.max(0.05, Math.min(g.height, 1)),
  }
}
