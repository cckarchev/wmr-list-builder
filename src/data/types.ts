export type StatValue = string | number;

export interface Unit {
  id: number;
  order: number;
  type: string;
  attack?: StatValue;
  range?: string;
  hits?: StatValue;
  armour?: string;
  command?: number;
  size?: number;
  points: number;
  /**
   * Marks a unit that casts the army's spells without being `type: 'Wizard'` —
   * e.g. the Skaven Grey Seer or Vampire Lord, who are Generals granted
   * spellcasting by a special rule. Lets the UI show spells without parsing
   * rule text. Wizards don't need this flag; their `type` already implies it.
   */
  caster?: boolean;
  min?: number | string;
  max?: number | string;
  armyMin?: number;
  armyMax?: number;
  noCount?: boolean;
  noMagic?: boolean;
  upgrades?: string[];
  specialRules?: string[];
  homologousUnits?: string[];
  requiredUnits?: string[];
  prohibitedUnits?: string[];
  augendUnits?: string[];
}

export interface Upgrade {
  id: number;
  order: number;
  type: string;
  attack?: StatValue;
  hits?: StatValue;
  size?: number;
  points?: StatValue;
  min?: number | string;
  max?: number | string;
  armyMin?: number;
  armyMax?: number;
  specialRules?: string[];
  addOnUpgrades?: string[];
  homologousUpgrades?: string[];
  requiredUpgrades?: string[];
  prohibitedUpgrades?: string[];
  requiredUnits?: string[];
  prohibitedUnits?: string[];
}

export interface SpecialRule {
  order?: number;
  text?: string[];
}

export interface MagicItem {
  id: number;
  order: string | number;
  type: string;
  points: string | Record<string, string>;
  pointsValue?: string;
  armyMax?: number;
  text: string[];
}

export interface MagicItemsFile {
  upgrades: Record<string, MagicItem>;
  upgradeConstraints: UpgradeConstraint[];
}

export interface Spell {
  name: string;
  roll: number;
  range?: string;
  fluff: string;
  text: string[];
}

/**
 * Rule that grants a set of upgrades to any unit matching the given criteria.
 * Applied in `buildUnits` when assembling each unit's available upgrades.
 */
export interface UpgradeConstraint {
  unitType: string[];
  unitArmour?: string[];
  unitHits?: (string | number)[];
  upgrades: string[];
  magic?: boolean;
}

export interface Army {
  name: string;
  version: string;
  group: number;
  order: number;
  units: Record<string, Unit>;
  upgrades?: Record<string, Upgrade>;
  upgradeConstraints?: UpgradeConstraint[];
  specialRules?: Record<string, SpecialRule>;
  magic?: boolean;
  spells?: Spell[];
  armyRules?: string[];
}

export interface ValidationError {
  message: string;
  /**
   * Ids of the unit(s)/upgrade(s) this error is attributed to, so it can be
   * rendered inline on the offending row. Empty for list-level (global) errors
   * such as the points ceiling.
   */
  targets: string[];
}
