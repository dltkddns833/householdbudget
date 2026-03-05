import React from 'react';
import { StatusBar } from 'react-native';
import { Providers } from './Providers';
import { RootNavigator } from './navigation/RootNavigator';
import { TransactionAddModal } from '../features/transactions/components/TransactionAddModal';

const App: React.FC = () => (
  <Providers>
    <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
    <RootNavigator />
    <TransactionAddModal />
  </Providers>
);

export default App;
