import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { formatInputNumber, parseInputNumber, formatCurrency } from '../../../shared/utils/currency';
import { useUpdateAccountAmount } from '../hooks/useAssets';

interface Props {
  navigation: any;
  route: any;
}

export const AssetEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { account, yearMonth } = route.params;
  const [amountText, setAmountText] = useState(formatInputNumber(String(account.amount)));
  const mutation = useUpdateAccountAmount();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSave = async () => {
    const amount = parseInputNumber(amountText);
    try {
      await mutation.mutateAsync({ yearMonth, accountId: account.id, amount });
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('오류', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>금액 수정</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.accountInfo}>
          <Text style={styles.accountName}>{account.accountName}</Text>
          <Text style={styles.accountDetail}>
            {account.owner} · {account.institution} · {account.subType}
          </Text>
          <Text style={styles.currentAmount}>
            현재: {formatCurrency(account.amount)}
          </Text>
        </View>

        <Text style={styles.label}>새 금액</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>₩</Text>
          <TextInput
            style={styles.amountInput}
            value={amountText}
            onChangeText={(t) => setAmountText(formatInputNumber(t))}
            keyboardType="numeric"
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, mutation.isPending && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={mutation.isPending}
        >
          <Text style={styles.saveButtonText}>
            {mutation.isPending ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    backBtn: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      padding: 20,
    },
    accountInfo: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
    },
    accountName: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    accountDetail: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    currentAmount: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textTertiary,
      marginTop: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 16,
    },
    currencyPrefix: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginRight: 4,
    },
    amountInput: {
      flex: 1,
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      paddingVertical: 14,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 28,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
