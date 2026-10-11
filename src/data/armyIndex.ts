import type { Army } from './types';

const modules = import.meta.glob<Army>('./armies/*.json', { eager: true, import: 'default' });

/** Captures the file name of an army JSON path, e.g. `./armies/empire.json` -> `empire`. */
const ARMY_FILE_NAME = /^.*\/(.+)\.json$/;

const idFromPath = (path: string): string => path.replace(ARMY_FILE_NAME, '$1');

export interface ArmyIndexEntry {
  id: string;
  name: string;
}

export const armiesById: Record<string, Army> = Object.fromEntries(
  Object.entries(modules).map(([path, army]) => [idFromPath(path), army]),
);

export const armyIndex: ArmyIndexEntry[] = Object.entries(armiesById)
  .map(([id, army]) => ({ id, name: army.name }))
  .sort((a, b) => a.name.localeCompare(b.name));
