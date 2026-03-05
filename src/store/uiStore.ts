import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { getCurrentYearMonth } from '../shared/utils/date';

const createStorage = (): StateStorage => {
  try {
    const { MMKV } = require('react-native-mmkv');
    const instance = new MMKV();
    return {
      setItem: (name: string, value: string) => instance.set(name, value),
      getItem: (name: string) => instance.getString(name) ?? null,
      removeItem: (name: string) => instance.delete(name),
    };
  } catch {
    // Fallback: in-memory storage
    const map = new Map<string, string>();
    return {
      setItem: (name: string, value: string) => { map.set(name, value); },
      getItem: (name: string) => map.get(name) ?? null,
      removeItem: (name: string) => { map.delete(name); },
    };
  }
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
      storage: createJSONStorage(() => createStorage()),
      partialize: (state) => ({ themePreference: state.themePreference }),
    },
  ),
);
