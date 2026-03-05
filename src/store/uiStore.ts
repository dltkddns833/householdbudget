import { create } from 'zustand';
import { getCurrentYearMonth } from '../shared/utils/date';

interface UIState {
  currentMonth: string; // "YYYY-MM"
  setCurrentMonth: (month: string) => void;
  isAddModalVisible: boolean;
  showAddModal: () => void;
  hideAddModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentMonth: getCurrentYearMonth(),
  setCurrentMonth: (currentMonth) => set({ currentMonth }),
  isAddModalVisible: false,
  showAddModal: () => set({ isAddModalVisible: true }),
  hideAddModal: () => set({ isAddModalVisible: false }),
}));
