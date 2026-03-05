import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { Card, MonthSelector, CurrencyText } from '../../../shared/components';
import { getCategoryByKey } from '../../../shared/constants/categories';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { useOverviewRange } from '../../home/hooks/useOverview';
import { useUIStore } from '../../../store/uiStore';
import { formatCurrency } from '../../../shared/utils/currency';
import dayjs from 'dayjs';

const screenWidth = Dimensions.get('window').width;

interface Props {
  navigation: any;
}

export const StatsScreen: React.FC<Props> = ({ navigation }) => {
  const { currentMonth, setCurrentMonth } = useUIStore();
  const { summary } = useTransactions(currentMonth);
  const rangeQuery = useOverviewRange(6);
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>통계</Text>
      </View>

      <MonthSelector yearMonth={currentMonth} onChangeMonth={setCurrentMonth} />

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
              <Text style={styles.rankAmount}>
                {formatCurrency(item.amount)}
              </Text>
              <Text style={styles.rankPercent}>
                {(item.percentage || 0).toFixed(1)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>

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
    </ScrollView>
  );
};

const createStyles = (colors: ThemeColors) =>
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
    sectionLabel: {
      fontSize: 13,
      color: colors.textTertiary,
    },
    totalAmount: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.expense,
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
    rankBarContainer: {
      flex: 1,
      height: 8,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    rankBar: {
      height: '100%',
      borderRadius: 4,
    },
    rankAmount: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      width: 90,
      textAlign: 'right',
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
  });
