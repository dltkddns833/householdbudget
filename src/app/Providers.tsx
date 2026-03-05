import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '117803852591-ghv0slk9jffp8kdf95mgvfc5m7kaa0hk.apps.googleusercontent.com',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export const Providers: React.FC<Props> = ({ children }) => (
  <GestureHandlerRootView style={styles.flex}>
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
