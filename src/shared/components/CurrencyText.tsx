import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { formatCurrency, formatCurrencyShort } from '../utils/currency';
import { useTheme } from '../theme';

interface Props {
  amount: number;
  short?: boolean;
  style?: StyleProp<TextStyle>;
  showSign?: boolean;
  colorize?: boolean;
}

export const CurrencyText: React.FC<Props> = ({
  amount,
  short = false,
  style,
  showSign = false,
  colorize = false,
}) => {
  const { colors } = useTheme();
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formatted = short ? formatCurrencyShort(safeAmount) : formatCurrency(safeAmount);
  const display = showSign && amount > 0 ? `+${formatted}` : formatted;

  const colorStyle: TextStyle = colorize
    ? { color: amount > 0 ? colors.income : amount < 0 ? colors.expense : colors.textSecondary }
    : {};

  return <Text style={[style, colorStyle]}>{display}</Text>;
};
