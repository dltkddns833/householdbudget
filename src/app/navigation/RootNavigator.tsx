import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../features/auth/services/authService';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { FamilySetupScreen } from '../../features/auth/screens/FamilySetupScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { LoadingSpinner } from '../../shared/components';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { user, family, isLoading, setUser, setFamily, setLoading } = useAuthStore();

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

  if (isLoading) return <LoadingSpinner />;

  return (
    <NavigationContainer>
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
