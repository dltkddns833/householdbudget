import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Clipboard,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../auth/services/authService';
import { ThemePreference } from '../../../store/uiStore';

interface Props {
  navigation: any;
}

interface MenuItem {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

const THEME_LABELS: Record<ThemePreference, string> = {
  system: '시스템 설정',
  light: '라이트 모드',
  dark: '다크 모드',
};

export const MoreMenuScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const { user, family, reset } = useAuthStore();
  const { colors, themePreference, setThemePreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  const menuItems: MenuItem[] = [
    {
      icon: 'savings',
      label: '예산 설정',
      subtitle: '카테고리별 월 예산 관리',
      onPress: () => navigation.navigate('BudgetSetting'),
    },
    {
      icon: 'repeat',
      label: '정기 지출 관리',
      subtitle: '월세, 구독 등 고정비 등록',
      onPress: () => navigation.navigate('RecurringList'),
    },
    {
      icon: 'account-balance',
      label: '재무상태',
      subtitle: '자산 현황 관리',
      onPress: () => navigation.navigate('Assets'),
    },
    {
      icon: 'brightness-6',
      label: '화면 모드',
      subtitle: THEME_LABELS[themePreference],
      onPress: handleThemeChange,
    },
    {
      icon: 'people',
      label: '가족 정보',
      subtitle: family ? `초대 코드: ${family.inviteCode}` : '',
      onPress: () => {
        if (family) {
          Clipboard.setString(family.inviteCode);
          Alert.alert('초대 코드', '초대 코드가 복사되었습니다', [
            { text: '확인' },
          ]);
        }
      },
    },
    {
      icon: 'logout',
      label: '로그아웃',
      onPress: handleSignOut,
      color: colors.danger,
    },
  ];

  return (
    <ScrollView ref={scrollRef} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>더보기</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {user?.displayName || '사용자'}
          </Text>
          <Text style={styles.profileEmail}>Google 연동</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Icon
              name={item.icon}
              size={22}
              color={item.color || colors.textSecondary}
              style={styles.menuIcon}
            />
            <View style={styles.menuContent}>
              <Text
                style={[styles.menuLabel, item.color && { color: item.color }]}
              >
                {item.label}
              </Text>
              {item.subtitle && (
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              )}
            </View>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    avatarText: {
      color: colors.white,
      fontSize: 20,
      fontWeight: '700',
    },
    profileInfo: {
      marginLeft: 14,
      flex: 1,
    },
    profileName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    menuSection: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    menuIcon: {
      marginRight: 14,
    },
    menuContent: {
      flex: 1,
    },
    menuLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    menuSubtitle: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 2,
    },
    version: {
      textAlign: 'center',
      color: colors.textTertiary,
      fontSize: 13,
      marginTop: 32,
      marginBottom: 40,
    },
  });
