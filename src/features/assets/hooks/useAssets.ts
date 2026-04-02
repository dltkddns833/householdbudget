import { useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '../services/assetService';
import { useAuthStore } from '../../../store/authStore';
import { getPrevMonth } from '../../../shared/utils/date';
import { Account, FinancialStatus } from '../../../shared/types';

export const useFinancialStatus = (yearMonth: string) => {
  const { family } = useAuthStore();
  return useQuery<FinancialStatus | null>({
    queryKey: ['financialStatus', family?.id, yearMonth],
    queryFn: () => assetService.getFinancialStatus(family!.id, yearMonth),
    enabled: !!family?.id,
  });
};

export const useAccounts = (yearMonth: string) => {
  const { family } = useAuthStore();
  return useQuery<Account[]>({
    queryKey: ['accounts', family?.id, yearMonth],
    queryFn: () => assetService.getAccounts(family!.id, yearMonth),
    enabled: !!family?.id,
  });
};

export const useUpdateAccount = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      yearMonth,
      accountId,
      data,
    }: {
      yearMonth: string;
      accountId: string;
      data: Omit<Account, 'id'>;
    }) => assetService.updateAccount(family!.id, yearMonth, accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialStatus'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['overviewRange'] });
    },
  });
};

export const useUpdateAccountAmount = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      yearMonth,
      accountId,
      amount,
    }: {
      yearMonth: string;
      accountId: string;
      amount: number;
    }) => assetService.updateAccountAmount(family!.id, yearMonth, accountId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialStatus'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['overviewRange'] });
    },
  });
};

export const useAddAccount = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      yearMonth,
      account,
    }: {
      yearMonth: string;
      account: Omit<Account, 'id'>;
    }) => assetService.addAccount(family!.id, yearMonth, account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialStatus'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['overviewRange'] });
    },
  });
};

export const useDeleteAccount = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      yearMonth,
      accountId,
    }: {
      yearMonth: string;
      accountId: string;
    }) => assetService.deleteAccount(family!.id, yearMonth, accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialStatus'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['overviewRange'] });
    },
  });
};

export const useAutoInitMonth = (yearMonth: string) => {
  const statusQuery = useFinancialStatus(yearMonth);
  const copyMutation = useCopyFromPreviousMonth();
  const triedMonths = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (
      statusQuery.isFetched &&
      statusQuery.data === null &&
      !triedMonths.current.has(yearMonth) &&
      !copyMutation.isPending
    ) {
      triedMonths.current.add(yearMonth);
      copyMutation.mutate(
        {
          sourceYearMonth: getPrevMonth(yearMonth),
          targetYearMonth: yearMonth,
        },
        {
          onError: () => {
            triedMonths.current.delete(yearMonth);
          },
        },
      );
    }
  }, [yearMonth, statusQuery.isFetched, statusQuery.data, copyMutation]);

  const retryInit = useCallback(() => {
    triedMonths.current.delete(yearMonth);
    copyMutation.mutate(
      {
        sourceYearMonth: getPrevMonth(yearMonth),
        targetYearMonth: yearMonth,
      },
      {
        onError: () => {
          Alert.alert('오류', '이전 달 데이터를 불러오지 못했습니다.');
        },
      },
    );
  }, [yearMonth, copyMutation]);

  return { retryInit, isRetrying: copyMutation.isPending };
};

export const useCopyFromPreviousMonth = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceYearMonth,
      targetYearMonth,
    }: {
      sourceYearMonth: string;
      targetYearMonth: string;
    }) => assetService.copyFromPreviousMonth(family!.id, sourceYearMonth, targetYearMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialStatus'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['overviewRange'] });
    },
  });
};
