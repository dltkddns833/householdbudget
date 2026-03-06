import firestore from '@react-native-firebase/firestore';
import dayjs from 'dayjs';
import { MonthlyBudget } from '../../../shared/types';

const budgetsCollection = (familyId: string) =>
  firestore().collection('families').doc(familyId).collection('budgets');

export const budgetService = {
  async getBudget(familyId: string, yearMonth: string): Promise<MonthlyBudget | null> {
    const doc = await budgetsCollection(familyId).doc(yearMonth).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      yearMonth: doc.id,
      categories: data.categories || {},
      updatedAt: data.updatedAt?.toDate() ?? new Date(),
      updatedBy: data.updatedBy ?? '',
    };
  },

  async upsertBudget(
    familyId: string,
    yearMonth: string,
    categories: Record<string, number>,
    uid: string,
  ): Promise<void> {
    await budgetsCollection(familyId).doc(yearMonth).set({
      categories,
      updatedAt: firestore.FieldValue.serverTimestamp(),
      updatedBy: uid,
    });
  },

  async getPreviousMonthBudget(familyId: string, yearMonth: string): Promise<MonthlyBudget | null> {
    const prevMonth = dayjs(yearMonth + '-01').subtract(1, 'month').format('YYYY-MM');
    return this.getBudget(familyId, prevMonth);
  },
};
