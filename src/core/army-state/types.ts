import type { StatValue, Unit } from "@/data/types";

/** Stat placeholder the army data uses for a missing value, e.g. no armour. */
export const NO_STAT = "-";

/**
 * Runtime per-unit upgrade entry. Mirrors the Vue store's
 * `unit.upgrades[id] = { number, pointsCost }`.
 */
export interface UnitUpgradeEntry {
  number: number;
  pointsCost: number;
}

/**
 * Runtime unit. Same shape as the army `Unit` (minus the raw `upgrades`
 * string[] which the store converts into a keyed map) plus the live fields
 * the Vue store attaches in `SET_UNITS`: `number` and `pointsCost`.
 */
export interface UnitState extends Omit<Unit, "upgrades"> {
  number: number;
  pointsCost: number;
  upgrades?: Record<string, UnitUpgradeEntry>;
}

/**
 * Runtime upgrade in the GLOBAL `upgrades` map. This must accommodate both
 * army `Upgrade` records AND magic-item `MagicItem` records, because when an
 * army has `magic: true` the magic-item upgrades are merged into the same map
 * (see `initializeState`). The two source types differ on `points`
 * (`StatValue` vs `string | Record<string,string>`), and `MagicItem` carries
 * `pointsValue` + `text`. We model the reconciliation as a structural superset
 * so a value of either source type is assignable here, then add the live
 * `number` field the Vue store attaches in `SET_UPGRADES`.
 */
export interface UpgradeState {
  id: string;
  name: string;
  code?: number;
  type: string;
  points?: StatValue | Record<string, string>;
  pointsValue?: string;
  attack?: StatValue;
  hits?: StatValue;
  size?: number;
  min?: number | string;
  max?: number | string;
  armyMin?: number;
  armyMax?: number;
  range?: string;
  specialRules?: string[];
  addOnUpgrades?: string[];
  homologousUpgrades?: string[];
  requiredUpgrades?: string[];
  prohibitedUpgrades?: string[];
  requiredUnits?: string[];
  prohibitedUnits?: string[];
  text?: string[];
  // live field attached by the store
  number: number;
}

/** A list's runtime units and upgrades maps, keyed by id. */
export interface ArmyPools {
  units: Record<string, UnitState>;
  upgrades: Record<string, UpgradeState>;
}
