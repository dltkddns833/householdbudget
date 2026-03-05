import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../constants/colors';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<Props> = ({ icon, title, subtitle }) => (
  <View style={styles.container}>
    <Icon name={icon} size={64} color={COLORS.textTertiary} />
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 8,
    textAlign: 'center',
  },
});
