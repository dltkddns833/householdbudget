import firestore from '@react-native-firebase/firestore';
import { Transaction, TransactionInput, MonthlySummary } from '../../../shared/types';
import { getYearMonth, getDayOfMonth } from '../../../shared/utils/date';
import { storageService } from './storageService';

const txCollection = (familyId: string) =>
  firestore().collection('families').doc(familyId).collection('transactions');

const summaryCollection = (familyId: string) =>
  firestore().collection('families').doc(familyId).collection('monthlySummaries');

export const transactionService = {
  async addTransaction(
    familyId: string,
    uid: string,
    input: TransactionInput,
  ): Promise<string> {
    const yearMonth = getYearMonth(input.date);
    const ref = txCollection(familyId).doc();

    const txData = {
      type: input.type,
      date: firestore.Timestamp.fromDate(input.date),
      yearMonth,
      category: input.category,
      name: input.name,
      amount: input.amount,
      memo: input.memo || '',
      createdBy: uid,
    };

    await ref.set(txData);
    await this.recalculateMonthlySummary(familyId, yearMonth);
    return ref.id;
  },

  async updateTransaction(
    familyId: string,
    txId: string,
    input: TransactionInput,
    oldYearMonth: string,
  ): Promise<void> {
    const yearMonth = getYearMonth(input.date);

    await txCollection(familyId).doc(txId).update({
      type: input.type,
      date: firestore.Timestamp.fromDate(input.date),
      yearMonth,
      category: input.category,
      name: input.name,
      amount: input.amount,
      memo: input.memo || '',
    });

    await this.recalculateMonthlySummary(familyId, yearMonth);
    if (oldYearMonth !== yearMonth) {
      await this.recalculateMonthlySummary(familyId, oldYearMonth);
    }
  },

  async updateReceiptUrl(familyId: string, txId: string, url: string | null): Promise<void> {
    await txCollection(familyId).doc(txId).update({
      receiptUrl: url ?? firestore.FieldValue.delete(),
    });
  },

  async deleteTransaction(
    familyId: string,
    txId: string,
    yearMonth: string,
  ): Promise<void> {
    await storageService.deleteReceipt(familyId, txId);
    await txCollection(familyId).doc(txId).delete();
    await this.recalculateMonthlySummary(familyId, yearMonth);
  },

  getTransactionsQuery(familyId: string, yearMonth: string) {
    return txCollection(familyId)
      .where('yearMonth', '==', yearMonth);
  },

  async getTransactions(familyId: string, yearMonth: string): Promise<Transaction[]> {
    const snapshot = await this.getTransactionsQuery(familyId, yearMonth).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transaction[];
  },

  async getMonthlySummary(familyId: string, yearMonth: string): Promise<MonthlySummary | null> {
    const doc = await summaryCollection(familyId).doc(yearMonth).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as MonthlySummary;
  },

  async recalculateMonthlySummary(familyId: string, yearMonth: string): Promise<void> {
    const transactions = await this.getTransactions(familyId, yearMonth);

    let totalExpense = 0;
    let totalIncome = 0;
    const categoryBreakdown: Record<string, number> = {};
    const dailyTotals: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        totalExpense += tx.amount;
        categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
        const day = getDayOfMonth(tx.date.toDate());
        dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
      } else {
        totalIncome += tx.amount;
      }
    });

    await summaryCollection(familyId).doc(yearMonth).set({
      totalExpense,
      totalIncome,
      remaining: totalIncome - totalExpense,
      categoryBreakdown,
      dailyTotals,
    });
  },

  async getRecentNames(familyId: string, category: string): Promise<string[]> {
    const snapshot = await txCollection(familyId)
      .where('category', '==', category)
      .limit(50)
      .get();

    const names = new Set<string>();
    snapshot.docs.forEach((doc) => {
      const name = doc.data().name;
      if (name) names.add(name);
    });
    return Array.from(names).slice(0, 10);
  },
};
