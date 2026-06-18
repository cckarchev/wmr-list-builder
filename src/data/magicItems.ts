import magicItemsFile from './magic-items.revolution.json';
import type { MagicItemsFile } from './types';

/**
 * The Revolution magic-items dataset, typed once at the JSON import boundary
 * so consumers don't each repeat the `as MagicItemsFile` assertion.
 */
export const magicItems = magicItemsFile as MagicItemsFile;
