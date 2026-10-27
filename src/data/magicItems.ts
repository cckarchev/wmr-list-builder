import magicItemsFile from "./magic-items.revolution.json";
import { normalizeMagicItems } from "./normalize";
import type { MagicItemsFile, RawMagicItemsFile } from "./types";

/**
 * The Revolution magic-items dataset, typed once at the JSON import boundary
 * and keyed by item id.
 */
export const magicItems: MagicItemsFile = normalizeMagicItems(
  magicItemsFile as RawMagicItemsFile,
);

/**
 * Magic items share one code space across armies, numbered from here up so they
 * never collide with an army's own upgrade codes.
 */
export const MAGIC_ITEM_CODE_MIN = 100;

/** Upgrade `type` values that count as magic items. */
export const MAGIC_ITEM_TYPES = new Set([
  "Magic Standard",
  "Magic Weapon",
  "Device of Power",
]);
