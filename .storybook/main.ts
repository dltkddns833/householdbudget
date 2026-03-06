import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appSrc = path.resolve(__dirname, '../src');
const mocks = path.resolve(__dirname, '../src/__mocks__');

/** 상대경로 import를 가로채 네이티브 모듈을 웹용 mock으로 교체 */
const nativeMocksPlugin = {
  name: 'rn-native-mocks',
  enforce: 'pre' as const,
  resolveId(id: string, importer: string | undefined) {
    if (!importer) return;

    const resolved = id.startsWith('.')
      ? path.resolve(path.dirname(importer), id)
      : id;

    // src/shared/theme → 웹용 mock (MMKV/Zustand 없음)
    if (/\/shared\/theme(\/index)?$/.test(resolved)) {
      return path.resolve(mocks, 'theme.tsx');
    }
    // src/store/uiStore → 웹용 mock
    if (/\/store\/uiStore$/.test(resolved)) {
      return path.resolve(mocks, 'uiStore.ts');
    }
  },
};

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};

    const existingAlias = Array.isArray(config.resolve.alias)
      ? config.resolve.alias
      : Object.entries(config.resolve.alias ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }));

    config.resolve.alias = [
      ...existingAlias,
      { find: 'react-native', replacement: 'react-native-web' },
      {
        find: 'react-native-vector-icons/MaterialIcons',
        replacement: path.resolve(mocks, 'MaterialIcons.tsx'),
      },
      { find: 'react-native-mmkv', replacement: path.resolve(mocks, 'mmkv.ts') },
      { find: '@', replacement: appSrc },
    ];

    config.plugins = [...(config.plugins ?? []), nativeMocksPlugin];

    return config;
  },
};

export default config;
