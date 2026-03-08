import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { useAuthStore } from '../../../store/authStore';

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

export const MoreMenuScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const { user, family } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const familyMemberPreview = family
    ? Object.values(family.memberNames).join(', ')
    : '';

  const menuItems: MenuItem[] = [
    {
      icon: 'account-balance',
      label: '재무상태',
      subtitle: '자산 현황 관리',
      onPress: () => navigation.navigate('Assets'),
    },
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
      icon: 'trending-up',
      label: '저축률 목표 설정',
      subtitle: family?.savingRateGoal ? `목표: ${family.savingRateGoal}%` : '목표 없음',
      onPress: () => navigation.navigate('SavingRateGoal'),
    },
    {
      icon: 'flag',
      label: '자산 목표 설정',
      subtitle: '목표 금액 달성률 확인',
      onPress: () => navigation.navigate('GoalSetting'),
    },
  ];

  return (
    <ScrollView ref={scrollRef} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>더보기</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={styles.settingsButton}
        >
          <Icon name="settings" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Profile + 가족 정보 카드 */}
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
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
        <View style={styles.profileDivider} />
        <TouchableOpacity
          style={styles.familyInfoRow}
          onPress={() => navigation.navigate('FamilyInfo')}
        >
          <Icon name="people" size={20} color={colors.textSecondary} />
          <View style={styles.familyInfoText}>
            <Text style={styles.familyInfoLabel}>가족 정보</Text>
            {familyMemberPreview ? (
              <Text style={styles.familyInfoSub}>{familyMemberPreview}</Text>
            ) : null}
          </View>
          <Icon name="chevron-right" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    settingsButton: {
      padding: 4,
    },
    profileCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
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
    profileDivider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginHorizontal: 16,
    },
    familyInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
      gap: 12,
    },
    familyInfoText: {
      flex: 1,
    },
    familyInfoLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    familyInfoSub: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 1,
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
