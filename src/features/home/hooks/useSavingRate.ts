import { useMemo } from 'react';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { useAuthStore } from '../../../store/authStore';
import { SavingRateSummary } from '../../../shared/types';

export const useSavingRate = (yearMonth: string): SavingRateSummary | null => {
  const { summary } = useTransactions(yearMonth);
  const { family } = useAuthStore();

  return useMemo(() => {
    const totalIncome = summary?.totalIncome ?? 0;
    const totalExpense = summary?.totalExpense ?? 0;

    if (totalIncome === 0) return null;

    const savingAmount = totalIncome - totalExpense;
    const savingRate = Math.round((savingAmount / totalIncome) * 1000) / 10; // 소수점 1자리
    const goalRate = family?.savingRateGoal ?? 0;
    const isGoalAchieved = goalRate > 0 && savingRate >= goalRate;
    const status: SavingRateSummary['status'] =
      savingAmount > 0 ? 'positive' : savingAmount < 0 ? 'negative' : 'zero';

    return { savingRate, savingAmount, goalRate, isGoalAchieved, status };
  }, [summary, family?.savingRateGoal]);
};
