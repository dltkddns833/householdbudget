import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';
import { formatYearMonth, getPrevMonth, getNextMonth, getCurrentYearMonth } from '../utils/date';

interface Props {
  yearMonth: string;
  onChangeMonth: (yearMonth: string) => void;
}

export const MonthSelector: React.FC<Props> = ({ yearMonth, onChangeMonth }) => {
  const isCurrentMonth = yearMonth >= getCurrentYearMonth();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChangeMonth(getPrevMonth(yearMonth))} style={styles.button}>
        <Icon name="chevron-left" size={28} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.text}>{formatYearMonth(yearMonth)}</Text>
      <TouchableOpacity
        onPress={() => !isCurrentMonth && onChangeMonth(getNextMonth(yearMonth))}
        style={styles.button}
        disabled={isCurrentMonth}
      >
        <Icon name="chevron-right" size={28} color={isCurrentMonth ? COLORS.borderLight : COLORS.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: COLORS.text,
    marginHorizontal: 16,
    minWidth: 120,
    textAlign: 'center',
  },
});
