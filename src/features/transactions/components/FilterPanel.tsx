import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { TransactionFilter } from '../../../shared/types';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../../../shared/constants/categories';

interface Props {
  visible: boolean;
  filter: TransactionFilter;
  onApply: (filter: TransactionFilter) => void;
  onClose: () => void;
}

const TYPE_OPTIONS: { label: string; value: 'all' | 'expense' | 'income' }[] = [
  { label: '전체', value: 'all' },
  { label: '지출', value: 'expense' },
  { label: '수입', value: 'income' },
];

export const FilterPanel: React.FC<Props> = ({ visible, filter, onApply, onClose }) => {
  const { colors } = useTheme();

  const [localType, setLocalType] = useState<'all' | 'expense' | 'income'>(
    (filter.type as 'all' | 'expense' | 'income') || 'all',
  );
  const [localCategory, setLocalCategory] = useState<string>(filter.category || '');
  const [localAmountMin, setLocalAmountMin] = useState<string>(
    filter.amountMin != null ? String(filter.amountMin) : '',
  );
  const [localAmountMax, setLocalAmountMax] = useState<string>(
    filter.amountMax != null ? String(filter.amountMax) : '',
  );
  const [localDateFrom, setLocalDateFrom] = useState<string>(filter.dateFrom || '');
  const [localDateTo, setLocalDateTo] = useState<string>(filter.dateTo || '');

  // 패널이 열릴 때마다 현재 filter 값으로 동기화
  useEffect(() => {
    if (visible) {
      setLocalType((filter.type as 'all' | 'expense' | 'income') || 'all');
      setLocalCategory(filter.category || '');
      setLocalAmountMin(filter.amountMin != null ? String(filter.amountMin) : '');
      setLocalAmountMax(filter.amountMax != null ? String(filter.amountMax) : '');
      setLocalDateFrom(filter.dateFrom || '');
      setLocalDateTo(filter.dateTo || '');
    }
  }, [visible]);

  const handleApply = () => {
    const newFilter: TransactionFilter = {
      ...filter,
      type: localType,
      category: localCategory || undefined,
      amountMin: localAmountMin ? Number(localAmountMin) : undefined,
      amountMax: localAmountMax ? Number(localAmountMax) : undefined,
      dateFrom: localDateFrom || undefined,
      dateTo: localDateTo || undefined,
    };
    onApply(newFilter);
    onClose();
  };

  const handleReset = () => {
    setLocalType('all');
    setLocalCategory('');
    setLocalAmountMin('');
    setLocalAmountMax('');
    setLocalDateFrom('');
    setLocalDateTo('');
  };

  const categoryOptions =
    localType === 'income'
      ? INCOME_CATEGORIES
      : localType === 'expense'
      ? EXPENSE_CATEGORIES
      : [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        {/* 헤더 */}
        <View style={[styles.panelHeader, { borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>필터</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.panelBody}>
          {/* 유형 */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>유형</Text>
          <View style={styles.chipRow}>
            {TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
                  localType === opt.value && { borderColor: colors.primary, backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setLocalType(opt.value);
                  setLocalCategory('');
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    localType === opt.value && { color: colors.white },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 카테고리 */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>카테고리</Text>
          <View style={styles.categoryGrid}>
            <TouchableOpacity
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
                !localCategory && { borderColor: colors.primary, backgroundColor: colors.primary },
              ]}
              onPress={() => setLocalCategory('')}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.textSecondary },
                  !localCategory && { color: colors.white },
                ]}
              >
                전체
              </Text>
            </TouchableOpacity>
            {categoryOptions.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
                  localCategory === cat.key && { borderColor: cat.color, backgroundColor: cat.color },
                ]}
                onPress={() => setLocalCategory(localCategory === cat.key ? '' : cat.key)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    localCategory === cat.key && { color: colors.white },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 금액 범위 */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>금액</Text>
          <View style={styles.rangeRow}>
            <TextInput
              style={[
                styles.rangeInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="최소"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={localAmountMin}
              onChangeText={setLocalAmountMin}
            />
            <Text style={[styles.rangeSep, { color: colors.textTertiary }]}>~</Text>
            <TextInput
              style={[
                styles.rangeInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="최대"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={localAmountMax}
              onChangeText={setLocalAmountMax}
            />
            <Text style={[styles.rangeUnit, { color: colors.textTertiary }]}>원</Text>
          </View>

          {/* 날짜 범위 */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>날짜</Text>
          <View style={styles.rangeRow}>
            <TextInput
              style={[
                styles.rangeInput,
                styles.dateInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
              value={localDateFrom}
              onChangeText={setLocalDateFrom}
              maxLength={10}
            />
            <Text style={[styles.rangeSep, { color: colors.textTertiary }]}>~</Text>
            <TextInput
              style={[
                styles.rangeInput,
                styles.dateInput,
                {
                  color: colors.text,
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                },
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
              value={localDateTo}
              onChangeText={setLocalDateTo}
              maxLength={10}
            />
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={[styles.panelFooter, { borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.resetButton, { borderColor: colors.border }]}
            onPress={handleReset}
          >
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>초기화</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <Text style={[styles.applyText, { color: colors.white }]}>적용</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  panelBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 0,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  dateInput: {
    flex: 1.5,
  },
  rangeSep: {
    fontSize: 15,
    fontWeight: '500',
  },
  rangeUnit: {
    fontSize: 14,
  },
  panelFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
