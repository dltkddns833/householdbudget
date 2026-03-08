import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../../shared/theme';
import { ThemeColors } from '../../../shared/constants/colors';
import { MonthlyReportCard } from '../components/MonthlyReportCard';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { useBudgetProgress } from '../../budget/hooks/useBudget';
import { useInsights } from '../hooks/useInsights';
import { useUIStore } from '../../../store/uiStore';
import { formatYearMonth } from '../../../shared/utils/date';
import { formatCurrency } from '../../../shared/utils/currency';

interface Props {
  navigation: any;
}

export const MonthlyReportScreen: React.FC<Props> = ({ navigation }) => {
  const { currentMonth } = useUIStore();
  const { summary } = useTransactions(currentMonth);
  const budgetProgress = useBudgetProgress(currentMonth);
  const insights = useInsights(currentMonth);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleShare = async () => {
    if (!summary) return;
    const savingAmount = summary.totalIncome - summary.totalExpense;
    const savingRate =
      summary.totalIncome > 0
        ? Math.round((savingAmount / summary.totalIncome) * 100)
        : 0;

    const topCategories = Object.entries(summary.categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key, amount]) => `  · ${key}: ${formatCurrency(amount)}`)
      .join('\n');

    const text = [
      `📊 ${formatYearMonth(currentMonth)} 결산 리포트`,
      '',
      `수입: ${formatCurrency(summary.totalIncome)}`,
      `지출: ${formatCurrency(summary.totalExpense)}`,
      `저축: ${formatCurrency(savingAmount)} (저축률 ${savingRate}%)`,
      '',
      '지출 TOP 3',
      topCategories,
      '',
      '— 우리집 가계부',
    ].join('\n');

    await Share.share({ message: text });
  };

  if (!summary) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>결산 리포트</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {formatYearMonth(currentMonth)} 데이터가 없습니다
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>결산 리포트</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Icon name="share" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <MonthlyReportCard
          yearMonth={currentMonth}
          summary={summary}
          budgetProgress={budgetProgress}
          insights={insights}
        />

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share" size={20} color={colors.white} />
          <Text style={styles.shareButtonText}>공유하기</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
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
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 56,
      paddingBottom: 12,
      backgroundColor: colors.surface,
    },
    backBtn: {
      padding: 4,
    },
    shareBtn: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 15,
      color: colors.textTertiary,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      marginHorizontal: 16,
      marginTop: 4,
      borderRadius: 12,
      paddingVertical: 16,
    },
    shareButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
  });
