import { useQuery } from '@tanstack/react-query';
import { overviewService } from '../services/overviewService';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { getMonthRange } from '../../../shared/utils/date';
import { OverviewMonth } from '../../../shared/types';

export const useCurrentOverview = () => {
  const { family } = useAuthStore();
  const currentMonth = useUIStore((s) => s.currentMonth);

  return useQuery<OverviewMonth | null>({
    queryKey: ['overview', family?.id, currentMonth],
    queryFn: () => overviewService.getOverview(family!.id, currentMonth),
    enabled: !!family?.id,
  });
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
