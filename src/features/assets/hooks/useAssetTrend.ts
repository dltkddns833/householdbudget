import { useQuery } from '@tanstack/react-query';
import { assetService } from '../services/assetService';
import { useAuthStore } from '../../../store/authStore';
import { AssetTrendPoint } from '../../../shared/types';
import dayjs from 'dayjs';

export const getMonthsRange = (count: number): string[] => {
  const months: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    months.push(dayjs().subtract(i, 'month').format('YYYY-MM'));
  }
  return months;
};

export const useAssetTrend = (months: string[]) => {
  const { family } = useAuthStore();

  return useQuery<AssetTrendPoint[]>({
    queryKey: ['assetTrend', family?.id, months],
    queryFn: async () => {
      const statuses = await Promise.all(
        months.map(m => assetService.getFinancialStatus(family!.id, m)),
      );
      return months.map((yearMonth, i) => {
        const curr = statuses[i];
        const prev = i > 0 ? statuses[i - 1] : null;
        return {
          yearMonth,
          realAsset: curr?.realAssetTotal ?? 0,
          retirementFund: curr?.retirementTotal ?? 0,
          realAssetChange:
            prev != null
              ? (curr?.realAssetTotal ?? 0) - (prev?.realAssetTotal ?? 0)
              : null,
          retirementChange:
            prev != null
              ? (curr?.retirementTotal ?? 0) - (prev?.retirementTotal ?? 0)
              : null,
        };
      });
    },
    enabled: !!family?.id && months.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
