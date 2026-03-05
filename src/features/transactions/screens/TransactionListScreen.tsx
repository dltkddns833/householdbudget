import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../shared/constants/colors';
import { MonthSelector, CurrencyText, Card, EmptyState } from '../../../shared/components';
import { EXPENSE_CATEGORIES, getCategoryByKey } from '../../../shared/constants/categories';
import { formatCurrency } from '../../../shared/utils/currency';
import { formatDateWithDay, getYearMonth } from '../../../shared/utils/date';
import { useTransactions, useDeleteTransaction } from '../hooks/useTransactions';
import { useUIStore } from '../../../store/uiStore';
import { Transaction } from '../../../shared/types';

interface Props {
  navigation: any;
}

export const TransactionListScreen: React.FC<Props> = ({ navigation }) => {
  const { currentMonth, setCurrentMonth } = useUIStore();
  const { transactions, summary, isLoading } = useTransactions(currentMonth);
  const deleteMutation = useDeleteTransaction();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    if (!selectedCategory) return transactions;
    return transactions.filter((tx) => tx.category === selectedCategory);
  }, [transactions, selectedCategory]);

  // Group by date
  const sections = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date.toDate().toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(tx);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, data]) => ({
        title: formatDateWithDay(new Date(dateKey)),
        dayTotal: data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        data,
      }));
  }, [filteredTransactions]);

  const handleDelete = (tx: Transaction) => {
    Alert.alert('삭제', `"${tx.name}" 거래를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteMutation.mutate({ txId: tx.id, yearMonth: tx.yearMonth }),
      },
    ]);
  };

  const renderItem = ({ item: tx }: { item: Transaction }) => {
    const cat = getCategoryByKey(tx.category);
    return (
      <TouchableOpacity
        style={styles.txRow}
        onPress={() => navigation.navigate('TransactionEdit', { transaction: tx })}
        onLongPress={() => handleDelete(tx)}
      >
        <View style={[styles.categoryDot, { backgroundColor: cat?.color || COLORS.textTertiary }]} />
        <View style={styles.txInfo}>
          <Text style={styles.txName}>{tx.name}</Text>
          <Text style={styles.txCategory}>{tx.category}{tx.memo ? ` · ${tx.memo}` : ''}</Text>
        </View>
        <Text style={[styles.txAmount, tx.type === 'income' && { color: COLORS.income }]}>
          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionDate}>{section.title}</Text>
      {section.dayTotal > 0 && (
        <Text style={styles.sectionTotal}>-{formatCurrency(section.dayTotal)}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내역</Text>
      </View>

      <MonthSelector yearMonth={currentMonth} onChangeMonth={setCurrentMonth} />

      {/* Summary Card */}
      {summary && (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>지출</Text>
              <CurrencyText amount={summary.totalExpense} style={[styles.summaryValue, { color: COLORS.expense }]} />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>수입</Text>
              <CurrencyText amount={summary.totalIncome} style={[styles.summaryValue, { color: COLORS.income }]} />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>남은 금액</Text>
              <CurrencyText amount={summary.remaining} style={styles.summaryValue} colorize />
            </View>
          </View>
        </Card>
      )}

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>전체</Text>
        </TouchableOpacity>
        {EXPENSE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.filterChip,
              selectedCategory === cat.key && { backgroundColor: cat.color, borderColor: cat.color },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
          >
            <Text style={[styles.filterText, selectedCategory === cat.key && { color: COLORS.white }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState icon="receipt-long" title="거래 내역이 없습니다" subtitle="+ 버튼을 눌러 거래를 추가하세요" />
        }
        stickySectionHeadersEnabled={false}
      />
    </View>
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
  summaryCard: {
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.borderLight,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sectionTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.expense,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  txCategory: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
});
