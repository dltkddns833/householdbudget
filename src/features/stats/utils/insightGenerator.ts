import { MonthlySummary, InsightMessage, InsightType } from '../../../shared/types';
import { formatCurrencyShort } from '../../../shared/utils/currency';
import { getCategoryByKey } from '../../../shared/constants/categories';

const PRIORITY: Record<InsightType, number> = {
  warning: 0,
  achievement: 1,
  saving: 2,
  info: 3,
};

export function generateInsights(
  current: MonthlySummary,
  prev: MonthlySummary | null,
): InsightMessage[] {
  // 전월 데이터 없으면 단순 이번달 요약 1개
  if (!prev) {
    const { totalIncome, totalExpense, remaining } = current;
    if (totalIncome === 0 && totalExpense === 0) return [];
    if (remaining >= 0) {
      return [{ type: 'info', message: `이번달 ${formatCurrencyShort(totalExpense)} 지출, ${formatCurrencyShort(remaining)} 저축했어요` }];
    }
    return [{ type: 'warning', message: `이번달 ${formatCurrencyShort(totalExpense)} 지출했어요` }];
  }

  const insights: InsightMessage[] = [];
  const { totalExpense, totalIncome, remaining, categoryBreakdown } = current;
  const prevBreakdown = prev.categoryBreakdown ?? {};

  // 총 지출 비교
  if (prev.totalExpense > 0) {
    const diff = totalExpense - prev.totalExpense;
    if (diff > 10000) {
      insights.push({
        type: 'warning',
        message: `지난달보다 ${formatCurrencyShort(diff)} 더 지출했어요`,
      });
    } else if (diff < 0) {
      insights.push({
        type: 'saving',
        message: `지난달보다 ${formatCurrencyShort(Math.abs(diff))} 절약했어요!`,
      });
    }
  }

  // 카테고리 지출 급증 (50%↑ & 30,000원↑) — 가장 많이 급증한 1개만
  let maxCategoryDiff = 0;
  let maxCategoryInsight: InsightMessage | null = null;
  for (const [key, amount] of Object.entries(categoryBreakdown)) {
    const prevAmount = prevBreakdown[key] ?? 0;
    if (prevAmount > 0) {
      const diff = amount - prevAmount;
      const rate = diff / prevAmount;
      if (rate >= 0.5 && diff >= 30000 && diff > maxCategoryDiff) {
        maxCategoryDiff = diff;
        const label = getCategoryByKey(key)?.label ?? key;
        maxCategoryInsight = {
          type: 'warning',
          message: `이번달 ${label}가 지난달보다 ${formatCurrencyShort(diff)} 늘었어요`,
        };
      }
    }
  }
  if (maxCategoryInsight) insights.push(maxCategoryInsight);

  // 저축액 음수
  if (remaining < 0) {
    insights.push({
      type: 'warning',
      message: `이번달 지출이 수입을 ${formatCurrencyShort(Math.abs(remaining))} 초과했어요`,
    });
  }

  // 저축률 20% 이상
  if (totalIncome > 0) {
    const savingRate = (remaining / totalIncome) * 100;
    if (savingRate >= 20) {
      insights.push({
        type: 'achievement',
        message: `이번달 저축률 ${Math.floor(savingRate)}%를 달성했어요!`,
      });
    }
  }

  // 저축액 양수
  if (remaining > 0) {
    insights.push({
      type: 'info',
      message: `이번달 ${formatCurrencyShort(remaining)}을 모았어요`,
    });
  }

  // 우선순위 정렬 후 상위 3개
  return insights
    .sort((a, b) => PRIORITY[a.type] - PRIORITY[b.type])
    .slice(0, 3);
}
