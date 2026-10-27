/** The display names of the listed ids of a units or upgrades map. */
export const namesOf = (
  ids: string[],
  pool: Record<string, { name: string }>,
): string[] => ids.map((id) => pool[id].name);
