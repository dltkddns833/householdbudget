import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { formatCurrencyShort } from '../../../shared/utils/currency';
import { AssetGoalProgress } from '../../../shared/types';

interface Props {
  progress: AssetGoalProgress;
  onPress: () => void;
}

export const AssetGoalCard: React.FC<Props> = ({ progress, onPress }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!progress.isAchieved) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [progress.isAchieved]);

  const barColor = progress.isAchieved ? colors.income : colors.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.card,
          progress.isAchieved && { borderColor: colors.income, borderWidth: 1.5 },
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View style={styles.titleRow}>
          <Text style={styles.icon}>🎯</Text>
          <Text style={[styles.title, { color: colors.text }]}>{progress.goal.title}</Text>
          {progress.isAchieved && (
            <View style={[styles.achievedBadge, { backgroundColor: colors.income }]}>
              <Text style={styles.achievedText}>목표 달성!</Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>현재 자산</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrencyShort(progress.currentAmount)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>목표</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrencyShort(progress.goal.targetAmount)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
              {progress.isAchieved ? '초과 달성' : '남은 금액'}
            </Text>
            <Text style={[styles.statValue, { color: progress.isAchieved ? colors.income : colors.expense }]}>
              {formatCurrencyShort(Math.abs(progress.remaining))}
            </Text>
          </View>
        </View>

        <View style={styles.barRow}>
          <View style={[styles.barBg, { backgroundColor: colors.surfaceSecondary }]}>
            <View
              style={[
                styles.barFill,
                { width: `${progress.percentage}%`, backgroundColor: barColor },
              ]}
            />
          </View>
          <Text style={[styles.pctText, { color: barColor }]}>
            {progress.percentage.toFixed(0)}%
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      marginHorizontal: 16,
      marginTop: 4,
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 12,
    },
    icon: {
      fontSize: 18,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
    },
    achievedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    achievedText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    statsRow: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      fontSize: 12,
      marginBottom: 2,
    },
    statValue: {
      fontSize: 15,
      fontWeight: '700',
    },
    barRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    barBg: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 4,
    },
    pctText: {
      fontSize: 13,
      fontWeight: '700',
      width: 38,
      textAlign: 'right',
    },
  });
