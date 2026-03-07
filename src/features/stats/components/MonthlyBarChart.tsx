import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { MonthlyDataPoint } from '../../../shared/types';

interface Props {
  monthlyData: MonthlyDataPoint[];
}

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 64;

export const MonthlyBarChart: React.FC<Props> = ({ monthlyData }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const labels = monthlyData.map(d => String(d.month));

  const incomeData = {
    labels,
    datasets: [{ data: monthlyData.map(d => d.income / 10000) }],
  };

  const expenseData = {
    labels,
    datasets: [{ data: monthlyData.map(d => d.expense / 10000) }],
  };

  const chartConfig = (color: string) => ({
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: () => color,
    labelColor: () => colors.textTertiary,
    propsForBackgroundLines: {
      strokeDasharray: '5,5',
      stroke: colors.borderLight,
    },
  });

  return (
    <View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendText}>수입 (만원)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendText}>지출 (만원)</Text>
        </View>
      </View>
      <BarChart
        data={incomeData}
        width={CHART_WIDTH}
        height={130}
        chartConfig={chartConfig(colors.income)}
        style={styles.chart}
        showValuesOnTopOfBars={false}
        withInnerLines={true}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
      />
      <BarChart
        data={expenseData}
        width={CHART_WIDTH}
        height={130}
        chartConfig={chartConfig(colors.expense)}
        style={styles.chart}
        showValuesOnTopOfBars={false}
        withInnerLines={true}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    legendRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    chart: {
      borderRadius: 8,
      marginLeft: -8,
      marginBottom: 4,
    },
  });
