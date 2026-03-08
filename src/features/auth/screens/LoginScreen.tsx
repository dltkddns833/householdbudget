import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../store/authStore';

const logoImage = require('../../../assets/splash_logo.png');

export const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { setUser, setFamily } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const user = await authService.signInWithGoogle();
      setUser(user);

      if (user.familyId) {
        const family = await authService.getFamily(user.familyId);
        setFamily(family);
      }
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIconWrap}>
            <Image source={logoImage} style={styles.logoIcon} resizeMode="contain" />
          </View>
          <Text style={styles.title}>우리집 가계부</Text>
          <Text style={styles.subtitle}>함께 관리하는 스마트한 가계부</Text>
        </View>

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>
            {loading ? '로그인 중...' : 'Google로 시작하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 64,
    },
    logoIconWrap: {
      width: 100,
      height: 100,
      borderRadius: 24,
      backgroundColor: '#0D9488',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: '#0D9488',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    logoIcon: {
      width: 60,
      height: 60,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      width: '100%',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    googleIcon: {
      fontSize: 20,
      fontWeight: '700',
      color: '#4285F4',
      marginRight: 12,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });
