import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InsightMessage, MonthlySummary } from '../../../shared/types';
import { transactionService } from '../../transactions/services/transactionService';
import { useAuthStore } from '../../../store/authStore';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { getPrevMonth } from '../../../shared/utils/date';
import { generateInsights } from '../utils/insightGenerator';

export const useInsights = (yearMonth: string): InsightMessage[] => {
  const { family } = useAuthStore();
  const familyId = family?.id;
  const prevYearMonth = getPrevMonth(yearMonth);

  const { summary: currentSummary } = useTransactions(yearMonth);

  const prevQuery = useQuery<MonthlySummary | null>({
    queryKey: ['monthlySummary', familyId, prevYearMonth],
    queryFn: () => transactionService.getMonthlySummary(familyId!, prevYearMonth),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    if (!currentSummary) return [];
    return generateInsights(currentSummary, prevQuery.data ?? null);
  }, [currentSummary, prevQuery.data]);
};
