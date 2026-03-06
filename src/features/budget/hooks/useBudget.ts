import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MonthlyBudget, CategoryBudgetProgress } from '../../../shared/types';
import { budgetService } from '../services/budgetService';
import { useAuthStore } from '../../../store/authStore';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { EXPENSE_CATEGORIES } from '../../../shared/constants/categories';

export const useBudget = (yearMonth: string) => {
  const { family } = useAuthStore();
  const familyId = family?.id;

  return useQuery<MonthlyBudget | null>({
    queryKey: ['budget', familyId, yearMonth],
    queryFn: () => budgetService.getBudget(familyId!, yearMonth),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpsertBudget = () => {
  const { user, family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      yearMonth,
      categories,
    }: {
      yearMonth: string;
      categories: Record<string, number>;
    }) => budgetService.upsertBudget(family!.id, yearMonth, categories, user!.uid),
    onSuccess: (_data, { yearMonth }) => {
      queryClient.invalidateQueries({ queryKey: ['budget', family?.id, yearMonth] });
    },
  });
};

export const useBudgetProgress = (yearMonth: string): CategoryBudgetProgress[] => {
  const budgetQuery = useBudget(yearMonth);
  const { summary } = useTransactions(yearMonth);

  return useMemo(() => {
    const categories = budgetQuery.data?.categories ?? {};
    const breakdown = summary?.categoryBreakdown ?? {};

    return EXPENSE_CATEGORIES.map((cat): CategoryBudgetProgress | null => {
      const budgeted = categories[cat.key] ?? 0;
      const spent = breakdown[cat.key] ?? 0;

      // 지출도 없고 예산도 없는 카테고리는 제외
      if (budgeted === 0 && spent === 0) return null;

      const rate = budgeted > 0 ? (spent / budgeted) * 100 : -1;
      let status: CategoryBudgetProgress['status'] = 'unset';
      if (budgeted > 0) {
        if (rate >= 100) status = 'over';
        else if (rate >= 80) status = 'warning';
        else status = 'normal';
      }

      return {
        categoryKey: cat.key,
        label: cat.label,
        color: cat.color,
        icon: cat.icon,
        budgeted,
        spent,
        rate,
        status,
      };
    }).filter((item): item is CategoryBudgetProgress => item !== null);
  }, [budgetQuery.data, summary]);
};
