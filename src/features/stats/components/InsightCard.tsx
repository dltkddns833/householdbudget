import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { InsightMessage, InsightType } from '../../../shared/types';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';

interface Props {
  insights: InsightMessage[];
}

const ICON: Record<InsightType, string> = {
  warning: 'trending-up',
  saving: 'trending-down',
  achievement: 'star',
  info: 'info-outline',
};

const LIGHT_BG: Record<InsightType, string> = {
  warning: '#FEF3C7',
  saving: '#D1FAE5',
  achievement: '#DBEAFE',
  info: '',
};

const DARK_BG: Record<InsightType, string> = {
  warning: '#451A03',
  saving: '#052E16',
  achievement: '#1E3A5F',
  info: '',
};

const ICON_COLOR: Record<InsightType, string> = {
  warning: '#D97706',
  saving: '#059669',
  achievement: '#2563EB',
  info: '',
};

export const InsightCard: React.FC<Props> = ({ insights }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (insights.length === 0) return null;

  return (
    <View style={styles.container}>
      {insights.map((item, index) => {
        const bg = isDark ? DARK_BG[item.type] : LIGHT_BG[item.type];
        const iconColor = ICON_COLOR[item.type] || colors.textSecondary;
        return (
          <View
            key={index}
            style={[
              styles.row,
              { backgroundColor: bg || colors.surfaceSecondary },
              index < insights.length - 1 && styles.rowBorder,
            ]}
          >
            <Icon name={ICON[item.type]} size={18} color={iconColor} style={styles.icon} />
            <Text style={[styles.message, { color: iconColor !== colors.textSecondary ? iconColor : colors.text }]}>
              {item.message}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 12,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.06)',
    },
    icon: {
      marginRight: 10,
    },
    message: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
  });
