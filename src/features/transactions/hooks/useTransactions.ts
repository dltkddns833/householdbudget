import { useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction, TransactionInput, MonthlySummary } from '../../../shared/types';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';

function computeSummary(month: string, transactions: Transaction[]): MonthlySummary {
  let totalExpense = 0;
  let totalIncome = 0;
  const categoryBreakdown: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      totalExpense += tx.amount;
      categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
      const day = String(tx.date?.toDate?.()?.getDate?.() ?? 0).padStart(2, '0');
      dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
    } else if (tx.type === 'income') {
      totalIncome += tx.amount;
    }
  }

  return {
    id: month,
    totalExpense,
    totalIncome,
    remaining: totalIncome - totalExpense,
    categoryBreakdown,
    dailyTotals,
  };
}

export const useTransactions = (yearMonth?: string) => {
  const { user, family } = useAuthStore();
  const currentMonth = useUIStore((s) => s.currentMonth);
  const month = yearMonth || currentMonth;
  const familyId = family?.id;

  const [realtimeTransactions, setRealtimeTransactions] = useState<Transaction[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Real-time listener for transactions
  useEffect(() => {
    if (!familyId) return;

    const unsubscribe = transactionService
      .getTransactionsQuery(familyId, month)
      .onSnapshot(
        (snapshot) => {
          const txs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[];
          txs.sort((a, b) => (b.date?.toDate?.()?.getTime?.() || 0) - (a.date?.toDate?.()?.getTime?.() || 0));
          setRealtimeTransactions(txs);
          setIsListening(true);
        },
        (error) => {
          console.error('Transaction listener error:', error);
          setIsListening(false);
        },
      );

    return () => unsubscribe();
  }, [familyId, month]);

  // Client-side summary computed from real-time transactions
  const summary = useMemo<MonthlySummary | null>(() => {
    if (!isListening) return null;
    return computeSummary(month, realtimeTransactions);
  }, [month, realtimeTransactions, isListening]);

  const refetchSummary = useCallback(() => {}, []);

  return {
    transactions: realtimeTransactions,
    summary,
    isLoading: !isListening,
    refetchSummary,
  };
};

export const useAddTransaction = () => {
  const { user, family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionInput) =>
      transactionService.addTransaction(family!.id, user!.uid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      txId,
      input,
    }: {
      txId: string;
      input: TransactionInput;
    }) => transactionService.updateTransaction(family!.id, txId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ txId }: { txId: string; yearMonth?: string }) =>
      transactionService.deleteTransaction(family!.id, txId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
    },
  });
};

export const useRecentNames = (category: string) => {
  const { family } = useAuthStore();

  return useQuery<string[]>({
    queryKey: ['recentNames', family?.id, category],
    queryFn: () => transactionService.getRecentNames(family!.id, category),
    enabled: !!family?.id && !!category,
  });
};
