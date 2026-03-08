import { useEffect } from 'react';
import { Platform } from 'react-native';
import { MonthlySummary } from '../../../shared/types';
import { saveWidgetData } from '../services/widgetService';

export const useWidgetSync = (
  yearMonth: string,
  summary: MonthlySummary | null | undefined,
): void => {
  useEffect(() => {
    if (Platform.OS !== 'android' || !summary) return;

    saveWidgetData({
      yearMonth,
      totalExpense: summary.totalExpense,
      totalIncome: summary.totalIncome,
      remaining: summary.remaining,
      updatedAt: new Date().toISOString(),
    });
  }, [yearMonth, summary]);
};
