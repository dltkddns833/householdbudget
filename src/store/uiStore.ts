import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { getCurrentYearMonth } from '../shared/utils/date';

const buildStorage = (): StateStorage => {
  try {
    const instance = new MMKV({ id: 'ui-store' });
    return {
      setItem: (name, value) => instance.set(name, value),
      getItem: (name) => instance.getString(name) ?? null,
      removeItem: (name) => instance.delete(name),
    };
  } catch {
    // MMKV 초기화 실패 시 in-memory 폴백 (앱 재시작 시 초기화됨)
    const map = new Map<string, string>();
    return {
      setItem: (name, value) => { map.set(name, value); },
      getItem: (name) => map.get(name) ?? null,
      removeItem: (name) => { map.delete(name); },
    };
  }
};

const mmkvStorage = buildStorage();

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
