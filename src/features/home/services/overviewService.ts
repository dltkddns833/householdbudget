import firestore from '@react-native-firebase/firestore';
import { OverviewMonth, FinancialStatus } from '../../../shared/types';

export const overviewService = {
  async getOverview(familyId: string, yearMonth: string): Promise<OverviewMonth | null> {
    const doc = await firestore()
      .collection('families').doc(familyId)
      .collection('overview').doc(yearMonth)
      .get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as OverviewMonth;
  },

  async getOverviewRange(familyId: string, yearMonths: string[]): Promise<OverviewMonth[]> {
    const results: OverviewMonth[] = [];
    for (const ym of yearMonths) {
      const data = await this.getOverview(familyId, ym);
      if (data) results.push(data);
    }
    return results;
  },

  async getFinancialStatus(familyId: string, yearMonth: string): Promise<FinancialStatus | null> {
    const doc = await firestore()
      .collection('families').doc(familyId)
      .collection('financialStatus').doc(yearMonth)
      .get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as FinancialStatus;
  },

  async upsertOverview(familyId: string, yearMonth: string, data: Omit<OverviewMonth, 'id'>): Promise<void> {
    await firestore()
      .collection('families').doc(familyId)
      .collection('overview').doc(yearMonth)
      .set(data, { merge: true });
  },
};
