export type ThemePreference = 'light' | 'dark' | 'system';

let _themePreference: ThemePreference = 'system';
let _selectedYearMonth = '2026-03';
let _isAddModalVisible = false;

const store = {
  get themePreference() { return _themePreference; },
  get selectedYearMonth() { return _selectedYearMonth; },
  get isAddModalVisible() { return _isAddModalVisible; },
  setThemePreference: (pref: ThemePreference) => { _themePreference = pref; },
  setSelectedYearMonth: (ym: string) => { _selectedYearMonth = ym; },
  showAddModal: () => { _isAddModalVisible = true; },
  hideAddModal: () => { _isAddModalVisible = false; },
};

export const useUIStore = <T>(selector: (s: typeof store) => T): T => selector(store);
