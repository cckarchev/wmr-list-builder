import { unitDomId } from './domIds';

const SCROLL_TO_CARD: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };

/** Scroll a unit's roster card into the middle of the view. */
export const scrollToUnit = (unitId: string): void => {
  const card = document.getElementById(unitDomId(unitId));

  card?.scrollIntoView(SCROLL_TO_CARD);
};
