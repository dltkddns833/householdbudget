export type ThemeColors = typeof lightColors;

export const lightColors = {
  primary: '#4F46E5',        // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#3730A3',

  secondary: '#10B981',      // Emerald
  secondaryLight: '#34D399',

  expense: '#3B82F6',        // Blue (감소)
  expenseLight: '#DBEAFE',
  income: '#EF4444',         // Red (증가)
  incomeLight: '#FEE2E2',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
  info: '#3B82F6',

  white: '#FFFFFF',
  black: '#000000',

  chartColors: [
    '#FF6B6B', '#4ECDC4', '#7C5CFC', '#FFD93D', '#6C9BCF',
    '#C68B59', '#95AABB', '#FF8FAB', '#45B7D1', '#96CEB4',
    '#A0A0A0',
  ],
};

export const darkColors: ThemeColors = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',

  secondary: '#34D399',
  secondaryLight: '#6EE7B7',

  expense: '#60A5FA',
  expenseLight: '#1E3A5F',
  income: '#F87171',
  incomeLight: '#5F1E1E',

  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',

  border: '#334155',
  borderLight: '#1E293B',

  danger: '#F87171',
  warning: '#FBBF24',
  success: '#4ADE80',
  info: '#60A5FA',

  white: '#FFFFFF',
  black: '#000000',

  chartColors: [
    '#FF6B6B', '#4ECDC4', '#7C5CFC', '#FFD93D', '#6C9BCF',
    '#C68B59', '#95AABB', '#FF8FAB', '#45B7D1', '#96CEB4',
    '#A0A0A0',
  ],
};