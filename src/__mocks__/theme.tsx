import React, { createContext, useContext, useState } from 'react';
import { lightColors, darkColors, ThemeColors } from '../shared/constants/colors';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (pref: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  themePreference: 'system',
  setThemePreference: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface Props {
  children: React.ReactNode;
  isDark?: boolean;
}

export const ThemeProvider: React.FC<Props> = ({ children, isDark: initialDark = false }) => {
  const [isDark, setIsDark] = useState(initialDark);

  return (
    <ThemeContext.Provider
      value={{
        colors: isDark ? darkColors : lightColors,
        isDark,
        themePreference: isDark ? 'dark' : 'light',
        setThemePreference: (pref) => setIsDark(pref === 'dark'),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
