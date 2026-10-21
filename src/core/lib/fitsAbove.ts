/** Where a bubble would open above its trigger, in viewport coordinates. */
interface AbovePlacement {
  /** Top edge of the trigger. */
  triggerTop: number;
  bubbleHeight: number;
  /** Space kept between the bubble and its trigger. */
  gap: number;
  /** Height covered at the top of the viewport, such as by a sticky header. */
  topInset: number;
}

/** Whether a bubble opened above its trigger stays fully visible. */
export const fitsAbove = ({
  triggerTop,
  bubbleHeight,
  gap,
  topInset,
}: AbovePlacement): boolean => {
  const bubbleTop = triggerTop - gap - bubbleHeight;

  return bubbleTop >= topInset;
};
