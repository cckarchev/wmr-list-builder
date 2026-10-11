import { create } from 'zustand';
import type { ListSnapshot } from '@/core/persistence/persistence';
import { type ArmyData, emptyData, initializeState } from './armyData';
import { withGameSize, withList, withUnitNumber, withUnitUpgradeNumber } from './transitions';

export type { UnitState, UnitUpgradeEntry, UpgradeState } from '@/core/storeHelpers';

export interface ArmyActions {
  setArmy: (id: string) => void;
  setUnitNumber: (unitId: string, number: number) => void;
  setUnitUpgradeNumber: (unitId: string, upgradeId: string, number: number) => void;
  setLabel: (label: string) => void;
  setGameSize: (n: number) => void;
  setLoadWarning: (msg: string | null) => void;
  setSavedBaseline: (encoded: string | null) => void;
  applyList: (snap: ListSnapshot) => void;
  reset: () => void;
}

export type ArmyState = ArmyData & ArmyActions;

export const useArmyStore = create<ArmyState>((set) => ({
  ...emptyData(),

  setArmy: (id) => set(initializeState(id)),

  setUnitNumber: (unitId, number) => set((state) => withUnitNumber(state, unitId, number)),

  setUnitUpgradeNumber: (unitId, upgradeId, number) =>
    set((state) => withUnitUpgradeNumber(state, unitId, upgradeId, number)),

  setLabel: (label) => set({ label }),

  setLoadWarning: (loadWarning) => set({ loadWarning }),

  setSavedBaseline: (savedBaseline) => set({ savedBaseline }),

  setGameSize: (n) => set((state) => withGameSize(state, n)),

  applyList: (snap) => set((state) => withList(state, snap)),

  reset: () => set(emptyData()),
}));
