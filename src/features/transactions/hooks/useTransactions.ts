import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import firestore from '@react-native-firebase/firestore';
import { Transaction, TransactionInput, MonthlySummary } from '../../../shared/types';
import { transactionService } from '../services/transactionService';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';

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

  // Monthly summary query
  const summaryQuery = useQuery<MonthlySummary | null>({
    queryKey: ['monthlySummary', familyId, month],
    queryFn: () => transactionService.getMonthlySummary(familyId!, month),
    enabled: !!familyId,
  });

  return {
    transactions: realtimeTransactions,
    summary: summaryQuery.data ?? null,
    isLoading: !isListening,
    refetchSummary: summaryQuery.refetch,
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
      oldYearMonth,
    }: {
      txId: string;
      input: TransactionInput;
      oldYearMonth: string;
    }) => transactionService.updateTransaction(family!.id, txId, input, oldYearMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ txId, yearMonth }: { txId: string; yearMonth: string }) =>
      transactionService.deleteTransaction(family!.id, txId, yearMonth),
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
