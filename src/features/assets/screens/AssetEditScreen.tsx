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
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { OptionPicker } from '../../../shared/components';
import { formatInputNumber, parseInputNumber, formatCurrency } from '../../../shared/utils/currency';
import { useUpdateAccount, useUpdateAccountAmount, useDeleteAccount } from '../hooks/useAssets';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  navigation: any;
  route: any;
}

export const AssetEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { account, yearMonth, accounts = [] } = route.params;
  const { family } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const amountMutation = useUpdateAccountAmount();
  const fullMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  const [detailMode, setDetailMode] = useState(false);
  const [amountText, setAmountText] = useState(formatInputNumber(String(account.amount)));

  // 상세 수정용 state
  const memberNames = useMemo(
    () => Object.values(family?.memberNames || {}) as string[],
    [family],
  );
  const existingAccountTypes = useMemo(
    () => Array.from(new Set<string>(accounts.map((a: any) => a.accountType).filter(Boolean))),
    [accounts],
  );
  const existingSubTypes = useMemo(
    () => Array.from(new Set<string>(accounts.map((a: any) => a.subType).filter(Boolean))),
    [accounts],
  );
  const existingInstitutions = useMemo(
    () => Array.from(new Set<string>(accounts.map((a: any) => a.institution).filter(Boolean))),
    [accounts],
  );

  const [owner, setOwner] = useState(account.owner);
  const [section, setSection] = useState<'realAsset' | 'retirement'>(account.section);
  const [accountType, setAccountType] = useState(account.accountType);
  const [subType, setSubType] = useState(account.subType);
  const [institution, setInstitution] = useState(account.institution);
  const [accountName, setAccountName] = useState(account.accountName);

  const [pickerTarget, setPickerTarget] = useState<'owner' | 'accountType' | 'subType' | 'institution' | null>(null);

  const pickerConfig = {
    owner: { title: '소유자', options: memberNames, selected: owner, onSelect: setOwner },
    accountType: { title: '계좌 유형', options: existingAccountTypes, selected: accountType, onSelect: setAccountType },
    subType: { title: '상세 유형', options: existingSubTypes, selected: subType, onSelect: setSubType },
    institution: { title: '금융기관', options: existingInstitutions, selected: institution, onSelect: setInstitution },
  };

  const activePicker = pickerTarget ? pickerConfig[pickerTarget] : null;

  const isSaving = amountMutation.isPending || fullMutation.isPending;

  const handleDelete = () => {
    Alert.alert('계좌 삭제', `${account.accountName}을(를) 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ yearMonth, accountId: account.id });
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('오류', error.message);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    try {
      if (detailMode) {
        if (!accountName.trim()) {
          Alert.alert('오류', '계좌명을 입력해주세요');
          return;
        }
        await fullMutation.mutateAsync({
          yearMonth,
          accountId: account.id,
          data: {
            owner,
            section,
            accountType: accountType.trim() || '기타',
            subType: subType.trim() || '기타',
            institution: institution.trim() || '기타',
            accountName: accountName.trim(),
            amount: parseInputNumber(amountText),
            sortOrder: account.sortOrder,
          },
        });
      } else {
        await amountMutation.mutateAsync({
          yearMonth,
          accountId: account.id,
          amount: parseInputNumber(amountText),
        });
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{detailMode ? '계좌 수정' : '금액 수정'}</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
          <Icon name="delete" size={22} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* 계좌 정보 요약 */}
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{account.accountName}</Text>
          <Text style={styles.accountDetail}>
            {account.owner} · {account.institution} · {account.subType}
          </Text>
          <Text style={styles.currentAmount}>
            현재: {formatCurrency(account.amount)}
          </Text>
        </View>

        {/* 금액 입력 */}
        <Text style={styles.label}>새 금액</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>₩</Text>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={(t) => setAmountText(formatInputNumber(t))}
            keyboardType="numeric"
            autoFocus={!detailMode}
          />
        </View>

        {/* 상세 수정 토글 */}
        {!detailMode ? (
          <TouchableOpacity
            style={styles.detailToggle}
            onPress={() => setDetailMode(true)}
          >
            <Icon name="tune" size={18} color={colors.primary} />
            <Text style={styles.detailToggleText}>상세 수정</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.label}>분류</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, section === 'realAsset' && styles.toggleBtnActive]}
                onPress={() => setSection('realAsset')}
              >
                <Text style={[styles.toggleText, section === 'realAsset' && styles.toggleTextActive]}>
                  실자산
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, section === 'retirement' && styles.toggleBtnActive]}
                onPress={() => setSection('retirement')}
              >
                <Text style={[styles.toggleText, section === 'retirement' && styles.toggleTextActive]}>
                  은퇴자금
                </Text>
              </TouchableOpacity>
            </View>

            {memberNames.length > 1 && (
              <>
                <Text style={styles.label}>소유자</Text>
                <TouchableOpacity style={styles.selectButton} onPress={() => setPickerTarget('owner')}>
                  <Text style={styles.selectButtonText}>{owner}</Text>
                  <Icon name="expand-more" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.label}>계좌 유형</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setPickerTarget('accountType')}>
              <Text style={styles.selectButtonText}>{accountType || '선택'}</Text>
              <Icon name="expand-more" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.label}>상세 유형</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setPickerTarget('subType')}>
              <Text style={styles.selectButtonText}>{subType || '선택'}</Text>
              <Icon name="expand-more" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.label}>계좌명</Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="예: 신한 저축 통장"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={styles.label}>금융기관</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setPickerTarget('institution')}>
              <Text style={styles.selectButtonText}>{institution || '선택'}</Text>
              <Icon name="expand-more" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {activePicker && (
        <OptionPicker
          visible
          title={activePicker.title}
          options={activePicker.options}
          selected={activePicker.selected}
          onSelect={activePicker.onSelect}
          onClose={() => setPickerTarget(null)}
          allowCustomInput={pickerTarget !== 'owner'}
        />
      )}
    </KeyboardAvoidingView>
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
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    backBtn: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    accountInfo: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 4,
    },
    accountName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    accountDetail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    currentAmount: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textTertiary,
      marginTop: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      marginTop: 20,
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
    },
    currencyPrefix: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginRight: 4,
    },
    amountInput: {
      flex: 1,
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      paddingVertical: 14,
    },
    detailToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 16,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.surfaceSecondary,
    },
    detailToggleText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 10,
      padding: 3,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    toggleBtnActive: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textTertiary,
    },
    toggleTextActive: {
      color: colors.text,
    },
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    selectButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 28,
      marginBottom: 40,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
