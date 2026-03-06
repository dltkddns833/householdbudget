import React from 'react';
import type { Preview, Decorator } from '@storybook/react';
import { ThemeProvider } from '../src/__mocks__/theme';
import { lightColors, darkColors } from '../src/shared/constants/colors';

const withTheme: Decorator = (Story, context) => {
  const isDark = context.globals['theme'] === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeProvider isDark={isDark}>
      <div
        style={{
          backgroundColor: colors.background,
          minHeight: '100vh',
          padding: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <Story />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: '라이트/다크 테마',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default preview;
