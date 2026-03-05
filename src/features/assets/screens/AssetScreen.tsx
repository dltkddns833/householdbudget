import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../../shared/constants/colors';
import { MonthSelector, CurrencyText, Card, EmptyState } from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils/currency';
import { useFinancialStatus, useAccounts, useAutoInitMonth } from '../hooks/useAssets';
import { Account } from '../../../shared/types';

interface Props {
  navigation: any;
}

export const AssetScreen: React.FC<Props> = ({ navigation }) => {
  const [yearMonth, setYearMonth] = useState(
    new Date().toISOString().slice(0, 7), // "YYYY-MM"
  );
  const [tab, setTab] = useState<'realAsset' | 'retirement'>('realAsset');

  const statusQuery = useFinancialStatus(yearMonth);
  const accountsQuery = useAccounts(yearMonth);
  useAutoInitMonth(yearMonth);

  const status = statusQuery.data;
  const accounts = accountsQuery.data || [];

  const filteredAccounts = useMemo(
    () => accounts.filter((a) => a.section === tab),
    [accounts, tab],
  );

  // Group by owner -> accountType
  const sections = useMemo(() => {
    const grouped: Record<string, Account[]> = {};
    filteredAccounts.forEach((acc) => {
      const key = `${acc.owner} · ${acc.accountType}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(acc);
    });
    return Object.entries(grouped).map(([title, data]) => ({
      title,
      total: data.reduce((sum, a) => sum + a.amount, 0),
      data,
    }));
  }, [filteredAccounts]);

  const renderItem = ({ item: acc }: { item: Account }) => (
    <TouchableOpacity
      style={styles.accountRow}
      onPress={() => navigation.navigate('AssetEdit', { account: acc, yearMonth })}
    >
      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{acc.accountName}</Text>
        <Text style={styles.accountInstitution}>{acc.institution} · {acc.subType}</Text>
      </View>
      <CurrencyText amount={acc.amount} style={styles.accountAmount} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionTotal}>{formatCurrency(section.total)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>재무상태</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <MonthSelector yearMonth={yearMonth} onChangeMonth={setYearMonth} />

      {/* Summary Cards */}
      {status && (
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>실자산</Text>
            <CurrencyText amount={status.realAssetTotal} short style={styles.summaryValue} />
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>전세 포함</Text>
            <CurrencyText amount={status.realAssetWithLease} short style={styles.summaryValue} />
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>은퇴자금</Text>
            <CurrencyText amount={status.retirementTotal} short style={styles.summaryValue} />
          </Card>
        </View>
      )}

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === 'realAsset' && styles.tabActive]}
          onPress={() => setTab('realAsset')}
        >
          <Text style={[styles.tabText, tab === 'realAsset' && styles.tabTextActive]}>실자산</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'retirement' && styles.tabActive]}
          onPress={() => setTab('retirement')}
        >
          <Text style={[styles.tabText, tab === 'retirement' && styles.tabTextActive]}>은퇴자금</Text>
        </TouchableOpacity>
      </View>

      {/* Account List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="account-balance"
            title="계좌 정보가 없습니다"
            subtitle="데이터를 추가해주세요"
          />
        }
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerPlaceholder: {
    width: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  tabTextActive: {
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  sectionTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  accountInfo: {
    flex: 1,
    marginRight: 12,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  accountInstitution: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  accountAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: 40,
  },
});
