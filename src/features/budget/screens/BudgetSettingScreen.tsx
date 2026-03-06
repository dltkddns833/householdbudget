import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { EXPENSE_CATEGORIES } from '../../../shared/constants/categories';
import { budgetService } from '../services/budgetService';
import { useBudget, useUpsertBudget } from '../hooks/useBudget';
import { formatInputNumber, parseInputNumber } from '../../../shared/utils/currency';

interface Props {
  navigation: any;
}

type CategoryAmounts = Record<string, string>; // 입력 중인 문자열

export const BudgetSettingScreen: React.FC<Props> = ({ navigation }) => {
  const { currentMonth } = useUIStore();
  const { family } = useAuthStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const budgetQuery = useBudget(currentMonth);
  const upsertBudget = useUpsertBudget();

  // 폼 초기값: 기존 예산 불러오기
  const [amounts, setAmounts] = useState<CategoryAmounts>(() => {
    const saved = budgetQuery.data?.categories ?? {};
    const initial: CategoryAmounts = {};
    EXPENSE_CATEGORIES.forEach(cat => {
      const val = saved[cat.key];
      initial[cat.key] = val ? formatInputNumber(String(val)) : '';
    });
    return initial;
  });

  // 기존 예산이 로드되면 폼에 반영
  React.useEffect(() => {
    if (budgetQuery.data) {
      const saved = budgetQuery.data.categories;
      setAmounts(prev => {
        const updated = { ...prev };
        EXPENSE_CATEGORIES.forEach(cat => {
          const val = saved[cat.key];
          updated[cat.key] = val ? formatInputNumber(String(val)) : '';
        });
        return updated;
      });
    }
  }, [budgetQuery.data]);

  const totalBudget = useMemo(() => {
    return EXPENSE_CATEGORIES.reduce((sum, cat) => {
      return sum + parseInputNumber(amounts[cat.key] ?? '');
    }, 0);
  }, [amounts]);

  const handleChangeAmount = useCallback((key: string, text: string) => {
    setAmounts(prev => ({ ...prev, [key]: formatInputNumber(text) }));
  }, []);

  const handleCopyPrevious = async () => {
    if (!family?.id) return;
    try {
      const prev = await budgetService.getPreviousMonthBudget(family.id, currentMonth);
      if (!prev || Object.keys(prev.categories).length === 0) {
        Alert.alert('알림', '전월 예산이 없습니다.');
        return;
      }
      const updated: CategoryAmounts = {};
      EXPENSE_CATEGORIES.forEach(cat => {
        const val = prev.categories[cat.key];
        updated[cat.key] = val ? formatInputNumber(String(val)) : '';
      });
      setAmounts(updated);
    } catch {
      Alert.alert('오류', '전월 예산을 불러오는 데 실패했습니다.');
    }
  };

  const handleSave = async () => {
    const categories: Record<string, number> = {};
    EXPENSE_CATEGORIES.forEach(cat => {
      const val = parseInputNumber(amounts[cat.key] ?? '');
      if (val > 0) categories[cat.key] = val;
    });

    upsertBudget.mutate(
      { yearMonth: currentMonth, categories },
      {
        onSuccess: () => navigation.goBack(),
        onError: () => Alert.alert('오류', '저장에 실패했습니다.'),
      },
    );
  };

  const renderItem = ({ item }: { item: typeof EXPENSE_CATEGORIES[number] }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}>
          <Icon name={item.icon} size={18} color={item.color} />
        </View>
        <Text style={styles.categoryLabel}>{item.label}</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={amounts[item.key] ?? ''}
          onChangeText={text => handleChangeAmount(item.key, text)}
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          returnKeyType="done"
        />
        <Text style={styles.inputUnit}>원</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예산 설정</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Total Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>총 예산</Text>
        <Text style={styles.summaryAmount}>
          {totalBudget > 0
            ? `₩${totalBudget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
            : '미설정'}
        </Text>
      </View>

      <FlatList
        data={EXPENSE_CATEGORIES}
        keyExtractor={item => item.key}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyPrevious}>
          <Icon name="content-copy" size={16} color={colors.primary} />
          <Text style={styles.copyButtonText}>전월 복사</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, upsertBudget.isPending && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={upsertBudget.isPending}
        >
          <Text style={styles.saveButtonText}>
            {upsertBudget.isPending ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>
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
      paddingBottom: 16,
      backgroundColor: colors.surface,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 8,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    summaryLabel: {
      fontSize: 13,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    summaryAmount: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 8,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    categoryLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      minWidth: 120,
    },
    input: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
      flex: 1,
      padding: 0,
    },
    inputUnit: {
      fontSize: 13,
      color: colors.textTertiary,
      marginLeft: 4,
    },
    footer: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingBottom: 32,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    copyButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary,
    },
    saveButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
