import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../theme';
import { ThemeColors } from '../constants/colors';
import { formatYearMonth, getPrevMonth, getNextMonth, getCurrentYearMonth } from '../utils/date';

interface Props {
  yearMonth: string;
  onChangeMonth: (yearMonth: string) => void;
}

export const MonthSelector: React.FC<Props> = ({ yearMonth, onChangeMonth }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isCurrentMonth = yearMonth >= getCurrentYearMonth();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChangeMonth(getPrevMonth(yearMonth))} style={styles.button}>
        <Icon name="chevron-left" size={28} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.text}>{formatYearMonth(yearMonth)}</Text>
      <TouchableOpacity
        onPress={() => !isCurrentMonth && onChangeMonth(getNextMonth(yearMonth))}
        style={styles.button}
        disabled={isCurrentMonth}
      >
        <Icon name="chevron-right" size={28} color={isCurrentMonth ? colors.borderLight : colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },
    button: {
      padding: 8,
    },
    text: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginHorizontal: 16,
      minWidth: 120,
      textAlign: 'center',
    },
  });
