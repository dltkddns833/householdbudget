import React from 'react';
import { StatusBar } from 'react-native';
import { Providers } from './Providers';
import { RootNavigator } from './navigation/RootNavigator';
import { TransactionAddModal } from '../features/transactions/components/TransactionAddModal';
import { useTheme } from '../shared/theme';
import { useNotifications } from '../features/notifications/hooks/useNotifications';

const ThemedStatusBar: React.FC = () => {
  const { colors, isDark } = useTheme();
  return (
    <StatusBar
      barStyle={isDark ? 'light-content' : 'dark-content'}
      backgroundColor={colors.background}
    />
  );
};

const AppInner: React.FC = () => {
  useNotifications();
  return (
    <>
      <ThemedStatusBar />
      <RootNavigator />
      <TransactionAddModal />
    </>
  );
};

const App: React.FC = () => (
  <Providers>
    <AppInner />
  </Providers>
);

export default App;
