import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { authService } from '../../features/auth/services/authService';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { FamilySetupScreen } from '../../features/auth/screens/FamilySetupScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { AnimatedSplash } from '../../shared/components/AnimatedSplash';
import { useTheme } from '../../shared/theme';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { user, family, isLoading, setUser, setFamily, setLoading } = useAuthStore();
  const { colors, isDark } = useTheme();
  const [splashDone, setSplashDone] = useState(false);
  const [storeHydrated, setStoreHydrated] = useState(() => useUIStore.persist.hasHydrated());

  useEffect(() => {
    if (useUIStore.persist.hasHydrated()) {
      setStoreHydrated(true);
      return;
    }
    return useUIStore.persist.onFinishHydration(() => setStoreHydrated(true));
  }, []);

  const navigationTheme: Theme = useMemo(() => ({
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  }), [colors, isDark]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await authService.getUser(firebaseUser.uid);
        if (userData) {
          setUser(userData);
          if (userData.familyId) {
            const familyData = await authService.getFamily(userData.familyId);
            setFamily(familyData);
          }
        }
      } else {
        setUser(null);
        setFamily(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (!splashDone) {
    return (
      <AnimatedSplash
        isReady={!isLoading && storeHydrated}
        onAnimationComplete={() => setSplashDone(true)}
      />
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !family ? (
          <Stack.Screen name="FamilySetup" component={FamilySetupScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
