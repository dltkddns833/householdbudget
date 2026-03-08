import firestore from '@react-native-firebase/firestore';
import { Transaction, TransactionInput, MonthlySummary } from '../../../shared/types';
import { getYearMonth } from '../../../shared/utils/date';

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

    const data: Record<string, any> = {
      type: input.type,
      date: firestore.Timestamp.fromDate(input.date),
      yearMonth,
      category: input.category,
      name: input.name,
      amount: input.amount,
      memo: input.memo || '',
      createdBy: uid,
    };
    if (input.memberId) {
      data.memberId = input.memberId;
    }
    await ref.set(data);

    return ref.id;
  },

  async updateTransaction(
    familyId: string,
    txId: string,
    input: TransactionInput,
  ): Promise<void> {
    const yearMonth = getYearMonth(input.date);

    const updateData: Record<string, any> = {
      type: input.type,
      date: firestore.Timestamp.fromDate(input.date),
      yearMonth,
      category: input.category,
      name: input.name,
      amount: input.amount,
      memo: input.memo || '',
      memberId: input.memberId ?? firestore.FieldValue.delete(),
    };
    await txCollection(familyId).doc(txId).update(updateData);
  },

  async deleteTransaction(
    familyId: string,
    txId: string,
  ): Promise<void> {
    await txCollection(familyId).doc(txId).delete();
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
