import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecurringTransaction } from '../../../shared/types';
import { recurringService } from '../services/recurringService';
import { useAuthStore } from '../../../store/authStore';

export const useRecurringList = () => {
  const { family } = useAuthStore();
  const familyId = family?.id;

  return useQuery<RecurringTransaction[]>({
    queryKey: ['recurring', familyId],
    queryFn: () => recurringService.getRecurringList(familyId!),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePendingRecurring = (yearMonth: string) => {
  const { family } = useAuthStore();
  const familyId = family?.id;

  return useQuery<RecurringTransaction[]>({
    queryKey: ['recurring-pending', familyId, yearMonth],
    queryFn: () => recurringService.getPendingRecurring(familyId!, yearMonth),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRecurring = () => {
  const { user, family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'createdBy'>) =>
      recurringService.createRecurring(family!.id, data, user!.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring', family?.id] });
    },
  });
};

export const useUpdateRecurring = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<RecurringTransaction, 'id' | 'createdAt' | 'createdBy'>>;
    }) => recurringService.updateRecurring(family!.id, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring', family?.id] });
    },
  });
};

export const useDeleteRecurring = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringService.deleteRecurring(family!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring', family?.id] });
    },
  });
};

export const useApplyRecurring = (yearMonth: string) => {
  const { user, family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recurring: RecurringTransaction) =>
      recurringService.applyRecurring(family!.id, recurring, yearMonth, user!.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['recurring-pending', family?.id, yearMonth],
      });
      queryClient.invalidateQueries({ queryKey: ['recurring', family?.id] });
      queryClient.invalidateQueries({ queryKey: ['monthlySummary'] });
    },
  });
};
