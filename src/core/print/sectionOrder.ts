/** One step up or down the order. */
export type OrderStep = -1 | 1;

const NOT_FOUND = -1;

/**
 * A full order of `ids` from a stored one: the stored ids it still knows, in
 * their stored order and once each, then any it lacks in their default order.
 */
export const completeOrder = (
  stored: readonly string[],
  ids: readonly string[],
): string[] => {
  const known = new Set(ids);
  const kept = [...new Set(stored)].filter((id) => known.has(id));
  const keptIds = new Set(kept);
  const missing = ids.filter((id) => !keptIds.has(id));

  return [...kept, ...missing];
};

/** The items sorted by their id's place in `order`; ids it lacks go last, as they came. */
export const orderById = <T extends { id: string }>(
  items: readonly T[],
  order: readonly string[],
): T[] => {
  const placeOf = (item: T): number => {
    const place = order.indexOf(item.id);

    return place === NOT_FOUND ? order.length : place;
  };

  return [...items].sort((a, b) => placeOf(a) - placeOf(b));
};

/**
 * The order with `id` swapped for the nearest movable id one `step` away,
 * skipping those that are not movable, such as sections the current list
 * lacks. Unchanged when there is nothing to swap with.
 */
export const moveInOrder = (
  order: readonly string[],
  id: string,
  step: OrderStep,
  movable: ReadonlySet<string>,
): string[] => {
  const next = [...order];
  const from = next.indexOf(id);

  if (from === NOT_FOUND) {
    return next;
  }

  let to = from + step;

  while (to >= 0 && to < next.length && !movable.has(next[to])) {
    to += step;
  }

  if (to < 0 || to >= next.length) {
    return next;
  }

  next[from] = next[to];
  next[to] = id;

  return next;
};
