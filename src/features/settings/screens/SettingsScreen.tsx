import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../auth/services/authService';
import { ThemePreference } from '../../../store/uiStore';

interface Props {
  navigation: any;
}

const THEME_LABELS: Record<ThemePreference, string> = {
  system: '시스템 설정',
  light: '라이트 모드',
  dark: '다크 모드',
};

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, family, reset } = useAuthStore();
  const { colors, themePreference, setThemePreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleThemeChange = () => {
    const options: { text: string; pref: ThemePreference }[] = [
      { text: '시스템 설정', pref: 'system' },
      { text: '라이트 모드', pref: 'light' },
      { text: '다크 모드', pref: 'dark' },
    ];

    Alert.alert('화면 모드', '테마를 선택해주세요', [
      ...options.map(opt => ({
        text: opt.pref === themePreference ? `${opt.text} ✓` : opt.text,
        onPress: () => setThemePreference(opt.pref),
      })),
      { text: '취소', style: 'cancel' as const },
    ]);
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

  const handleDeleteAccount = () => {
    Alert.alert(
      '회원 탈퇴',
      '정말 탈퇴하시겠습니까?\n\n가족 데이터는 유지되며 본인 계정 정보만 삭제됩니다. 마지막 가족 구성원이라면 가족 데이터도 함께 삭제됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴', style: 'destructive', onPress: confirmDeleteAccount },
      ],
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      '최종 확인',
      '이 작업은 되돌릴 수 없습니다. Google 계정으로 재인증 후 탈퇴가 진행됩니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴 진행', style: 'destructive', onPress: performDeleteAccount },
      ],
    );
  };

  const performDeleteAccount = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error('재인증 실패: idToken 없음');
      }

      const credential = auth.GoogleAuthProvider.credential(idToken);
      await auth().currentUser!.reauthenticateWithCredential(credential);

      await authService.deleteAccount(user!.uid, family?.id ?? null);
      reset();
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert('오류', '재인증이 필요합니다. 다시 시도해주세요.');
      } else if (error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('오류', '회원 탈퇴 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView>
        {/* 환경 섹션 */}
        <Text style={styles.sectionTitle}>환경</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={handleThemeChange}>
            <Icon name="brightness-6" size={22} color={colors.textSecondary} style={styles.rowIcon} />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>화면 모드</Text>
              <Text style={styles.rowSubtitle}>{THEME_LABELS[themePreference]}</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('NotificationSetting')}>
            <Icon name="notifications" size={22} color={colors.textSecondary} style={styles.rowIcon} />
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>알림 설정</Text>
              <Text style={styles.rowSubtitle}>예산·고정비·월초 알림 관리</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* 계정 섹션 */}
        <Text style={styles.sectionTitle}>계정</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={handleSignOut}>
            <Icon name="logout" size={22} color={colors.danger} style={styles.rowIcon} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.danger }]}>로그아웃</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
            <Icon name="person-remove" size={22} color={colors.danger} style={styles.rowIcon} />
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.danger }]}>회원 탈퇴</Text>
              <Text style={styles.rowSubtitle}>계정 및 데이터를 영구 삭제합니다</Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      backgroundColor: colors.surface,
      gap: 8,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textTertiary,
      marginHorizontal: 24,
      marginTop: 24,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    section: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    rowIcon: {
      marginRight: 14,
    },
    rowContent: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    rowSubtitle: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginHorizontal: 16,
    },
  });
