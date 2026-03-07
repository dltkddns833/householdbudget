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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
import { RecurringTransaction, TransactionType } from '../../../shared/types';
import { useCreateRecurring, useUpdateRecurring } from '../hooks/useRecurring';

interface Props {
  navigation: any;
  route?: any;
}

export const RecurringFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const editItem: RecurringTransaction | undefined = route?.params?.recurring;
  const isEdit = !!editItem;

  const [type, setType] = useState<TransactionType>(editItem?.type ?? 'expense');
  const [title, setTitle] = useState(editItem?.title ?? '');
  const [amountText, setAmountText] = useState(
    editItem ? formatInputNumber(String(editItem.amount)) : '',
  );
  const [category, setCategory] = useState(editItem?.category ?? '');
  const [dayOfMonthText, setDayOfMonthText] = useState(
    editItem ? String(editItem.dayOfMonth) : '',
  );

  const createMutation = useCreateRecurring();
  const updateMutation = useUpdateRecurring();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const categories: CategoryDef[] =
    type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const validate = (): boolean => {
    if (!title.trim()) {
      Alert.alert('알림', '거래명을 입력해주세요.');
      return false;
    }
    if (!parseInputNumber(amountText)) {
      Alert.alert('알림', '금액을 입력해주세요.');
      return false;
    }
    if (!category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return false;
    }
    const day = parseInt(dayOfMonthText, 10);
    if (!day || day < 1 || day > 31) {
      Alert.alert('알림', '매월 며칠인지 1~31 사이로 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'createdBy'> = {
      title: title.trim(),
      amount: parseInputNumber(amountText),
      category,
      dayOfMonth: parseInt(dayOfMonthText, 10),
      type,
      isActive: editItem?.isActive ?? true,
      ...(editItem?.lastAppliedYearMonth
        ? { lastAppliedYearMonth: editItem.lastAppliedYearMonth }
        : {}),
    };
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: editItem!.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('오류', e.message);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? '고정비 수정' : '고정비 추가'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Type Segment */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segment, type === 'expense' && styles.segmentActiveExpense]}
            onPress={() => {
              setType('expense');
              setCategory('');
            }}
          >
            <Text
              style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}
            >
              지출
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, type === 'income' && styles.segmentActiveIncome]}
            onPress={() => {
              setType('income');
              setCategory('');
            }}
          >
            <Text
              style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}
            >
              수입
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.sectionLabel}>거래명</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="예: 월세, 넷플릭스, 보험료"
          placeholderTextColor={colors.textTertiary}
        />

        {/* Amount */}
        <Text style={styles.sectionLabel}>금액</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>₩</Text>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={t => setAmountText(formatInputNumber(t))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Category */}
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

        {/* Day of Month */}
        <Text style={styles.sectionLabel}>매월 며칠</Text>
        <View style={styles.dayOfMonthRow}>
          <TextInput
            style={[styles.input, styles.dayInput]}
            value={dayOfMonthText}
            onChangeText={t => setDayOfMonthText(t.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor={colors.textTertiary}
            maxLength={2}
          />
          <Text style={styles.dayLabel}>일</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
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
    dayOfMonthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    dayInput: {
      width: 80,
      textAlign: 'center',
    },
    dayLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 32,
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
