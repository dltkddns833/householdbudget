import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { MonthSelector, Card } from '../../../shared/components';
import { SpendingCalendar } from '../components/SpendingCalendar';
import { useTransactions } from '../hooks/useTransactions';
import { useUIStore } from '../../../store/uiStore';
import { getCategoryByKey } from '../../../shared/constants/categories';
import { formatCurrency } from '../../../shared/utils/currency';
import { Transaction } from '../../../shared/types';
import dayjs from 'dayjs';

interface Props {
  navigation: any;
}

export const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const { currentMonth, setCurrentMonth } = useUIStore();
  const { transactions, summary } = useTransactions(currentMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const dailyTotals = summary?.dailyTotals ?? {};

  const selectedTransactions = useMemo(() => {
    if (!selectedDay) return [];
    return transactions.filter(tx => {
      const txDate = tx.date.toDate().toISOString().split('T')[0];
      return txDate === selectedDay;
    });
  }, [transactions, selectedDay]);

  const dayExpenseTotal = useMemo(
    () =>
      selectedTransactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0),
    [selectedTransactions],
  );

  const KO_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const selectedDayLabel = selectedDay
    ? `${dayjs(selectedDay).format('M월 D일')} (${KO_DAYS[dayjs(selectedDay).day()]})`
    : '';

  const handleDayPress = (dateStr: string) => {
    setSelectedDay(prev => (prev === dateStr ? null : dateStr));
  };

  const renderTransaction = (tx: Transaction) => {
    const cat = getCategoryByKey(tx.category);
    return (
      <TouchableOpacity
        key={tx.id}
        style={styles.txRow}
        onPress={() => navigation.navigate('TransactionEdit', { transaction: tx })}
      >
        <View
          style={[styles.dot, { backgroundColor: cat?.color || colors.textTertiary }]}
        />
        <View style={styles.txInfo}>
          <Text style={styles.txName}>{tx.name}</Text>
          <Text style={styles.txCat}>{tx.category}</Text>
        </View>
        <Text
          style={[
            styles.txAmount,
            tx.type === 'income' && { color: colors.income },
          ]}
        >
          {tx.type === 'income' ? '+' : '-'}
          {formatCurrency(tx.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>소비 캘린더</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <MonthSelector yearMonth={currentMonth} onChangeMonth={setCurrentMonth} />

        <Card>
          <SpendingCalendar
            yearMonth={currentMonth}
            dailyTotals={dailyTotals}
            onDayPress={handleDayPress}
            selectedDay={selectedDay}
          />
        </Card>

        {/* 범례 */}
        <View style={styles.legend}>
          <Text style={styles.legendLabel}>적음</Text>
          {(['33', '77', 'BB'] as const).map(opacity => (
            <View
              key={opacity}
              style={[styles.legendDot, { backgroundColor: colors.primary + opacity }]}
            />
          ))}
          <Text style={styles.legendLabel}>많음</Text>
        </View>

        {/* 날짜별 거래 내역 (인라인) */}
        {selectedDay && (
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailDate}>{selectedDayLabel}</Text>
              {dayExpenseTotal > 0 && (
                <Text style={styles.detailTotal}>
                  -{formatCurrency(dayExpenseTotal)}
                </Text>
              )}
            </View>

            {selectedTransactions.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>거래 내역이 없습니다</Text>
              </View>
            ) : (
              <Card style={styles.txCard}>
                {selectedTransactions.map(renderTransaction)}
              </Card>
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
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
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 12,
      backgroundColor: colors.surface,
    },
    backBtn: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    scrollContent: {
      flexGrow: 1,
    },
    legend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    legendLabel: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    legendDot: {
      width: 18,
      height: 18,
      borderRadius: 4,
    },
    detailSection: {
      marginTop: 4,
    },
    detailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    detailDate: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    detailTotal: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.expense,
    },
    txCard: {
      paddingVertical: 0,
    },
    txRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    dot: {
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
    txCat: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 2,
    },
    txAmount: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.expense,
    },
    emptyBox: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textTertiary,
    },
  });
