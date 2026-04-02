import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { overviewService } from '../services/overviewService';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { getMonthRange } from '../../../shared/utils/date';
import { OverviewMonth } from '../../../shared/types';

export const useCurrentOverview = () => {
  const { family } = useAuthStore();
  const currentMonth = useUIStore((s) => s.currentMonth);

  const query = useQuery<OverviewMonth | null>({
    queryKey: ['overview', family?.id, currentMonth],
    queryFn: () => overviewService.getOverview(family!.id, currentMonth),
    enabled: !!family?.id,
  });

  useAutoGenerateOverview(currentMonth, query.isFetched, query.data);

  return query;
};

const useAutoGenerateOverview = (
  yearMonth: string,
  isFetched: boolean,
  data: OverviewMonth | null | undefined,
) => {
  const { family } = useAuthStore();
  const queryClient = useQueryClient();
  const triedMonths = useRef<Set<string>>(new Set());

  const generateMutation = useMutation({
    mutationFn: (ym: string) =>
      overviewService.generateAndSaveOverview(family!.id, ym),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['overviewRange'] });
    },
  });

  useEffect(() => {
    const needsGenerate = data === null || (data && data.realAsset == null);
    if (
      isFetched &&
      needsGenerate &&
      family?.id &&
      !triedMonths.current.has(yearMonth) &&
      !generateMutation.isPending
    ) {
      triedMonths.current.add(yearMonth);
      generateMutation.mutate(yearMonth, {
        onError: () => {
          triedMonths.current.delete(yearMonth);
        },
      });
    }
  }, [yearMonth, isFetched, data, family?.id, generateMutation]);
};

export const useOverviewRange = (count: number = 7) => {
  const { family } = useAuthStore();
  const currentMonth = useUIStore((s) => s.currentMonth);
  const months = getMonthRange(currentMonth, count);

  return useQuery<OverviewMonth[]>({
    queryKey: ['overviewRange', family?.id, currentMonth, count],
    queryFn: () => overviewService.getOverviewRange(family!.id, months),
    enabled: !!family?.id,
  });
};
