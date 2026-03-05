import React, { useState } from 'react';
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
import { COLORS } from '../../../shared/constants/colors';
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
          <Icon name="arrow-back" size={24} color={COLORS.text} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    padding: 20,
  },
  accountInfo: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  accountName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  accountDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  currentAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textTertiary,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: 14,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
