import React, { useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useScrollToTop } from '@react-navigation/native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import {
  MonthSelector,
  CurrencyText,
  Card,
  EmptyState,
} from '../../../shared/components';
import { getCategoryByKey } from '../../../shared/constants/categories';
import { formatCurrency } from '../../../shared/utils/currency';
import { formatDateWithDay } from '../../../shared/utils/date';
import {
  useTransactions,
  useDeleteTransaction,
} from '../hooks/useTransactions';
import { useTransactionFilter } from '../hooks/useTransactionFilter';
import { useUIStore } from '../../../store/uiStore';
import { Transaction } from '../../../shared/types';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';

interface Props {
  navigation: any;
}

export const TransactionListScreen: React.FC<Props> = ({ navigation }) => {
  const listRef = useRef<SectionList>(null);
  useScrollToTop(listRef);
  const { currentMonth, setCurrentMonth } = useUIStore();
  const { transactions, summary } = useTransactions(currentMonth);
  const deleteMutation = useDeleteTransaction();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [filterPanelVisible, setFilterPanelVisible] = useState(false);
  const { filter, setFilter, replaceFilter, resetFilter, filterTransactions, activeFilterCount } =
    useTransactionFilter();

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions),
    [filterTransactions, transactions],
  );

  // Group by date
  const sections = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(tx => {
      const dateKey = tx.date.toDate().toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(tx);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, data]) => ({
        title: formatDateWithDay(new Date(dateKey)),
        dayTotal: data
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
        data,
      }));
  }, [filteredTransactions]);

  const handleDelete = (tx: Transaction) => {
    Alert.alert('삭제', `"${tx.name}" 거래를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate({ txId: tx.id, yearMonth: tx.yearMonth }),
      },
    ]);
  };

  const renderItem = ({ item: tx }: { item: Transaction }) => {
    const cat = getCategoryByKey(tx.category);
    return (
      <TouchableOpacity
        style={styles.txRow}
        onPress={() =>
          navigation.navigate('TransactionEdit', { transaction: tx })
        }
        onLongPress={() => handleDelete(tx)}
      >
        <View
          style={[
            styles.categoryDot,
            { backgroundColor: cat?.color || colors.textTertiary },
          ]}
        />
        <View style={styles.txInfo}>
          <Text style={styles.txName}>{tx.name}</Text>
          <Text style={styles.txCategory}>
            {tx.category}
            {tx.memo ? ` · ${tx.memo}` : ''}
          </Text>
        </View>
        <Text style={styles.txAmount}>
          {tx.type === 'income' ? '+' : '-'}
          {formatCurrency(tx.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionDate}>{section.title}</Text>
      {section.dayTotal > 0 && (
        <Text style={styles.sectionTotal}>
          -{formatCurrency(section.dayTotal)}
        </Text>
      )}
    </View>
  );

  const isSearchMode = !!(filter.query);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내역</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Calendar')}
          style={styles.calendarBtn}
        >
          <Icon name="calendar-today" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!isSearchMode && (
        <MonthSelector yearMonth={currentMonth} onChangeMonth={setCurrentMonth} />
      )}

      <SearchBar
        value={filter.query || ''}
        onChangeText={text => setFilter({ query: text })}
        onClear={() => setFilter({ query: '' })}
        onFilterPress={() => setFilterPanelVisible(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Summary Card */}
      {summary && !isSearchMode && (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>지출</Text>
              <CurrencyText
                amount={summary.totalExpense}
                style={styles.summaryValue}
              />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>수입</Text>
              <CurrencyText
                amount={summary.totalIncome}
                style={styles.summaryValue}
              />
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>남은 금액</Text>
              <CurrencyText
                amount={summary.remaining}
                style={styles.summaryValue}
                colorize
              />
            </View>
          </View>
        </Card>
      )}

      {/* 활성 필터 표시 (검색 모드가 아닐 때 비query 필터 배지) */}
      {activeFilterCount > 0 && (
        <View style={[styles.activeFilterBar, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.activeFilterText, { color: colors.textSecondary }]}>
            필터 {activeFilterCount}개 적용 중 · {filteredTransactions.length}건
          </Text>
          <TouchableOpacity onPress={resetFilter}>
            <Text style={[styles.activeFilterReset, { color: colors.primary }]}>초기화</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transaction List */}
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          activeFilterCount > 0 ? (
            <EmptyState
              icon="search-off"
              title="검색 결과가 없어요"
              subtitle="다른 조건으로 검색해보세요"
            />
          ) : (
            <EmptyState
              icon="receipt-long"
              title="거래 내역이 없습니다"
              subtitle="+ 버튼을 눌러 거래를 추가하세요"
            />
          )
        }
        stickySectionHeadersEnabled={false}
      />

      <FilterPanel
        visible={filterPanelVisible}
        filter={filter}
        onApply={newFilter => replaceFilter({ ...newFilter, query: filter.query })}
        onClose={() => setFilterPanelVisible(false)}
      />
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
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: colors.surface,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    calendarBtn: {
      padding: 4,
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
      backgroundColor: colors.borderLight,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    activeFilterBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    activeFilterText: {
      fontSize: 13,
    },
    activeFilterReset: {
      fontSize: 13,
      fontWeight: '600',
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
      color: colors.textSecondary,
    },
    sectionTotal: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    txRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
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
      color: colors.text,
    },
    txCategory: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 2,
    },
    txAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
  });
