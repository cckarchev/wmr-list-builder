import { create } from 'zustand';
import type { ListSnapshot } from '@/core/persistence/snapshot';
import { type ArmyData, emptyData, initializeState } from './armyData';
import { withGameSize, withUnitNumber, withUnitUpgradeNumber } from './transitions/transitions';
import { withList } from './transitions/withList';

interface ArmyActions {
  setArmy: (id: string) => void;
  setUnitNumber: (unitId: string, number: number) => void;
  setUnitUpgradeNumber: (unitId: string, upgradeId: string, number: number) => void;
  setLabel: (label: string) => void;
  setGameSize: (size: number) => void;
  setLoadWarning: (message: string | null) => void;
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

  setGameSize: (size) => set((state) => withGameSize(state, size)),

  applyList: (snap) => set((state) => withList(state, snap)),

  reset: () => set(emptyData()),
}));
