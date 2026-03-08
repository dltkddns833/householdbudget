import React, { useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { Card, CurrencyText, MonthSelector } from '../../../shared/components';
import { useCurrentOverview, useOverviewRange } from '../hooks/useOverview';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { MemberExpenseSummary } from '../../../shared/types';
import { formatYearMonth } from '../../../shared/utils/date';
import { formatCurrency } from '../../../shared/utils/currency';
import { useBudget } from '../../budget/hooks/useBudget';
import { usePendingRecurring } from '../../recurring/hooks/useRecurring';
import { useSavingRate } from '../hooks/useSavingRate';
import { SavingRateCard } from '../components/SavingRateCard';
import { useGoalProgress } from '../../goals/hooks/useGoals';
import { AssetGoalCard } from '../components/AssetGoalCard';
import { useWidgetSync } from '../../widget/hooks/useWidgetSync';

const screenWidth = Dimensions.get('window').width;

interface Props {
  navigation: any;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const { currentMonth, setCurrentMonth } = useUIStore();
  const { family } = useAuthStore();
  const overviewQuery = useCurrentOverview();
  const rangeQuery = useOverviewRange(7);
  const { summary, transactions } = useTransactions(currentMonth);
  const budgetQuery = useBudget(currentMonth);
  const { data: pendingRecurring = [] } = usePendingRecurring(currentMonth);
  const savingRateSummary = useSavingRate(currentMonth);
  const goalProgress = useGoalProgress();
  const overview = overviewQuery.data;
  const overviewRange = rangeQuery.data || [];
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useWidgetSync(currentMonth, summary);

  const totalBudget = useMemo(() => {
    const cats = budgetQuery.data?.categories ?? {};
    return Object.values(cats).reduce((sum, v) => sum + v, 0);
  }, [budgetQuery.data]);

  // 멤버별 지출 요약 (가족 멤버 2명 이상일 때만)
  const memberExpenses = useMemo((): MemberExpenseSummary[] => {
    if (!family || family.members.length < 2) return [];
    const expenseTotal = summary?.totalExpense ?? 0;
    if (expenseTotal === 0) return [];

    const breakdown: Record<string, number> = {};
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const key = tx.memberId ?? 'shared';
        breakdown[key] = (breakdown[key] ?? 0) + tx.amount;
      });

    return Object.entries(breakdown).map(([uid, amount]) => ({
      memberId: uid,
      memberName:
        uid === 'shared' ? '공동' : family.memberNames[uid] ?? uid,
      amount,
      percentage: expenseTotal > 0 ? Math.round((amount / expenseTotal) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [family, transactions, summary?.totalExpense]);

  const totalExpense = summary?.totalExpense ?? overview?.totalExpense ?? 0;
  const budgetRate = totalBudget > 0 ? Math.min((totalExpense / totalBudget) * 100, 100) : 0;
  const budgetRateColor =
    budgetRate >= 100
      ? '#EF4444'
      : budgetRate >= 80
      ? '#F59E0B'
      : colors.primary;

  const validRange = overviewRange.filter(
    o => typeof o.realAsset === 'number' && !isNaN(o.realAsset),
  );
  const chartData =
    validRange.length > 1
      ? {
          labels: validRange.map(o => o.id.split('-')[1] + '월'),
          datasets: [
            {
              data: validRange.map(o => (o.realAsset || 0) / 10000),
              color: () => colors.primary,
              strokeWidth: 2,
            },
          ],
        }
      : null;

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={overviewQuery.isFetching}
          onRefresh={() => {
            overviewQuery.refetch();
            rangeQuery.refetch();
          }}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>우리집 가계부</Text>
      </View>

      {pendingRecurring.length > 0 && (
        <TouchableOpacity
          style={styles.recurringBanner}
          onPress={() => navigation.navigate('More', { screen: 'RecurringList' })}
          activeOpacity={0.8}
        >
          <Icon name="notifications-active" size={18} color="#D97706" />
          <Text style={styles.recurringBannerText}>
            {pendingRecurring.length === 1
              ? `${pendingRecurring[0].title} 고정비가 반영 안 됐어요`
              : `${pendingRecurring[0].title} 등 ${pendingRecurring.length}건의 고정비가 반영 안 됐어요`}
          </Text>
          <Text style={styles.recurringBannerAction}>확인하기</Text>
        </TouchableOpacity>
      )}

      <MonthSelector yearMonth={currentMonth} onChangeMonth={setCurrentMonth} />

      {/* Hero Card - Real Asset */}
      <Card style={styles.heroCard}>
        <Text style={styles.heroLabel}>실자산</Text>
        <CurrencyText
          amount={overview?.realAsset ?? 0}
          short
          style={styles.heroAmount}
        />
        {overview?.realAssetChange != null && (
          <View style={styles.changeRow}>
            <CurrencyText
              amount={overview.realAssetChange}
              short
              showSign
              colorize
              style={styles.changeAmount}
            />
            {overview.realAssetChangeRate != null && (
              <Text
                style={[
                  styles.changeRate,
                  {
                    color:
                      overview.realAssetChangeRate >= 0
                        ? colors.income
                        : colors.expense,
                  },
                ]}
              >
                {(overview.realAssetChangeRate || 0) >= 0 ? '+' : ''}
                {(overview.realAssetChangeRate || 0).toFixed(2)}%
              </Text>
            )}
          </View>
        )}
      </Card>

      {/* Sub Metrics */}
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>이번달 소비</Text>
          <CurrencyText
            amount={totalExpense}
            style={styles.metricValue}
          />
          {overview?.expenseChange != null && (
            <Text
              style={[
                styles.expenseCaption,
                {
                  color:
                    overview.expenseChange >= 0
                      ? colors.income
                      : colors.expense,
                },
              ]}
            >
              전월대비 {overview.expenseChange >= 0 ? '+' : ''}
              {overview.expenseChange.toFixed(1)}%
            </Text>
          )}
          {totalBudget > 0 && (
            <View style={styles.budgetBarWrapper}>
              <View style={styles.budgetBarBg}>
                <View
                  style={[
                    styles.budgetBarFill,
                    { width: `${budgetRate}%`, backgroundColor: budgetRateColor },
                  ]}
                />
              </View>
              <Text style={[styles.budgetBarLabel, { color: budgetRateColor }]}>
                {budgetRate.toFixed(0)}%
              </Text>
            </View>
          )}
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricLabel}>은퇴자금</Text>
          <CurrencyText
            amount={overview?.retirementFund ?? 0}
            short
            style={styles.metricValue}
          />
        </Card>
      </View>

      {/* 멤버별 지출 카드 */}
      {memberExpenses.length > 0 && (
        <Card style={styles.memberCard}>
          <Text style={styles.chartTitle}>멤버별 지출</Text>
          {memberExpenses.map(m => (
            <View key={m.memberId} style={styles.memberRow}>
              <Text style={styles.memberName}>{m.memberName}</Text>
              <View style={styles.memberBarBg}>
                <View
                  style={[
                    styles.memberBarFill,
                    { width: `${m.percentage}%`, backgroundColor: colors.primary },
                  ]}
                />
              </View>
              <Text style={styles.memberAmount}>{m.percentage}%</Text>
              <Text style={styles.memberAmountValue}>
                -{formatCurrency(m.amount)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {savingRateSummary && <SavingRateCard summary={savingRateSummary} />}

      {goalProgress && (
        <AssetGoalCard
          progress={goalProgress}
          onPress={() => navigation.navigate('More', { screen: 'GoalSetting' })}
        />
      )}

      {/* 6-Month Trend Chart */}
      {chartData && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>실자산 추이 (만원)</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: () => colors.textTertiary,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colors.primary,
              },
              propsForBackgroundLines: {
                strokeDasharray: '5,5',
                stroke: colors.borderLight,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card>
      )}

      {/* Monthly Overview List */}
      <Card style={styles.overviewListCard}>
        <Text style={styles.chartTitle}>월별 현황</Text>
        {validRange
          .slice()
          .reverse()
          .map(o => (
            <View key={o.id} style={styles.overviewRow}>
              <Text style={styles.overviewMonth}>{formatYearMonth(o.id)}</Text>
              <View style={styles.overviewValues}>
                <CurrencyText
                  amount={o.realAsset}
                  short
                  style={styles.overviewAsset}
                />
                {o.realAssetChange != null && (
                  <CurrencyText
                    amount={o.realAssetChange}
                    short
                    showSign
                    colorize
                    style={styles.overviewChange}
                  />
                )}
              </View>
            </View>
          ))}
      </Card>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
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
    recurringBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#451A03' : '#FFFBEB',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    recurringBannerText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: '#92400E',
    },
    recurringBannerAction: {
      fontSize: 13,
      fontWeight: '700',
      color: '#D97706',
    },
    heroCard: {
      backgroundColor: colors.surface,
      marginTop: 4,
    },
    heroLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textTertiary,
    },
    heroAmount: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      marginTop: 4,
    },
    changeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 8,
    },
    changeAmount: {
      fontSize: 15,
      fontWeight: '600',
    },
    changeRate: {
      fontSize: 14,
      fontWeight: '700',
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      overflow: 'hidden',
    },
    expenseCaption: {
      fontSize: 12,
      marginTop: 4,
    },
    budgetBarWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 6,
    },
    budgetBarBg: {
      flex: 1,
      height: 6,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 3,
      overflow: 'hidden',
    },
    budgetBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    budgetBarLabel: {
      fontSize: 11,
      fontWeight: '600',
      width: 32,
      textAlign: 'right',
    },
    metricsRow: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      gap: 0,
    },
    metricCard: {
      flex: 1,
      marginHorizontal: 6,
    },
    metricLabel: {
      fontSize: 13,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    memberCard: {
      marginTop: 4,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
    },
    memberName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      width: 40,
    },
    memberBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    memberBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    memberAmount: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      width: 30,
      textAlign: 'right',
    },
    memberAmountValue: {
      fontSize: 12,
      color: colors.textSecondary,
      width: 80,
      textAlign: 'right',
    },
    chartCard: {
      marginTop: 4,
    },
    chartTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    chart: {
      borderRadius: 12,
      marginLeft: -8,
    },
    overviewListCard: {
      marginTop: 4,
    },
    overviewRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    overviewMonth: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    overviewValues: {
      alignItems: 'flex-end',
    },
    overviewAsset: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    overviewChange: {
      fontSize: 13,
      marginTop: 2,
    },
  });
