import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { formatCurrency } from '../../../shared/utils/currency';
import { formatYearMonth } from '../../../shared/utils/date';
import { MonthlySummary, InsightMessage } from '../../../shared/types';
import { getCategoryByKey } from '../../../shared/constants/categories';

interface Props {
  yearMonth: string;
  summary: MonthlySummary;
  insights: InsightMessage[];
}

export const MonthlyReportCard: React.FC<Props> = ({
  yearMonth,
  summary,
  insights,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const savingAmount = summary.totalIncome - summary.totalExpense;
  const savingRate =
    summary.totalIncome > 0
      ? Math.round((savingAmount / summary.totalIncome) * 100)
      : 0;

  const topCategories = useMemo(() => {
    return Object.entries(summary.categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key, amount]) => ({
        key,
        amount,
        category: getCategoryByKey(key),
        pct:
          summary.totalExpense > 0
            ? Math.round((amount / summary.totalExpense) * 100)
            : 0,
      }));
  }, [summary]);

  const firstInsight = insights.find(ins =>
    ['saving', 'warning', 'info', 'achievement'].includes(ins.type),
  );

  const insightColor =
    firstInsight?.type === 'saving' || firstInsight?.type === 'achievement'
      ? '#10B981'
      : firstInsight?.type === 'warning'
      ? '#F59E0B'
      : colors.textSecondary;

  return (
    <View style={styles.card}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.appName}>우리집 가계부</Text>
        <Text style={styles.yearMonth}>{formatYearMonth(yearMonth)} 결산</Text>
      </View>

      {/* 핵심 지표 */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>수입</Text>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>
            {formatCurrency(summary.totalIncome)}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>지출</Text>
          <Text style={[styles.metricValue, { color: '#EF4444' }]}>
            {formatCurrency(summary.totalExpense)}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>저축</Text>
          <Text
            style={[
              styles.metricValue,
              { color: savingAmount >= 0 ? '#10B981' : '#EF4444' },
            ]}
          >
            {savingAmount >= 0 ? '+' : ''}
            {formatCurrency(savingAmount)}
          </Text>
        </View>
      </View>

      {/* 저축률 */}
      <View style={styles.savingRateRow}>
        <Text style={styles.savingRateLabel}>저축률</Text>
        <Text
          style={[
            styles.savingRateValue,
            { color: savingRate >= 0 ? '#10B981' : '#EF4444' },
          ]}
        >
          {savingRate}%
        </Text>
      </View>

      {/* 카테고리별 지출 TOP 5 */}
      {topCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카테고리별 지출 TOP {topCategories.length}</Text>
          {topCategories.map(item => (
            <View key={item.key} style={styles.catRow}>
              <View
                style={[
                  styles.catDot,
                  { backgroundColor: item.category?.color || colors.textTertiary },
                ]}
              />
              <Text style={styles.catName}>{item.key}</Text>
              <View style={styles.catBarContainer}>
                <View
                  style={[
                    styles.catBar,
                    {
                      width: `${item.pct}%`,
                      backgroundColor: item.category?.color || colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.catAmount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.catPct}>{item.pct}%</Text>
            </View>
          ))}
        </View>
      )}

      {/* 인사이트 */}
      {firstInsight && (
        <View style={[styles.insightBox, { borderLeftColor: insightColor }]}>
          <Text style={[styles.insightText, { color: insightColor }]}>
            {firstInsight.message}
          </Text>
        </View>
      )}

      <Text style={styles.footer}>우리집 가계부 · {yearMonth}</Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      margin: 16,
    },
    header: {
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
      paddingBottom: 12,
    },
    appName: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: '700',
      marginBottom: 4,
    },
    yearMonth: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    metricsGrid: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    metricItem: {
      flex: 1,
      alignItems: 'center',
    },
    metricDivider: {
      width: 1,
      height: 36,
      backgroundColor: colors.borderLight,
    },
    metricLabel: {
      fontSize: 12,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    savingRateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginBottom: 16,
    },
    savingRateLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    savingRateValue: {
      fontSize: 18,
      fontWeight: '800',
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 10,
    },
    catRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 6,
    },
    catDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    catName: {
      fontSize: 12,
      color: colors.text,
      width: 52,
    },
    catBarContainer: {
      flex: 1,
      height: 6,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 3,
      overflow: 'hidden',
    },
    catBar: {
      height: '100%',
      borderRadius: 3,
    },
    catAmount: {
      fontSize: 11,
      color: colors.text,
      width: 72,
      textAlign: 'right',
    },
    catPct: {
      fontSize: 11,
      color: colors.textTertiary,
      width: 30,
      textAlign: 'right',
    },
    budgetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    budgetLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      width: 60,
    },
    budgetBarBg: {
      flex: 1,
      height: 8,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    budgetBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    budgetPct: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      width: 32,
      textAlign: 'right',
    },
    insightBox: {
      borderLeftWidth: 3,
      paddingLeft: 12,
      paddingVertical: 8,
      marginBottom: 16,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 6,
    },
    insightText: {
      fontSize: 13,
      fontWeight: '500',
      lineHeight: 18,
    },
    footer: {
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 4,
    },
  });
