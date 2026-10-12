import { ownValue } from '@/core/lib/ownValue';
import { normalizeArmy } from './normalize';
import type { Army, RawArmy } from './types';

const modules = import.meta.glob<RawArmy>('./armies/*.json', { eager: true, import: 'default' });

/** Captures the file name of an army JSON path, e.g. `./armies/empire.json` -> `empire`. */
const ARMY_FILE_NAME = /^.*\/(.+)\.json$/;

const idFromPath = (path: string): string => path.replace(ARMY_FILE_NAME, '$1');

interface ArmyIndexEntry {
  id: string;
  name: string;
}

export const armiesById: Record<string, Army> = Object.fromEntries(
  Object.entries(modules).map(([path, raw]) => [idFromPath(path), normalizeArmy(raw)]),
);

/** The army with this id, or undefined for an id that names no army, such as one from a URL. */
export const findArmy = (id: string): Army | undefined => ownValue(armiesById, id);

export const armyIndex: ArmyIndexEntry[] = Object.entries(armiesById)
  .map(([id, army]) => ({ id, name: army.name }))
  .sort((a, b) => a.name.localeCompare(b.name));
