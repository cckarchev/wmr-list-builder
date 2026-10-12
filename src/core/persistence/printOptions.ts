import { DEFAULT_PRINT_OPTIONS, type PrintOptions } from '@/core/print/printOptions';
import { readJson, writeJson } from './storage';

const STORAGE_KEY = 'wmr:printOptions';

const OPTION_KEYS = Object.keys(DEFAULT_PRINT_OPTIONS) as (keyof PrintOptions)[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/** Keeps the known boolean options from a stored value, defaulting the rest. */
const sanitize = (stored: unknown): PrintOptions => {
  const options = { ...DEFAULT_PRINT_OPTIONS };

  if (!isRecord(stored)) {
    return options;
  }

  for (const key of OPTION_KEYS) {
    const value = stored[key];

    if (typeof value === 'boolean') {
      options[key] = value;
    }
  }

  return options;
};

/** Remember the print options, so the next visit to the print sheet starts from them. */
export const savePrintOptions = (options: PrintOptions): void => {
  writeJson(STORAGE_KEY, options);
};

export const loadPrintOptions = (): PrintOptions => sanitize(readJson(STORAGE_KEY));
