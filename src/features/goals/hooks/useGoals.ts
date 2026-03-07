import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '../services/goalService';
import { useAuthStore } from '../../../store/authStore';
import { useCurrentOverview } from '../../home/hooks/useOverview';
import { AssetGoal, AssetGoalProgress } from '../../../shared/types';

export const useActiveGoal = () => {
  const { family } = useAuthStore();

  return useQuery<AssetGoal | null>({
    queryKey: ['goals', family?.id, 'active'],
    queryFn: () => goalService.getActiveGoal(family!.id),
    enabled: !!family?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGoalProgress = (): AssetGoalProgress | null => {
  const goalQuery = useActiveGoal();
  const overviewQuery = useCurrentOverview();

  return useMemo(() => {
    const goal = goalQuery.data;
    if (!goal) return null;

    const currentAmount = overviewQuery.data?.realAsset ?? 0;
    const remaining = goal.targetAmount - currentAmount;
    const percentage = Math.min((currentAmount / goal.targetAmount) * 100, 100);
    const isAchieved = currentAmount >= goal.targetAmount;

    return { goal, currentAmount, remaining, percentage, isAchieved };
  }, [goalQuery.data, overviewQuery.data]);
};

export const useCreateGoal = () => {
  const { family, user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; targetAmount: number }) =>
      goalService.createGoal(family!.id, data, user!.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', family?.id] });
    },
  });
};

export const useUpdateGoal = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; targetAmount?: number } }) =>
      goalService.updateGoal(family!.id, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', family?.id] });
    },
  });
};

export const useDeleteGoal = () => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.deleteGoal(family!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', family?.id] });
    },
  });
};
