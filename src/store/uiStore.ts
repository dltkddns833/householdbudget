import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { getCurrentYearMonth } from '../shared/utils/date';

const mmkv = new MMKV({ id: 'ui-store' });

const mmkvStorage: StateStorage = {
  setItem: (name: string, value: string) => mmkv.set(name, value),
  getItem: (name: string) => mmkv.getString(name) ?? null,
  removeItem: (name: string) => mmkv.delete(name),
};

export type ThemePreference = 'system' | 'light' | 'dark';

interface UIState {
  currentMonth: string; // "YYYY-MM"
  setCurrentMonth: (month: string) => void;
  isAddModalVisible: boolean;
  showAddModal: () => void;
  hideAddModal: () => void;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentMonth: getCurrentYearMonth(),
      setCurrentMonth: (currentMonth) => set({ currentMonth }),
      isAddModalVisible: false,
      showAddModal: () => set({ isAddModalVisible: true }),
      hideAddModal: () => set({ isAddModalVisible: false }),
      themePreference: 'system',
      setThemePreference: (themePreference) => set({ themePreference }),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ themePreference: state.themePreference }),
    },
  ),
);
