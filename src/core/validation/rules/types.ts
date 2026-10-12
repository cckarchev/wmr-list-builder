import type { UnitState, UnitUpgradeEntry, UpgradeState } from '@/core/army-state/types';

/**
 * Structural superset of the fields the rules read off an "item".
 * The item is either a UnitState or an UpgradeState; all the fields below are
 * optional on at least one of those shapes, so we model the union as a record
 * of optionals (mirroring the dynamic property access in the Vue code).
 */
export type ValidatableItem = {
  name: string;
  number: number;
  homologousUnits?: string[];
  homologousUpgrades?: string[];
  requiredUnits?: string[];
  requiredUpgrades?: string[];
  prohibitedUnits?: string[];
  prohibitedUpgrades?: string[];
  augendUnits?: string[];
  armyMin?: number;
  armyMax?: number;
  min?: number | string;
  max?: number | string;
  upgrades?: Record<string, UnitUpgradeEntry>;
};

/** The units or upgrades an item's keyword min/max is measured against. */
export interface RequiredGroup {
  count: number;
  sentence: string;
}

/** Everything a rule needs to judge one item. */
export interface RuleContext {
  item: ValidatableItem;
  /** How the item is named in messages: its id, or its whole homologous group. */
  label: string;
  /** The item's count plus its homologous items' counts. */
  groupNumber: number;
  required?: RequiredGroup;
  units: Record<string, UnitState>;
  upgrades: Record<string, UpgradeState>;
  gameSize: number;
  size: number;
}

/** A rule returns its error message, or undefined when the item passes. */
export type Rule = (context: RuleContext) => string | undefined;
