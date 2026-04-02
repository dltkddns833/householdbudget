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
import { formatInputNumber, parseInputNumber } from '../../../shared/utils/currency';
import { useAddAccount } from '../hooks/useAssets';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  navigation: any;
  route: any;
}

export const AssetAddScreen: React.FC<Props> = ({ navigation, route }) => {
  const { yearMonth, accounts = [] } = route.params;
  const { family } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const mutation = useAddAccount();

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

  const [owner, setOwner] = useState(memberNames[0] || '');
  const [section, setSection] = useState<'realAsset' | 'retirement'>('realAsset');
  const [accountType, setAccountType] = useState('');
  const [subType, setSubType] = useState('');
  const [institution, setInstitution] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amountText, setAmountText] = useState('0');

  const [pickerTarget, setPickerTarget] = useState<'owner' | 'accountType' | 'subType' | 'institution' | null>(null);

  const pickerConfig = {
    owner: { title: '소유자', options: memberNames, selected: owner, onSelect: setOwner },
    accountType: { title: '계좌 유형', options: existingAccountTypes, selected: accountType, onSelect: setAccountType },
    subType: { title: '상세 유형', options: existingSubTypes, selected: subType, onSelect: setSubType },
    institution: { title: '금융기관', options: existingInstitutions, selected: institution, onSelect: setInstitution },
  };

  const activePicker = pickerTarget ? pickerConfig[pickerTarget] : null;

  const handleSave = async () => {
    if (!accountName.trim()) {
      Alert.alert('오류', '계좌명을 입력해주세요');
      return;
    }
    try {
      await mutation.mutateAsync({
        yearMonth,
        account: {
          owner,
          section,
          accountType: accountType.trim() || '기타',
          subType: subType.trim() || '기타',
          institution: institution.trim() || '기타',
          accountName: accountName.trim(),
          amount: parseInputNumber(amountText),
          sortOrder: Date.now(),
        },
      });
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
        <Text style={styles.headerTitle}>계좌 추가</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
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
          <Text style={[styles.selectButtonText, !accountType && { color: colors.textTertiary }]}>
            {accountType || '선택'}
          </Text>
          <Icon name="expand-more" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.label}>상세 유형</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setPickerTarget('subType')}>
          <Text style={[styles.selectButtonText, !subType && { color: colors.textTertiary }]}>
            {subType || '선택'}
          </Text>
          <Icon name="expand-more" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.label}>계좌명 *</Text>
        <TextInput
          style={styles.input}
          value={accountName}
          onChangeText={setAccountName}
          placeholder="예: 신한 저축 통장"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>금융기관</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setPickerTarget('institution')}>
          <Text style={[styles.selectButtonText, !institution && { color: colors.textTertiary }]}>
            {institution || '선택'}
          </Text>
          <Icon name="expand-more" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.label}>금액</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>₩</Text>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={(t) => setAmountText(formatInputNumber(t))}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, mutation.isPending && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={mutation.isPending}
        >
          <Text style={styles.saveButtonText}>
            {mutation.isPending ? '저장 중...' : '추가'}
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
          allowCustomInput={pickerTarget !== 'owner' && pickerTarget !== null}
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
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      marginTop: 20,
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
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 32,
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
