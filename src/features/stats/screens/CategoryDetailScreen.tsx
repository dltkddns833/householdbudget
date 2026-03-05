import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../shared/constants/colors';
import { CurrencyText } from '../../../shared/components';
import { getCategoryByKey } from '../../../shared/constants/categories';
import { formatCurrency } from '../../../shared/utils/currency';
import { formatDateWithDay } from '../../../shared/utils/date';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { Transaction } from '../../../shared/types';

interface Props {
  navigation: any;
  route: any;
}

export const CategoryDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { category: categoryKey, yearMonth } = route.params;
  const { transactions } = useTransactions(yearMonth);
  const cat = getCategoryByKey(categoryKey);

  const filtered = useMemo(
    () => transactions
      .filter((tx) => tx.category === categoryKey)
      .sort((a, b) => b.date.toDate().getTime() - a.date.toDate().getTime()),
    [transactions, categoryKey],
  );

  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  const renderItem = ({ item: tx }: { item: Transaction }) => (
    <View style={styles.txRow}>
      <View style={styles.txInfo}>
        <Text style={styles.txName}>{tx.name}</Text>
        <Text style={styles.txDate}>{formatDateWithDay(tx.date.toDate())}</Text>
      </View>
      <Text style={styles.txAmount}>{formatCurrency(tx.amount)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={[styles.headerDot, { backgroundColor: cat?.color }]} />
        <Text style={styles.headerTitle}>{categoryKey}</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>총 {filtered.length}건</Text>
        <CurrencyText amount={total} style={styles.totalAmount} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalCard: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.expense,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 40,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  txDate: {
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
