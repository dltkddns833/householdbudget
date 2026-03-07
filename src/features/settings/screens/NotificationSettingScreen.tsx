import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import messaging from '@react-native-firebase/messaging';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { notificationService } from '../../notifications/services/notificationService';
import { NotificationSettings } from '../../../shared/types';

interface Props {
  navigation: any;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  budgetAlert: true,
  recurringAlert: true,
  monthlySetup: true,
};

export const NotificationSettingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuthStore();

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const authStatus = await messaging().hasPermission();
        setPermissionGranted(
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL,
        );
        const saved = await notificationService.getNotificationSettings(user.uid);
        setSettings(saved);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      await notificationService.updateNotificationSettings(user.uid, next);
    } catch {
      // 실패 시 롤백
      setSettings(settings);
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  const handleOpenSystemSettings = () => {
    Linking.openSettings();
  };

  const ITEMS: { key: keyof NotificationSettings; label: string; subtitle: string }[] = [
    {
      key: 'budgetAlert',
      label: '예산 초과 알림',
      subtitle: '카테고리 예산 80% 초과 시',
    },
    {
      key: 'recurringAlert',
      label: '고정비 납부일 알림',
      subtitle: '납부일 당일 오전 9시',
    },
    {
      key: 'monthlySetup',
      label: '월 초 예산 설정 안내',
      subtitle: '매월 1일, 예산 미설정 시',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림 설정</Text>
      </View>

      <ScrollView>
        {/* 권한 경고 배너 */}
        {!permissionGranted && !isLoading && (
          <TouchableOpacity
            style={[styles.permissionBanner, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleOpenSystemSettings}
          >
            <Icon name="notifications-off" size={20} color={colors.textSecondary} />
            <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
              알림 권한이 꺼져 있어요. 시스템 설정에서 켜주세요.
            </Text>
            <Icon name="chevron-right" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* 토글 목록 */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {ITEMS.map((item, idx) => (
            <View
              key={item.key}
              style={[
                styles.row,
                { borderBottomColor: colors.borderLight },
                idx === ITEMS.length - 1 && styles.rowLast,
                !permissionGranted && styles.rowDisabled,
              ]}
            >
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: permissionGranted ? colors.text : colors.textTertiary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.rowSubtitle, { color: colors.textTertiary }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Switch
                value={permissionGranted && settings[item.key]}
                onValueChange={val => handleToggle(item.key, val)}
                trackColor={{ false: colors.borderLight, true: colors.primary }}
                thumbColor={colors.white}
                disabled={!permissionGranted}
              />
            </View>
          ))}
        </View>

        {/* 시스템 설정 이동 */}
        <TouchableOpacity
          style={[styles.systemRow, { backgroundColor: colors.surface }]}
          onPress={handleOpenSystemSettings}
        >
          <Icon name="settings" size={20} color={colors.textSecondary} style={styles.systemIcon} />
          <Text style={[styles.systemLabel, { color: colors.text }]}>
            시스템 알림 설정으로 이동
          </Text>
          <Icon name="chevron-right" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
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
      paddingTop: 56,
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
    permissionBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      padding: 14,
      borderRadius: 12,
      gap: 10,
    },
    permissionText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
    },
    section: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowDisabled: {
      opacity: 0.45,
    },
    rowContent: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 15,
      fontWeight: '600',
    },
    rowSubtitle: {
      fontSize: 13,
      marginTop: 2,
    },
    systemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    systemIcon: {
      marginRight: 12,
    },
    systemLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
    },
  });
