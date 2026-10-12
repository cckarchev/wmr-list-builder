const TITLE_SEPARATOR = ' · ';

/** The print sheet's heading: the army name, followed by the list name when there is one. */
export const sheetTitle = (armyName: string, listName: string): string => {
  if (!listName) {
    return armyName;
  }

  return `${armyName}${TITLE_SEPARATOR}${listName}`;
};
