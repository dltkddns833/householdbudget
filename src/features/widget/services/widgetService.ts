import { Platform, NativeModules } from 'react-native';
import { WidgetData } from '../../../shared/types';

const { WidgetDataModule } = NativeModules;

export const saveWidgetData = (data: WidgetData): void => {
  if (Platform.OS !== 'android' || !WidgetDataModule) return;

  WidgetDataModule.saveWidgetData({
    yearMonth: data.yearMonth,
    totalExpense: String(data.totalExpense),
    totalIncome: String(data.totalIncome),
    remaining: String(data.remaining),
    updatedAt: data.updatedAt,
  });
};
