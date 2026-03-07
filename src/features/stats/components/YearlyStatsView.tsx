import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { Card, LoadingSpinner, EmptyState, CurrencyText } from '../../../shared/components';
import { getCategoryByKey } from '../../../shared/constants/categories';
import { useYearlySummary } from '../hooks/useYearlySummary';
import { MonthlyBarChart } from './MonthlyBarChart';
import dayjs from 'dayjs';

interface Props {
  year: number;
  onYearChange: (year: number) => void;
}

export const YearlyStatsView: React.FC<Props> = ({ year, onYearChange }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const currentYear = dayjs().year();
  const { data, isLoading } = useYearlySummary(year);

  if (isLoading) return <LoadingSpinner />;

  const isEmpty = !data || (data.totalIncome === 0 && data.totalExpense === 0);

  return (
    <View>
      {/* 연도 선택 헤더 */}
      <View style={styles.yearHeader}>
        <TouchableOpacity onPress={() => onYearChange(year - 1)} style={styles.yearButton}>
          <Icon name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}년</Text>
        <TouchableOpacity
          onPress={() => onYearChange(year + 1)}
          style={styles.yearButton}
          disabled={year >= currentYear}
        >
          <Icon
            name="chevron-right"
            size={28}
            color={year >= currentYear ? colors.textTertiary : colors.text}
          />
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <EmptyState icon="bar-chart" title="데이터가 없어요" subtitle="해당 연도에 기록된 거래가 없습니다" />
      ) : (
        <>
          {/* 요약 카드 3개 */}
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>총 수입</Text>
              <CurrencyText amount={data!.totalIncome} short style={[styles.summaryValue, { color: colors.income }]} />
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>총 지출</Text>
              <CurrencyText amount={data!.totalExpense} short style={[styles.summaryValue, { color: colors.expense }]} />
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>총 저축</Text>
              <CurrencyText amount={data!.totalSaving} short style={[styles.summaryValue, { color: data!.totalSaving >= 0 ? colors.primary : colors.danger }]} />
            </Card>
          </View>

          {/* 저축률 */}
          {data!.totalIncome > 0 && (
            <View style={styles.savingRateRow}>
              <Text style={styles.savingRateLabel}>연간 저축률</Text>
              <View style={[styles.savingRateBadge, { backgroundColor: colors.primary + '22' }]}>
                <Text style={[styles.savingRateValue, { color: colors.primary }]}>
                  {data!.savingRate.toFixed(1)}%
                </Text>
              </View>
            </View>
          )}

          {/* 월별 차트 */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>월별 수입 vs 지출</Text>
            <MonthlyBarChart monthlyData={data!.monthlyData} />
          </Card>

          {/* 카테고리 TOP 5 */}
          {data!.topCategories.length > 0 && (
            <Card>
              <Text style={styles.sectionTitle}>카테고리별 연간 지출 TOP {data!.topCategories.length}</Text>
              {data!.topCategories.map((item, index) => {
                const cat = getCategoryByKey(item.category);
                const maxAmount = data!.topCategories[0].amount;
                const ratio = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                return (
                  <View key={item.category} style={styles.categoryRow}>
                    <View style={[styles.categoryIcon, { backgroundColor: (cat?.color ?? '#A0A0A0') + '22' }]}>
                      <Icon name={cat?.icon ?? 'more-horiz'} size={16} color={cat?.color ?? '#A0A0A0'} />
                    </View>
                    <View style={styles.categoryContent}>
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryLabel}>{item.label}</Text>
                        <CurrencyText amount={item.amount} style={styles.categoryAmount} />
                      </View>
                      <View style={styles.progressBg}>
                        <View style={[styles.progressFill, { width: `${ratio}%`, backgroundColor: cat?.color ?? colors.primary }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </Card>
          )}
        </>
      )}
      <View style={{ height: 100 }} />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    yearHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },
    yearButton: {
      padding: 8,
    },
    yearText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      minWidth: 80,
      textAlign: 'center',
    },
    summaryRow: {
      flexDirection: 'row',
      paddingHorizontal: 10,
    },
    summaryCard: {
      flex: 1,
      marginHorizontal: 4,
      paddingHorizontal: 10,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: '700',
    },
    savingRateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    savingRateLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    savingRateBadge: {
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 20,
    },
    savingRateValue: {
      fontSize: 16,
      fontWeight: '800',
    },
    chartCard: {
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    categoryIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    categoryContent: {
      flex: 1,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    categoryAmount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    progressBg: {
      height: 6,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
    },
  });
