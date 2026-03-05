import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../../../shared/constants/colors';
import { Card, CurrencyText, MonthSelector } from '../../../shared/components';
import { useCurrentOverview, useOverviewRange } from '../hooks/useOverview';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { useUIStore } from '../../../store/uiStore';
import { formatCurrencyShort } from '../../../shared/utils/currency';
import { formatYearMonth } from '../../../shared/utils/date';

const screenWidth = Dimensions.get('window').width;

export const HomeScreen: React.FC = () => {
  const { currentMonth, setCurrentMonth } = useUIStore();
  const overviewQuery = useCurrentOverview();
  const rangeQuery = useOverviewRange(7);
  const { summary } = useTransactions(currentMonth);
  const overview = overviewQuery.data;
  const overviewRange = rangeQuery.data || [];

  const validRange = overviewRange.filter((o) => typeof o.realAsset === 'number' && !isNaN(o.realAsset));
  const chartData = validRange.length > 1 ? {
    labels: validRange.map((o) => o.id.split('-')[1] + '월'),
    datasets: [{
      data: validRange.map((o) => (o.realAsset || 0) / 10000),
      color: () => COLORS.primary,
      strokeWidth: 2,
    }],
  } : null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={overviewQuery.isFetching}
          onRefresh={() => { overviewQuery.refetch(); rangeQuery.refetch(); }}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>우리집 가계부</Text>
      </View>

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
              <Text style={[
                styles.changeRate,
                { color: overview.realAssetChangeRate >= 0 ? COLORS.income : COLORS.expense },
              ]}>
                {(overview.realAssetChangeRate || 0) >= 0 ? '+' : ''}{(overview.realAssetChangeRate || 0).toFixed(2)}%
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
            amount={summary?.totalExpense ?? overview?.totalExpense ?? 0}
            short
            style={styles.metricValue}
          />
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

      {/* 6-Month Trend Chart */}
      {chartData && (
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>실자산 추이 (만원)</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.surface,
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: () => COLORS.textTertiary,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: COLORS.primary,
              },
              propsForBackgroundLines: {
                strokeDasharray: '5,5',
                stroke: COLORS.borderLight,
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
        {validRange.slice().reverse().map((o) => (
          <View key={o.id} style={styles.overviewRow}>
            <Text style={styles.overviewMonth}>{formatYearMonth(o.id)}</Text>
            <View style={styles.overviewValues}>
              <CurrencyText amount={o.realAsset} short style={styles.overviewAsset} />
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
  heroCard: {
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
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
    color: COLORS.white,
  },
  changeRate: {
    fontSize: 14,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
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
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  chartCard: {
    marginTop: 4,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
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
    borderBottomColor: COLORS.borderLight,
  },
  overviewMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  overviewValues: {
    alignItems: 'flex-end',
  },
  overviewAsset: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  overviewChange: {
    fontSize: 13,
    marginTop: 2,
  },
});
