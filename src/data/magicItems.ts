import magicItemsFile from './magic-items.revolution.json';
import type { MagicItemsFile } from './types';

/**
 * The Revolution magic-items dataset, typed once at the JSON import boundary
 * so consumers don't each repeat the `as MagicItemsFile` assertion.
 */
export const magicItems = magicItemsFile as MagicItemsFile;

/**
 * Magic items share one id space across armies, numbered from here up so they
 * never collide with an army's own upgrade ids.
 */
export const MAGIC_ITEM_ID_MIN = 100;

/** Upgrade `type` values that count as magic items. */
export const MAGIC_ITEM_TYPES = new Set(['Magic Standard', 'Magic Weapon', 'Device of Power']);
