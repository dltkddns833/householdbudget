import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../shared/constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../auth/services/authService';

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
  const { user, family, reset } = useAuthStore();

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

  const menuItems: MenuItem[] = [
    {
      icon: 'account-balance',
      label: '재무상태',
      subtitle: '자산 현황 관리',
      onPress: () => navigation.navigate('Assets'),
    },
    {
      icon: 'people',
      label: '가족 정보',
      subtitle: family ? `초대 코드: ${family.inviteCode}` : '',
      onPress: () => {
        if (family) {
          Alert.alert('가족 초대 코드', family.inviteCode, [{ text: '확인' }]);
        }
      },
    },
    {
      icon: 'person',
      label: '프로필',
      subtitle: user?.email || '',
      onPress: () => {},
    },
    {
      icon: 'logout',
      label: '로그아웃',
      onPress: handleSignOut,
      color: COLORS.danger,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>더보기</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0) || '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.displayName || '사용자'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
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
              color={item.color || COLORS.textSecondary}
              style={styles.menuIcon}
            />
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, item.color && { color: item.color }]}>
                {item.label}
              </Text>
              {item.subtitle && (
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              )}
            </View>
            <Icon name="chevron-right" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 4,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
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
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: COLORS.surface,
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
    borderBottomColor: COLORS.borderLight,
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
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    color: COLORS.textTertiary,
    fontSize: 13,
    marginTop: 32,
    marginBottom: 40,
  },
});
