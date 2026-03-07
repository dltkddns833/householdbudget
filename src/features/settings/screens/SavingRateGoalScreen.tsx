import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../auth/services/authService';

interface Props {
  navigation: any;
}

export const SavingRateGoalScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { family, setFamily } = useAuthStore();

  const [input, setInput] = useState(
    family?.savingRateGoal != null ? String(family.savingRateGoal) : '',
  );
  const [isSaving, setIsSaving] = useState(false);

  const goalValue = parseInt(input, 10);
  const isValid = input === '' || (!isNaN(goalValue) && goalValue >= 0 && goalValue <= 100);

  const handleSave = async () => {
    if (!family) return;
    if (!isValid) {
      Alert.alert('입력 오류', '0~100 사이의 숫자를 입력해주세요.');
      return;
    }

    const goal = input === '' ? 0 : goalValue;

    setIsSaving(true);
    try {
      await authService.updateSavingRateGoal(family.id, goal);
      setFamily({ ...family, savingRateGoal: goal });
      navigation.goBack();
    } catch {
      Alert.alert('저장 실패', '저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>저축률 목표 설정</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>목표 저축률</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, !isValid && styles.inputError]}
            value={input}
            onChangeText={text => setInput(text.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="30"
            placeholderTextColor={colors.textTertiary}
          />
          <Text style={styles.unit}>%</Text>
        </View>
        <Text style={styles.hint}>
          {input === '' || goalValue === 0
            ? '0%는 목표 없음으로 설정됩니다'
            : `매달 수입의 ${goalValue}% 이상 저축하면 목표 달성!`}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, (!isValid || isSaving) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!isValid || isSaving}
      >
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
    </View>
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
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: colors.surface,
      gap: 8,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    content: {
      margin: 16,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 12,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    input: {
      width: 100,
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      paddingBottom: 4,
      textAlign: 'center',
    },
    inputError: {
      borderBottomColor: colors.danger,
    },
    unit: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    hint: {
      marginTop: 12,
      fontSize: 13,
      color: colors.textTertiary,
    },
    saveButton: {
      margin: 16,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.white,
    },
  });
