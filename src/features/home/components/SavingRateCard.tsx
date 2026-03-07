import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { Card } from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils/currency';
import { SavingRateSummary } from '../../../shared/types';

interface Props {
  summary: SavingRateSummary;
}

export const SavingRateCard: React.FC<Props> = ({ summary }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { savingRate, savingAmount, goalRate, isGoalAchieved, status } = summary;

  const rateColor =
    status === 'positive'
      ? colors.success
      : status === 'negative'
      ? colors.danger
      : colors.textTertiary;

  const gaugeProgress =
    goalRate > 0 ? Math.min(Math.max(savingRate / goalRate, 0), 1) : 0;
  const gaugeColor = isGoalAchieved ? colors.success : colors.primary;

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>이번달 저축률</Text>
      <View style={styles.rateRow}>
        <Text style={[styles.rateText, { color: rateColor }]}>
          {savingRate.toFixed(1)}%
        </Text>
        <Text style={styles.amountText}>{formatCurrency(savingAmount)}</Text>
      </View>

      {goalRate > 0 && (
        <View style={styles.gaugeSection}>
          <View style={styles.gaugeTrack}>
            <View
              style={[
                styles.gaugeFill,
                { width: `${gaugeProgress * 100}%`, backgroundColor: gaugeColor },
              ]}
            />
          </View>
          <Text style={[styles.gaugeCaption, { color: gaugeColor }]}>
            {isGoalAchieved
              ? '목표 달성!'
              : `목표까지 ${(goalRate - savingRate).toFixed(1)}%p 남음`}
          </Text>
        </View>
      )}
    </Card>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      marginTop: 4,
    },
    label: {
      fontSize: 13,
      color: colors.textTertiary,
      marginBottom: 6,
    },
    rateRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 10,
    },
    rateText: {
      fontSize: 24,
      fontWeight: '800',
    },
    amountText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    gaugeSection: {
      marginTop: 10,
      gap: 4,
    },
    gaugeTrack: {
      height: 6,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 3,
      overflow: 'hidden',
    },
    gaugeFill: {
      height: '100%',
      borderRadius: 3,
    },
    gaugeCaption: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
