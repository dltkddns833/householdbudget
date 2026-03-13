import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { Card, MonthSelector, CurrencyText } from '../../../shared/components';
import { getCategoryByKey } from '../../../shared/constants/categories';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { useOverviewRange } from '../../home/hooks/useOverview';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { MemberExpenseSummary } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/currency';
import { useInsights } from '../hooks/useInsights';
import { InsightCard } from '../components/InsightCard';
import { YearlyStatsView } from '../components/YearlyStatsView';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;

interface Props {
  navigation: any;
}

export const StatsScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const { currentMonth, setCurrentMonth } = useUIStore();
  const { family } = useAuthStore();
  const { summary, transactions } = useTransactions(currentMonth);
  const rangeQuery = useOverviewRange(6);
  const insights = useInsights(currentMonth);
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Category ranking sorted by amount
  const categoryRanking = useMemo(() => {
    if (!summary?.categoryBreakdown) return [];
    return Object.entries(summary.categoryBreakdown)
      .map(([key, amount]) => ({
        key,
        amount,
        percentage:
          summary.totalExpense > 0 ? (amount / summary.totalExpense) * 100 : 0,
        category: getCategoryByKey(key),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [summary]);

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    const data = rangeQuery.data || [];
    if (data.length === 0) return null;
    return {
      labels: data.map(o => o.id.split('-')[1] + '월'),
      datasets: [{ data: data.map(o => (o.totalExpense || 0) / 10000) }],
    };
  }, [rangeQuery.data]);

  // 멤버별 지출 breakdown
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

    return Object.entries(breakdown)
      .map(([uid, amount]) => ({
        memberId: uid,
        memberName: uid === 'shared' ? '공동' : family.memberNames[uid] ?? uid,
        amount,
        percentage:
          expenseTotal > 0 ? Math.round((amount / expenseTotal) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [family, transactions, summary?.totalExpense]);

  // Daily totals
  const dailyData = useMemo(() => {
    if (!summary?.dailyTotals) return null;
    const daysInMonth = dayjs(currentMonth + '-01').daysInMonth();
    const labels: string[] = [];
    const data: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const key = String(d).padStart(2, '0');
      if (d % 5 === 1 || d === daysInMonth) {
        labels.push(String(d));
      } else {
        labels.push('');
      }
      data.push((summary.dailyTotals[key] || 0) / 10000);
    }
    return { labels, datasets: [{ data }] };
  }, [summary, currentMonth]);

  return (
    <ScrollView ref={scrollRef} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>통계</Text>
      </View>

      {/* 월간 / 연간 탭 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'monthly' && styles.tabActive]}
          onPress={() => setActiveTab('monthly')}
        >
          <Text style={[styles.tabText, activeTab === 'monthly' && styles.tabTextActive]}>
            월간
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'yearly' && styles.tabActive]}
          onPress={() => setActiveTab('yearly')}
        >
          <Text style={[styles.tabText, activeTab === 'yearly' && styles.tabTextActive]}>
            연간
          </Text>
        </TouchableOpacity>
      </View>

      {/* 연간 뷰 */}
      {activeTab === 'yearly' && (
        <YearlyStatsView year={selectedYear} onYearChange={setSelectedYear} />
      )}

      {/* 월간 뷰 */}
      {activeTab === 'monthly' && (
        <>
      <MonthSelector yearMonth={currentMonth} onChangeMonth={setCurrentMonth} />

      {/* 결산 리포트 버튼 */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => navigation.navigate('MonthlyReport')}
        activeOpacity={0.8}
      >
        <Icon name="summarize" size={18} color={colors.primary} />
        <Text style={styles.reportButtonText}>결산 리포트 보기</Text>
        <Icon name="chevron-right" size={18} color={colors.textTertiary} />
      </TouchableOpacity>

      <InsightCard insights={insights} />

      {/* Total Expense */}
      <Card>
        <Text style={styles.sectionLabel}>총 지출</Text>
        <CurrencyText
          amount={summary?.totalExpense ?? 0}
          style={styles.totalAmount}
        />
      </Card>

      {/* Category Breakdown */}
      <Card style={styles.categoryCard}>
        <Text style={styles.sectionTitle}>카테고리별 지출</Text>

        {/* Stacked bar */}
        <View style={styles.stackedBar}>
          {categoryRanking.map(item => (
            <View
              key={item.key}
              style={[
                styles.stackedSegment,
                {
                  flex: item.percentage,
                  backgroundColor: item.category?.color || colors.textTertiary,
                },
              ]}
            />
          ))}
        </View>

        {/* Ranking list */}
        {categoryRanking.map(item => (
            <TouchableOpacity
              key={item.key}
              style={styles.rankingRow}
              onPress={() =>
                navigation.navigate('CategoryDetail', {
                  category: item.key,
                  yearMonth: currentMonth,
                })
              }
            >
              <View style={styles.rankingLeft}>
                <View
                  style={[
                    styles.rankDot,
                    { backgroundColor: item.category?.color },
                  ]}
                />
                <Text style={styles.rankCategory}>{item.key}</Text>
              </View>
              <View style={styles.rankingRight}>
                <View style={styles.rankBarsColumn}>
                  <View style={styles.rankBarContainer}>
                    <View
                      style={[
                        styles.rankBar,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor:
                            item.category?.color || colors.textTertiary,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.rankAmountColumn}>
                  <Text style={styles.rankAmount}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
                <Text style={styles.rankPercent}>
                  {(item.percentage || 0).toFixed(1)}%
                </Text>
              </View>
            </TouchableOpacity>
        ))}
      </Card>

      {/* 멤버별 지출 breakdown */}
      {memberExpenses.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>멤버별 지출</Text>
          {memberExpenses.map(m => (
            <View key={m.memberId} style={styles.memberRow}>
              <Text style={styles.memberName}>{m.memberName}</Text>
              <View style={styles.memberBarBg}>
                <View
                  style={[
                    styles.memberBar,
                    {
                      width: `${m.percentage}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.memberPct}>{m.percentage}%</Text>
              <Text style={styles.memberAmount}>{formatCurrency(m.amount)}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* Monthly Trend */}
      {monthlyTrendData && (
        <Card>
          <Text style={styles.sectionTitle}>월별 소비 추이 (만원)</Text>
          <BarChart
            data={monthlyTrendData}
            width={screenWidth - 64}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: () => colors.textTertiary,
              barPercentage: 0.6,
              propsForBackgroundLines: {
                strokeDasharray: '5,5',
                stroke: colors.borderLight,
              },
            }}
            style={styles.chart}
          />
        </Card>
      )}

      {/* Daily Spending */}
      {dailyData && (
        <Card>
          <Text style={styles.sectionTitle}>일별 지출 (만원)</Text>
          <BarChart
            data={dailyData}
            width={screenWidth - 64}
            height={200}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              labelColor: () => colors.textTertiary,
              barPercentage: 0.3,
              propsForBackgroundLines: {
                strokeDasharray: '5,5',
                stroke: colors.borderLight,
              },
            }}
            style={styles.chart}
          />
        </Card>
      )}

      <View style={{ height: 100 }} />
        </>
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 4,
      marginHorizontal: 16,
      marginTop: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 10,
    },
    tabActive: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.primary,
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
    sectionLabel: {
      fontSize: 13,
      color: colors.textTertiary,
    },
    totalAmount: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginTop: 4,
    },
    categoryCard: {
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    stackedBar: {
      flexDirection: 'row',
      height: 12,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 16,
    },
    stackedSegment: {
      height: '100%',
    },
    rankingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    rankingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 60,
    },
    rankDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    rankCategory: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    rankingRight: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    rankBarsColumn: {
      flex: 1,
      gap: 4,
    },
    rankBarContainer: {
      height: 8,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    rankBar: {
      height: '100%',
      borderRadius: 4,
    },
    rankAmountColumn: {
      alignItems: 'flex-end',
      width: 90,
    },
    rankAmount: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'right',
    },
    rankBudgetText: {
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'right',
      marginTop: 2,
    },
    rankPercent: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textTertiary,
      width: 45,
      textAlign: 'right',
    },
    chart: {
      borderRadius: 12,
      marginLeft: -16,
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
      width: 44,
    },
    memberBarBg: {
      flex: 1,
      height: 10,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 5,
      overflow: 'hidden',
    },
    memberBar: {
      height: '100%',
      borderRadius: 5,
    },
    memberPct: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      width: 32,
      textAlign: 'right',
    },
    memberAmount: {
      fontSize: 12,
      color: colors.textSecondary,
      width: 86,
      textAlign: 'right',
    },
    reportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    reportButtonText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });
