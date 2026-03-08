import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../store/authStore';

const logoImage = require('../../../assets/app-icon.png');

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
          <View style={styles.googleIconCircle}>
            <Text style={styles.googleIcon}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>
            {loading ? '로그인 중...' : 'Google로 시작하기'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          계속하면 서비스 이용약관 및{'\n'}개인정보처리방침에 동의하게 됩니다.
        </Text>
      </View>
    </View>
  );
};

const createStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0D9488',
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
      marginBottom: 28,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    logoIcon: {
      width: 100,
      height: 100,
      borderRadius: 22,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: 'rgba(255,255,255,0.75)',
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 24,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.4)',
      width: '100%',
      justifyContent: 'center',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    googleIconCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    googleIcon: {
      fontSize: 15,
      fontWeight: '700',
      color: '#4285F4',
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    terms: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.5)',
      textAlign: 'center',
      marginTop: 20,
      lineHeight: 18,
    },
  });
