import firestore from '@react-native-firebase/firestore';
import dayjs from 'dayjs';
import { RecurringTransaction } from '../../../shared/types';
import { transactionService } from '../../transactions/services/transactionService';

const col = (familyId: string) =>
  firestore().collection('families').doc(familyId).collection('recurringTransactions');

export const recurringService = {
  async getRecurringList(familyId: string): Promise<RecurringTransaction[]> {
    const snapshot = await col(familyId).orderBy('createdAt', 'asc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
    })) as RecurringTransaction[];
  },

  async createRecurring(
    familyId: string,
    data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'createdBy'>,
    uid: string,
  ): Promise<string> {
    const ref = col(familyId).doc();
    await ref.set({
      ...data,
      createdAt: firestore.Timestamp.now(),
      createdBy: uid,
    });
    return ref.id;
  },

  async updateRecurring(
    familyId: string,
    id: string,
    data: Partial<Omit<RecurringTransaction, 'id' | 'createdAt' | 'createdBy'>>,
  ): Promise<void> {
    await col(familyId).doc(id).update(data);
  },

  async deleteRecurring(familyId: string, id: string): Promise<void> {
    await col(familyId).doc(id).delete();
  },

  async getPendingRecurring(
    familyId: string,
    yearMonth: string,
  ): Promise<RecurringTransaction[]> {
    const snapshot = await col(familyId).where('isActive', '==', true).get();
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
      }) as RecurringTransaction)
      .filter(r => !r.lastAppliedYearMonth || r.lastAppliedYearMonth !== yearMonth);
  },

  async applyRecurring(
    familyId: string,
    recurring: RecurringTransaction,
    yearMonth: string,
    uid: string,
  ): Promise<void> {
    const daysInMonth = dayjs(yearMonth + '-01').daysInMonth();
    const day = Math.min(recurring.dayOfMonth, daysInMonth);
    const [year, month] = yearMonth.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    await transactionService.addTransaction(familyId, uid, {
      type: recurring.type,
      date,
      category: recurring.category,
      name: recurring.title,
      amount: recurring.amount,
      memo: '',
    });

    await col(familyId).doc(recurring.id).update({ lastAppliedYearMonth: yearMonth });
  },
};
