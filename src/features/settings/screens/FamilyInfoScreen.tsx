import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../auth/services/authService';
import { InviteCode } from '../../../shared/types';

interface Props {
  navigation: any;
}

export const FamilyInfoScreen: React.FC<Props> = ({ navigation }) => {
  const { user, family, setUser, setFamily } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [inviteLoading, setInviteLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);

  const loadInviteCode = useCallback(async () => {
    if (!family?.id) return;
    setInviteLoading(true);
    const code = await authService.getActiveInviteCode(family.id);
    setInviteCode(code);
    setInviteLoading(false);
  }, [family?.id]);

  useEffect(() => {
    loadInviteCode();
  }, [loadInviteCode]);

  const members = useMemo(() => {
    if (!family) return [];
    return family.members.map((uid) => ({
      uid,
      name: family.memberNames[uid] || uid,
      isMe: uid === user?.uid,
      photoURL: uid === user?.uid ? user?.photoURL : null,
    }));
  }, [family, user]);

  const handleCopyCode = () => {
    if (!inviteCode) return;
    Clipboard.setString(inviteCode.code);
    Alert.alert('복사 완료', '초대 코드가 클립보드에 복사되었습니다.');
  };

  const handleRegenCode = () => {
    Alert.alert(
      '코드 재생성',
      '기존 코드가 무효화됩니다. 재생성하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '재생성',
          onPress: async () => {
            const newCode = await authService.regenerateInviteCode(
              family!.id,
              user!.uid,
              inviteCode?.code,
            );
            setInviteCode(newCode);
            Clipboard.setString(newCode.code);
            Alert.alert('완료', '새 초대 코드가 생성되어 복사되었습니다.');
          },
        },
      ],
    );
  };

  const handleCreateCode = async () => {
    const newCode = await authService.createInviteCode(family!.id, user!.uid);
    setInviteCode(newCode);
    Clipboard.setString(newCode.code);
    Alert.alert('완료', '초대 코드가 생성되어 복사되었습니다.');
  };

  const handleLeaveFamily = () => {
    Alert.alert(
      '가족 탈퇴',
      '가족에서 탈퇴하면 데이터를 함께 볼 수 없게 됩니다.\n탈퇴하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴',
          style: 'destructive',
          onPress: async () => {
            try {
              setLeaving(true);
              await authService.leaveFamily(user!.uid, family!.id);
              setUser({ ...user!, familyId: null });
              setFamily(null);
            } catch (e: any) {
              Alert.alert('오류', e.message);
            } finally {
              setLeaving(false);
            }
          },
        },
      ],
    );
  };

  const expiryText = inviteCode
    ? new Date(inviteCode.expiresAt.toMillis()).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
      }) + '까지 유효'
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>가족 정보</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 멤버 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>멤버 ({members.length}명)</Text>
        <View style={styles.card}>
          {members.map((member, index) => (
            <View
              key={member.uid}
              style={[
                styles.memberItem,
                index < members.length - 1 && styles.memberItemBorder,
              ]}
            >
              {member.photoURL ? (
                <Image source={{ uri: member.photoURL }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarInitials, index === 0 ? styles.avatarTeal : styles.avatarBlue]}>
                  <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.memberInfo}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.isMe && (
                    <View style={styles.meBadge}>
                      <Text style={styles.meBadgeText}>나</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberRole}>
                  {index === 0 ? '가족장' : '멤버'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 초대 코드 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>초대 코드</Text>
        <View style={styles.card}>
          {inviteLoading ? (
            <View style={styles.inviteLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : inviteCode ? (
            <>
              <View style={styles.inviteCodeRow}>
                <View style={styles.codeDisplay}>
                  <Text style={styles.codeLabel}>가족 초대 코드</Text>
                  <Text style={styles.codeText}>{inviteCode.code}</Text>
                </View>
                <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                  <Icon name="content-copy" size={16} color={colors.white} />
                  <Text style={styles.copyBtnText}>복사</Text>
                </TouchableOpacity>
              </View>
              {expiryText && (
                <View style={styles.expiryRow}>
                  <Icon name="schedule" size={14} color={colors.textTertiary} />
                  <Text style={styles.expiryText}>{expiryText}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <TouchableOpacity style={styles.regenBtn} onPress={handleRegenCode}>
                <Icon name="refresh" size={18} color={colors.primary} />
                <Text style={styles.regenText}>코드 재생성</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.createCodeBtn} onPress={handleCreateCode}>
              <Icon name="add" size={18} color={colors.primary} />
              <Text style={styles.regenText}>초대 코드 생성</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 가족 탈퇴 */}
      <View style={styles.dangerSection}>
        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={handleLeaveFamily}
          disabled={leaving}
        >
          <Icon name="group-remove" size={20} color={colors.danger} />
          <Text style={styles.leaveText}>
            {leaving ? '처리 중...' : '가족 탈퇴'}
          </Text>
        </TouchableOpacity>
      </View>
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
      height: 56,
      paddingHorizontal: 4,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingTop: 8,
    },
    backBtn: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    headerSpacer: {
      width: 44,
    },
    section: {
      marginTop: 20,
      marginHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    memberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    memberItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },
    avatarInitials: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTeal: {
      backgroundColor: colors.primary,
    },
    avatarBlue: {
      backgroundColor: '#3B82F6',
    },
    avatarText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
    },
    memberInfo: {
      flex: 1,
    },
    memberNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    memberName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    meBadge: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 6,
    },
    meBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary,
    },
    memberRole: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    },
    inviteLoading: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    inviteCodeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    codeDisplay: {
      flex: 1,
    },
    codeLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textTertiary,
      marginBottom: 4,
    },
    codeText: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 3,
    },
    copyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    copyBtnText: {
      color: colors.white,
      fontSize: 13,
      fontWeight: '600',
    },
    expiryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    expiryText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderLight,
      marginHorizontal: 16,
    },
    regenBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    createCodeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    regenText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
    dangerSection: {
      marginTop: 24,
      marginHorizontal: 16,
      marginBottom: 40,
    },
    leaveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    leaveText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.danger,
    },
  });
