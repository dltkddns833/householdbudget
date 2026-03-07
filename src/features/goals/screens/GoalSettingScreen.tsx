import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { formatCurrency } from '../../../shared/utils/currency';
import {
  useActiveGoal,
  useGoalProgress,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from '../hooks/useGoals';

interface Props {
  navigation: any;
}

export const GoalSettingScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const goalQuery = useActiveGoal();
  const progress = useGoalProgress();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();

  const activeGoal = goalQuery.data;
  const isEditing = !!activeGoal;

  const [title, setTitle] = useState('');
  const [amountText, setAmountText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 활성 목표 로드 시 폼 초기화
  useEffect(() => {
    if (activeGoal) {
      setTitle(activeGoal.title);
      setAmountText(String(activeGoal.targetAmount));
    }
  }, [activeGoal]);

  const targetAmount = parseInt(amountText.replace(/,/g, ''), 10);
  const isValid = title.trim().length > 0 && !isNaN(targetAmount) && targetAmount >= 1;

  const handleAmountChange = (text: string) => {
    // 숫자만 허용
    const numeric = text.replace(/[^0-9]/g, '');
    setAmountText(numeric);
  };

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('입력 오류', '목표명과 1원 이상의 금액을 입력해주세요.');
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing && activeGoal) {
        await updateMutation.mutateAsync({
          id: activeGoal.id,
          data: { title: title.trim(), targetAmount },
        });
      } else {
        await createMutation.mutateAsync({ title: title.trim(), targetAmount });
      }
      Alert.alert('저장 완료', '자산 목표가 저장됐습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('저장 실패', '저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!activeGoal) return;
    Alert.alert(
      '목표 삭제',
      '목표를 삭제하면 홈 화면의 진행률 카드가 사라져요. 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(activeGoal.id);
              navigation.goBack();
            } catch {
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>자산 목표 설정</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 현재 진행률 (활성 목표 있을 때) */}
        {progress && (
          <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressIcon}>🎯</Text>
              <Text style={[styles.progressTitle, { color: colors.text }]}>
                {progress.goal.title}
              </Text>
              {progress.isAchieved && (
                <View style={[styles.achievedBadge, { backgroundColor: colors.income }]}>
                  <Text style={styles.achievedBadgeText}>달성!</Text>
                </View>
              )}
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress.percentage}%`,
                    backgroundColor: progress.isAchieved ? colors.income : colors.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.progressFooter}>
              <Text style={[styles.progressCurrent, { color: colors.text }]}>
                {formatCurrency(progress.currentAmount)}원
              </Text>
              <Text style={[styles.progressPct, { color: colors.primary }]}>
                {progress.percentage.toFixed(1)}%
              </Text>
              <Text style={[styles.progressTarget, { color: colors.textTertiary }]}>
                / {formatCurrency(progress.goal.targetAmount)}원
              </Text>
            </View>
          </View>
        )}

        {/* 입력 폼 */}
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.formSectionTitle, { color: colors.textSecondary }]}>
            {isEditing ? '목표 수정' : '새 목표 설정'}
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>목표명</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
            value={title}
            onChangeText={text => setTitle(text.slice(0, 20))}
            placeholder="예: 1억 모으기, 전세 보증금"
            placeholderTextColor={colors.textTertiary}
            maxLength={20}
          />
          <Text style={[styles.charCount, { color: colors.textTertiary }]}>
            {title.length}/20
          </Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>목표 금액</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[
                styles.input,
                styles.amountInput,
                { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
              ]}
              value={amountText}
              onChangeText={handleAmountChange}
              placeholder="100000000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
            <Text style={[styles.amountUnit, { color: colors.textSecondary }]}>원</Text>
          </View>
          {amountText.length > 0 && !isNaN(targetAmount) && (
            <Text style={[styles.amountPreview, { color: colors.primary }]}>
              {formatCurrency(targetAmount)}원
            </Text>
          )}
        </View>

        {/* 버튼 */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary },
            (!isValid || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!isValid || isSaving}
        >
          <Text style={[styles.saveButtonText, { color: colors.white }]}>저장</Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={[styles.deleteButtonText, { color: colors.danger }]}>목표 삭제</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    scrollContent: {
      padding: 16,
      gap: 12,
    },
    progressCard: {
      borderRadius: 16,
      padding: 16,
    },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    progressIcon: {
      fontSize: 20,
    },
    progressTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '700',
    },
    achievedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    achievedBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    progressBarBg: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.surfaceSecondary,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressFooter: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    progressCurrent: {
      fontSize: 15,
      fontWeight: '700',
    },
    progressPct: {
      fontSize: 14,
      fontWeight: '700',
      marginLeft: 4,
    },
    progressTarget: {
      fontSize: 13,
    },
    formCard: {
      borderRadius: 16,
      padding: 20,
    },
    formSectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 4,
    },
    charCount: {
      fontSize: 12,
      textAlign: 'right',
      marginBottom: 16,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    amountInput: {
      flex: 1,
      marginBottom: 0,
    },
    amountUnit: {
      fontSize: 16,
      fontWeight: '600',
    },
    amountPreview: {
      fontSize: 13,
      fontWeight: '600',
      marginTop: 6,
    },
    saveButton: {
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 4,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },
    deleteButton: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    deleteButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });
