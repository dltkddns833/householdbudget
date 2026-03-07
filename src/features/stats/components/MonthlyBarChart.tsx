import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { MonthlyDataPoint } from '../../../shared/types';

interface Props {
  monthlyData: MonthlyDataPoint[];
}

const BAR_WIDTH = 10;
const BAR_GAP = 2;
const COL_WIDTH = BAR_WIDTH * 2 + BAR_GAP + 12; // 두 막대 + 간격 + 여백
const CHART_HEIGHT = 120;

export const MonthlyBarChart: React.FC<Props> = ({ monthlyData }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const maxValue = useMemo(() => {
    const max = Math.max(...monthlyData.flatMap(d => [d.income, d.expense]));
    return max > 0 ? max : 1;
  }, [monthlyData]);

  return (
    <View>
      {/* 범례 */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={styles.legendText}>수입</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
          <Text style={styles.legendText}>지출</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {/* 막대 영역 */}
          <View style={styles.barsArea}>
            {monthlyData.map(d => {
              const incomeH = Math.max((d.income / maxValue) * CHART_HEIGHT, d.income > 0 ? 2 : 0);
              const expenseH = Math.max((d.expense / maxValue) * CHART_HEIGHT, d.expense > 0 ? 2 : 0);
              return (
                <View key={d.month} style={styles.colWrapper}>
                  <View style={styles.barsRow}>
                    {/* 수입 막대 */}
                    <View style={styles.barSlot}>
                      <View
                        style={[
                          styles.bar,
                          { height: incomeH, backgroundColor: colors.income },
                        ]}
                      />
                    </View>
                    {/* 지출 막대 */}
                    <View style={styles.barSlot}>
                      <View
                        style={[
                          styles.bar,
                          { height: expenseH, backgroundColor: colors.expense },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.monthLabel}>{d.month}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Text style={styles.unit}>단위: 만원</Text>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    legendRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 12,
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
    chartContainer: {
      paddingBottom: 4,
    },
    barsArea: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: CHART_HEIGHT + 24,
    },
    colWrapper: {
      alignItems: 'center',
      width: COL_WIDTH,
    },
    barsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: CHART_HEIGHT,
      gap: BAR_GAP,
    },
    barSlot: {
      width: BAR_WIDTH,
      height: CHART_HEIGHT,
      justifyContent: 'flex-end',
    },
    bar: {
      width: BAR_WIDTH,
      borderRadius: 3,
    },
    monthLabel: {
      fontSize: 11,
      color: colors.textTertiary,
      marginTop: 4,
    },
    unit: {
      fontSize: 11,
      color: colors.textTertiary,
      textAlign: 'right',
      marginTop: 4,
    },
  });
