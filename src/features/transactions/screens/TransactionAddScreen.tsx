import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CategoryDef,
} from '../../../shared/constants/categories';
import {
  formatInputNumber,
  parseInputNumber,
} from '../../../shared/utils/currency';
import { formatDateFull } from '../../../shared/utils/date';
import {
  useAddTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useRecentNames,
} from '../hooks/useTransactions';
import { Transaction, TransactionType } from '../../../shared/types';
import { storageService } from '../services/storageService';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../../../store/authStore';
import { ReceiptPicker } from '../components/ReceiptPicker';
import { ReceiptViewer } from '../components/ReceiptViewer';

interface Props {
  navigation: any;
  route?: any;
}

export const TransactionAddScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const editTx: Transaction | undefined = route?.params?.transaction;
  const isEdit = !!editTx;

  const [type, setType] = useState<TransactionType>(editTx?.type || 'expense');
  const [category, setCategory] = useState(editTx?.category || '');
  const [amountText, setAmountText] = useState(
    editTx ? formatInputNumber(String(editTx.amount)) : '',
  );
  const [name, setName] = useState(editTx?.name || '');
  const [date, setDate] = useState(editTx ? editTx.date.toDate() : new Date());
  const [memo, setMemo] = useState(editTx?.memo || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(date);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localReceiptUri, setLocalReceiptUri] = useState<string | null>(
    editTx?.receiptUrl ?? null,
  );
  const [receiptRemoved, setReceiptRemoved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const addMutation = useAddTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const { data: recentNames = [] } = useRecentNames(category);
  const { family } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const categories: CategoryDef[] =
    type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleAmountChange = (text: string) => {
    setAmountText(formatInputNumber(text));
  };

  const validate = (): boolean => {
    if (!category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return false;
    }
    if (!parseInputNumber(amountText)) {
      Alert.alert('알림', '금액을 입력해주세요.');
      return false;
    }
    if (!name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요.');
      return false;
    }
    return true;
  };

  const getInput = () => ({
    type,
    date,
    category,
    name: name.trim(),
    amount: parseInputNumber(amountText),
    memo: memo.trim(),
  });

  const handleSave = async () => {
    if (!validate()) return;
    const familyId = family?.id;
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          txId: editTx!.id,
          input: getInput(),
        });
        if (familyId) {
          const isNewImage = !!localReceiptUri && localReceiptUri !== editTx!.receiptUrl;
          if (isNewImage) {
            setIsUploading(true);
            const url = await storageService.uploadReceipt(familyId, editTx!.id, localReceiptUri!);
            await transactionService.updateReceiptUrl(familyId, editTx!.id, url);
          } else if (receiptRemoved) {
            await storageService.deleteReceipt(familyId, editTx!.id);
            await transactionService.updateReceiptUrl(familyId, editTx!.id, null);
          }
        }
      } else {
        const txId = await addMutation.mutateAsync(getInput());
        if (familyId && localReceiptUri) {
          setIsUploading(true);
          const url = await storageService.uploadReceipt(familyId, txId, localReceiptUri);
          await transactionService.updateReceiptUrl(familyId, txId, url);
        }
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validate()) return;
    try {
      const txId = await addMutation.mutateAsync(getInput());
      if (family?.id && localReceiptUri) {
        setIsUploading(true);
        const url = await storageService.uploadReceipt(family.id, txId, localReceiptUri);
        await transactionService.updateReceiptUrl(family.id, txId, url);
      }
      // Reset fields but keep type, category, and date
      setAmountText('');
      setName('');
      setMemo('');
      setLocalReceiptUri(null);
    } catch (error: any) {
      Alert.alert('오류', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (!editTx) return;
    Alert.alert('삭제 확인', '이 거래를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({
              txId: editTx.id,
              yearMonth: editTx.yearMonth,
            });
            navigation.goBack();
          } catch (error: any) {
            Alert.alert('오류', error.message);
          }
        },
      },
    ]);
  };

  const isLoading = addMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, !route && { paddingTop: 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? '거래 수정' : '거래 추가'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Type Segment */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segment,
              type === 'expense' && styles.segmentActiveExpense,
            ]}
            onPress={() => {
              setType('expense');
              setCategory('');
            }}
          >
            <Text
              style={[
                styles.segmentText,
                type === 'expense' && styles.segmentTextActive,
              ]}
            >
              지출
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segment,
              type === 'income' && styles.segmentActiveIncome,
            ]}
            onPress={() => {
              setType('income');
              setCategory('');
            }}
          >
            <Text
              style={[
                styles.segmentText,
                type === 'income' && styles.segmentTextActive,
              ]}
            >
              수입
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <Text style={styles.sectionLabel}>카테고리</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                category === cat.key && {
                  backgroundColor: cat.color,
                  borderColor: cat.color,
                },
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Icon
                name={cat.icon}
                size={18}
                color={category === cat.key ? colors.white : cat.color}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat.key && { color: colors.white },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amount */}
        <Text style={styles.sectionLabel}>금액</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>₩</Text>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Name */}
        <Text style={styles.sectionLabel}>이름</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={t => {
            setName(t);
            setShowSuggestions(true);
          }}
          placeholder="예: 쿠팡, 매머드"
          placeholderTextColor={colors.textTertiary}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && recentNames.length > 0 && name.length === 0 && (
          <View style={styles.suggestions}>
            {recentNames.map(n => (
              <TouchableOpacity
                key={n}
                style={styles.suggestionItem}
                onPress={() => {
                  setName(n);
                  setShowSuggestions(false);
                }}
              >
                <Text style={styles.suggestionText}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Date */}
        <Text style={styles.sectionLabel}>날짜</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => { setTempDate(date); setShowDatePicker(true); }}
        >
          <Text style={styles.dateText}>{formatDateFull(date)}</Text>
        </TouchableOpacity>
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerCancel}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>날짜 선택</Text>
                <TouchableOpacity onPress={() => {
                  setDate(tempDate);
                  setShowDatePicker(false);
                }}>
                  <Text style={styles.datePickerConfirm}>확인</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                locale="ko-KR"
                onChange={(_, selected) => {
                  if (selected) setTempDate(selected);
                }}
              />
            </View>
          </View>
        </Modal>

        {/* Memo */}
        <Text style={styles.sectionLabel}>비고</Text>
        <TextInput
          style={[styles.input, styles.memoInput]}
          value={memo}
          onChangeText={setMemo}
          placeholder="선택사항"
          placeholderTextColor={colors.textTertiary}
          multiline
        />

        {/* Receipt */}
        <Text style={styles.sectionLabel}>영수증</Text>
        <ReceiptPicker
          uri={localReceiptUri ?? undefined}
          onSelected={uri => {
            setLocalReceiptUri(uri);
            setReceiptRemoved(false);
          }}
          onRemoved={() => {
            setLocalReceiptUri(null);
            setReceiptRemoved(true);
          }}
        />

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? '저장 중...' : '저장'}
            </Text>
          </TouchableOpacity>
          {!isEdit && (
            <TouchableOpacity
              style={[
                styles.continueButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleSaveAndContinue}
              disabled={isLoading}
            >
              <Text style={styles.continueButtonText}>저장하고 계속 입력</Text>
            </TouchableOpacity>
          )}
        </View>
        {isEdit && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Icon name="delete-outline" size={18} color={colors.danger} />
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    headerButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 20,
    },
    segmentContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 4,
      marginTop: 12,
    },
    segment: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 10,
    },
    segmentActiveExpense: {
      backgroundColor: colors.expense,
    },
    segmentActiveIncome: {
      backgroundColor: colors.income,
    },
    segmentText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    segmentTextActive: {
      color: colors.white,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 20,
      marginBottom: 8,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 6,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: '600',
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
    memoInput: {
      minHeight: 60,
      textAlignVertical: 'top',
    },
    dateText: {
      fontSize: 16,
      color: colors.text,
    },
    suggestions: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 4,
    },
    suggestionItem: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
    },
    buttonGroup: {
      flexDirection: 'row',
      marginTop: 28,
      marginBottom: 40,
      gap: 10,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    continueButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    continueButtonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginBottom: 40,
    },
    deleteButtonText: {
      color: colors.danger,
      fontSize: 15,
      fontWeight: '600',
    },
    datePickerOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    datePickerContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    datePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    datePickerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    datePickerCancel: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    datePickerConfirm: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
  });
