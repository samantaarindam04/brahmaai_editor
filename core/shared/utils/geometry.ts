export function toRelativeGeometry(
  rect: { x: number; y: number; width: number; height: number },
  container: { width: number; height: number }
) {
  return {
    x: rect.x / container.width,
    y: rect.y / container.height,
    width: rect.width / container.width,
    height: rect.height / container.height,
  };
}
