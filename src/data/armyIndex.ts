import type { Army } from './types';

const modules = import.meta.glob<Army>('./armies/*.json', { eager: true, import: 'default' });

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

function idFromPath(path: string): string {
  return path.replace(/^.*\/(.+)\.json$/, '$1');
}
