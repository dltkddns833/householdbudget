import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import dayjs from 'dayjs';

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const shortAmount = (amount: number): string => {
  if (amount >= 100000000) return Math.round(amount / 100000000) + '억';
  if (amount >= 10000) return Math.round(amount / 10000) + '만';
  return amount.toLocaleString();
};

interface Props {
  yearMonth: string; // "YYYY-MM"
  dailyTotals: Record<string, number>; // "DD" -> 지출 합계
  onDayPress?: (dateStr: string) => void; // "YYYY-MM-DD"
  selectedDay?: string | null;
}

export const SpendingCalendar: React.FC<Props> = ({
  yearMonth,
  dailyTotals,
  onDayPress,
  selectedDay,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const today = dayjs();
  const monthStart = dayjs(yearMonth + '-01');
  const daysInMonth = monthStart.daysInMonth();
  const startDayOfWeek = monthStart.day(); // 0=일, 6=토

  const maxAmount = useMemo(() => {
    const vals = Object.values(dailyTotals);
    return vals.length > 0 ? Math.max(...vals, 1) : 1;
  }, [dailyTotals]);

  const getHeatColor = (amount: number): string => {
    if (!amount) return 'transparent';
    const ratio = amount / maxAmount;
    if (ratio <= 0.33) return colors.primary + '33';
    if (ratio <= 0.66) return colors.primary + '77';
    return colors.primary + 'BB';
  };

  // cells 배열: null = 빈 칸, number = 날짜
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // 7개씩 주(week) 단위로 분리
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const renderCell = (day: number | null, weekIdx: number, dayIdx: number) => {
    if (day === null) {
      return <View key={`empty-${weekIdx}-${dayIdx}`} style={styles.cell} />;
    }

    const dayKey = String(day).padStart(2, '0');
    const dateStr = `${yearMonth}-${dayKey}`;
    const amount = dailyTotals[dayKey] || 0;
    const dayjsDate = dayjs(dateStr);
    const isToday = dayjsDate.isSame(today, 'day');
    const isFuture = dayjsDate.isAfter(today, 'day');
    const isSelected = selectedDay === dateStr;

    return (
      <TouchableOpacity
        key={dayKey}
        style={[
          styles.cell,
          !isFuture && { backgroundColor: getHeatColor(amount) },
          isToday && [styles.todayBorder, { borderColor: colors.primary }],
          isSelected && { backgroundColor: colors.primary },
        ]}
        onPress={() => !isFuture && onDayPress?.(dateStr)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayNumber,
            isFuture && { color: colors.textTertiary },
            isToday && { color: colors.primary, fontWeight: '700' },
            isSelected && { color: colors.white },
          ]}
        >
          {day}
        </Text>
        {!isFuture && amount > 0 && (
          <Text
            style={[styles.amountText, isSelected && { color: colors.white }]}
            numberOfLines={1}
          >
            {shortAmount(amount)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 요일 헤더 */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map(d => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      {/* 주 단위 행 렌더링 — flex: 1 셀로 요일과 정확히 정렬 */}
      {weeks.map((week, weekIdx) => (
        <View key={weekIdx} style={styles.weekRow}>
          {week.map((day, dayIdx) => renderCell(day, weekIdx, dayIdx))}
        </View>
      ))}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 4,
    },
    weekRow: {
      flexDirection: 'row',
    },
    weekDay: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '600',
      color: colors.textTertiary,
      paddingVertical: 6,
    },
    cell: {
      flex: 1,
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      padding: 2,
    },
    todayBorder: {
      borderWidth: 1.5,
    },
    dayNumber: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    amountText: {
      fontSize: 9,
      color: colors.textSecondary,
      marginTop: 1,
    },
  });
