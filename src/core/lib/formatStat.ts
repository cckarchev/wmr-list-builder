/** Shown in place of a stat the troop does not have. */
export const MISSING_STAT = '–';

/** A stat as displayed: its value, or a placeholder when it is missing or empty. */
export const formatStat = (value: string | number | undefined): string => {
  if (value === undefined || value === '') {
    return MISSING_STAT;
  }

  return String(value);
};
