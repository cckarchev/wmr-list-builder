/** Horizontal extent of a box, in viewport coordinates. */
export interface HorizontalBox {
  left: number;
  right: number;
}

/**
 * How far to move `box` horizontally so it stays `margin` inside the
 * viewport. Negative moves it left. When the box is wider than the viewport,
 * its left edge wins so the start of the content stays readable.
 */
export const viewportShift = (
  box: HorizontalBox,
  viewportWidth: number,
  margin: number,
): number => {
  const rightLimit = viewportWidth - margin;
  let shift = 0;

  if (box.right > rightLimit) {
    shift = rightLimit - box.right;
  }

  if (box.left + shift < margin) {
    shift = margin - box.left;
  }

  return shift;
};
