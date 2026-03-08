import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { Card, CurrencyText } from '../../../shared/components';
import { useAssetTrend, getMonthsRange } from '../hooks/useAssetTrend';
import { formatYearMonth } from '../../../shared/utils/date';

const screenWidth = Dimensions.get('window').width;

type Period = 6 | 12 | 24;

interface Props {
  navigation: any;
}

export const AssetTrendScreen: React.FC<Props> = ({ navigation }) => {
  const [period, setPeriod] = useState<Period>(6);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const months = useMemo(() => getMonthsRange(period), [period]);
  const trendQuery = useAssetTrend(months);
  const points = trendQuery.data ?? [];

  const step = useMemo(
    () => Math.max(1, Math.ceil(points.length / 7)),
    [points.length],
  );

  const realAssetChartData = useMemo(() => {
    if (points.length < 2) return null;
    const hasData = points.some(p => p.realAsset > 0);
    if (!hasData) return null;
    return {
      labels: points.map((p, i) =>
        i % step === 0 ? p.yearMonth.split('-')[1] + '월' : '',
      ),
      datasets: [
        {
          data: points.map(p => p.realAsset / 10000),
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [points, step]);

  const retirementChartData = useMemo(() => {
    if (points.length < 2) return null;
    const hasData = points.some(p => p.retirementFund > 0);
    if (!hasData) return null;
    return {
      labels: points.map((p, i) =>
        i % step === 0 ? p.yearMonth.split('-')[1] + '월' : '',
      ),
      datasets: [
        {
          data: points.map(p => p.retirementFund / 10000),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [points, step]);

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: () => colors.textTertiary,
    propsForDots: { r: '3', strokeWidth: '1.5', stroke: colors.primary },
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: colors.borderLight,
    },
  };

  const PERIOD_OPTIONS: { value: Period; label: string }[] = [
    { value: 6, label: '6개월' },
    { value: 12, label: '12개월' },
    { value: 24, label: '전체' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자산 추이</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* 기간 선택 */}
      <View style={styles.periodContainer}>
        {PERIOD_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.periodBtn, period === opt.value && styles.periodBtnActive]}
            onPress={() => setPeriod(opt.value)}
          >
            <Text
              style={[
                styles.periodText,
                period === opt.value && styles.periodTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 실자산 차트 */}
      {realAssetChartData ? (
        <Card>
          <Text style={styles.chartTitle}>실자산 추이 (만원)</Text>
          <LineChart
            data={realAssetChartData}
            width={screenWidth - 64}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots={points.length <= 12}
          />
        </Card>
      ) : null}

      {/* 은퇴자금 차트 */}
      {retirementChartData ? (
        <Card>
          <Text style={styles.chartTitle}>은퇴자금 추이 (만원)</Text>
          <LineChart
            data={retirementChartData}
            width={screenWidth - 64}
            height={180}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            }}
            bezier
            style={styles.chart}
            withDots={points.length <= 12}
          />
        </Card>
      ) : null}

      {/* 월별 변동 목록 */}
      {points.length > 0 && (
        <Card>
          <Text style={styles.sectionTitle}>월별 변동</Text>
          {[...points].reverse().map(point => (
            <View key={point.yearMonth} style={styles.changeRow}>
              <Text style={styles.monthLabel}>
                {formatYearMonth(point.yearMonth)}
              </Text>
              <View style={styles.changeValues}>
                <View style={styles.changeItem}>
                  <Text style={styles.changeCategory}>실자산</Text>
                  <CurrencyText
                    amount={point.realAsset}
                    short
                    style={styles.changeAmount}
                  />
                  {point.realAssetChange != null && (
                    <CurrencyText
                      amount={point.realAssetChange}
                      short
                      showSign
                      colorize
                      style={styles.changeDiff}
                    />
                  )}
                </View>
                <View style={styles.changeItem}>
                  <Text style={styles.changeCategory}>은퇴자금</Text>
                  <CurrencyText
                    amount={point.retirementFund}
                    short
                    style={styles.changeAmount}
                  />
                  {point.retirementChange != null && (
                    <CurrencyText
                      amount={point.retirementChange}
                      short
                      showSign
                      colorize
                      style={styles.changeDiff}
                    />
                  )}
                </View>
              </View>
            </View>
          ))}
        </Card>
      )}

      <View style={{ height: 60 }} />
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
    periodContainer: {
      flexDirection: 'row',
      margin: 16,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 10,
      padding: 3,
    },
    periodBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    periodBtnActive: {
      backgroundColor: colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    periodText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textTertiary,
    },
    periodTextActive: {
      color: colors.text,
    },
    chartTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    chart: {
      borderRadius: 12,
      marginLeft: -16,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    changeRow: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    monthLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    changeValues: {
      flexDirection: 'row',
    },
    changeItem: {
      flex: 1,
    },
    changeCategory: {
      fontSize: 11,
      color: colors.textTertiary,
      marginBottom: 2,
    },
    changeAmount: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    changeDiff: {
      fontSize: 12,
      marginTop: 2,
    },
  });
