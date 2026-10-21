/** How many are taken across the listed ids of a units or upgrades map. */
export const totalNumber = (
  ids: string[],
  pool: Record<string, { number: number }>,
): number => ids.reduce((total, id) => total + pool[id].number, 0);
