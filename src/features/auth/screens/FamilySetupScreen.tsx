import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../store/authStore';

export const FamilySetupScreen: React.FC = () => {
  const { user, setUser, setFamily, reset } = useAuthStore();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleCreate = async () => {
    if (!displayName.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      const family = await authService.createFamily(user!.uid, displayName.trim());
      setUser({ ...user!, familyId: family.id });
      setFamily(family);
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!displayName.trim() || !inviteCode.trim()) {
      Alert.alert('알림', '이름과 초대 코드를 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      const family = await authService.joinFamily(user!.uid, displayName.trim(), inviteCode.trim().toUpperCase());
      setUser({ ...user!, familyId: family.id });
      setFamily(family);
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await authService.signOut();
          reset();
        },
      },
    ]);
  };

  if (mode === 'choose') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>가족 설정</Text>
          <Text style={styles.subtitle}>가계부를 함께 관리할 가족을 설정하세요</Text>

          <TouchableOpacity style={styles.optionButton} onPress={() => setMode('create')}>
            <Text style={styles.optionTitle}>새 가족 만들기</Text>
            <Text style={styles.optionDesc}>초대 코드를 생성하여 가족을 초대합니다</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={() => setMode('join')}>
            <Text style={styles.optionTitle}>초대 코드로 참여</Text>
            <Text style={styles.optionDesc}>받은 초대 코드를 입력하여 참여합니다</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>다른 계정으로 로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <TouchableOpacity onPress={() => setMode('choose')} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {mode === 'create' ? '가족 만들기' : '가족 참여'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>표시 이름</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="예: 상운"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {mode === 'join' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>초대 코드</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="8자리 코드 입력"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              maxLength={8}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={mode === 'create' ? handleCreate : handleJoin}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading ? '처리 중...' : mode === 'create' ? '가족 만들기' : '참여하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
      justifyContent: 'flex-start',
      paddingHorizontal: 32,
      paddingTop: 80,
    },
    backButton: {
      marginBottom: 24,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 32,
    },
    optionButton: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    optionDesc: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    inputGroup: {
      marginTop: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    codeInput: {
      letterSpacing: 4,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 32,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    submitText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    signOutButton: {
      alignItems: 'center',
      marginTop: 32,
      paddingVertical: 8,
    },
    signOutText: {
      fontSize: 14,
      color: colors.textTertiary,
    },
  });
