import { useQuery } from '@tanstack/react-query';
import firestore from '@react-native-firebase/firestore';
import { YearlySummary, MonthlySummary } from '../../../shared/types';
import { useAuthStore } from '../../../store/authStore';
import { getCategoryByKey } from '../../../shared/constants/categories';

const fetchYearlySummary = async (
  familyId: string,
  year: number,
): Promise<YearlySummary> => {
  const snapshot = await firestore()
    .collection('families')
    .doc(familyId)
    .collection('monthlySummaries')
    .where('yearMonth', '>=', `${year}-01`)
    .where('yearMonth', '<=', `${year}-12`)
    .get();

  const summaryMap: Record<number, MonthlySummary> = {};
  snapshot.docs.forEach(doc => {
    const data = doc.data() as MonthlySummary;
    const month = parseInt(doc.id.split('-')[1], 10);
    summaryMap[month] = { ...data, id: doc.id };
  });

  // 1~12월 배열 생성 (없는 달 = 0)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const s = summaryMap[month];
    return {
      month,
      income: s?.totalIncome ?? 0,
      expense: s?.totalExpense ?? 0,
      saving: s?.remaining ?? 0,
    };
  });

  const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = monthlyData.reduce((sum, d) => sum + d.expense, 0);
  const totalSaving = totalIncome - totalExpense;
  const savingRate = totalIncome > 0 ? (totalSaving / totalIncome) * 100 : 0;

  // 카테고리별 연간 합산
  const categoryTotals: Record<string, number> = {};
  snapshot.docs.forEach(doc => {
    const breakdown = doc.data().categoryBreakdown as Record<string, number> | undefined;
    if (breakdown) {
      Object.entries(breakdown).forEach(([key, amount]) => {
        categoryTotals[key] = (categoryTotals[key] ?? 0) + amount;
      });
    }
  });

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      label: getCategoryByKey(category)?.label ?? category,
      amount,
    }));

  return { year, totalIncome, totalExpense, totalSaving, savingRate, monthlyData, topCategories };
};

export const useYearlySummary = (year: number) => {
  const { family } = useAuthStore();
  const familyId = family?.id;

  return useQuery<YearlySummary>({
    queryKey: ['yearly-summary', familyId, year],
    queryFn: () => fetchYearlySummary(familyId!, year),
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
  });
};
