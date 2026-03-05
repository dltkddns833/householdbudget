import React from 'react';
import { StatusBar } from 'react-native';
import { Providers } from './Providers';
import { RootNavigator } from './navigation/RootNavigator';
import { TransactionAddModal } from '../features/transactions/components/TransactionAddModal';
import { useTheme } from '../shared/theme';

const ThemedStatusBar: React.FC = () => {
  const { colors, isDark } = useTheme();
  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={colors.background}
    />
  );
};

const App: React.FC = () => (
  <Providers>
    <ThemedStatusBar />
    <RootNavigator />
    <TransactionAddModal />
  </Providers>
);

export default App;
