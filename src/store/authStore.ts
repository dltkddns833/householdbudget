import { create } from 'zustand';
import { User, Family } from '../shared/types';

interface AuthState {
  user: User | null;
  family: Family | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setFamily: (family: Family | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  family: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setFamily: (family) => set({ family }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ user: null, family: null, isLoading: false }),
}));
