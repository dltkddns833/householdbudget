import firestore from '@react-native-firebase/firestore';
import { OverviewMonth, FinancialStatus, MonthlySummary } from '../../../shared/types';
import { getPrevMonth } from '../../../shared/utils/date';

const familyDoc = (familyId: string) =>
  firestore().collection('families').doc(familyId);

export const overviewService = {
  async getOverview(familyId: string, yearMonth: string): Promise<OverviewMonth | null> {
    const doc = await familyDoc(familyId)
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
    const doc = await familyDoc(familyId)
      .collection('financialStatus').doc(yearMonth)
      .get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as FinancialStatus;
  },

  async getMonthlySummary(familyId: string, yearMonth: string): Promise<MonthlySummary | null> {
    const doc = await familyDoc(familyId)
      .collection('monthlySummaries').doc(yearMonth)
      .get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as MonthlySummary;
  },

  async upsertOverview(familyId: string, yearMonth: string, data: Omit<OverviewMonth, 'id'>): Promise<void> {
    await familyDoc(familyId)
      .collection('overview').doc(yearMonth)
      .set(data, { merge: true });
  },

  async generateAndSaveOverview(familyId: string, yearMonth: string): Promise<OverviewMonth | null> {
    const [status, summary] = await Promise.all([
      this.getFinancialStatus(familyId, yearMonth),
      this.getMonthlySummary(familyId, yearMonth),
    ]);

    if (!status) return null;

    const prevMonth = getPrevMonth(yearMonth);
    const [prevStatus, prevSummary] = await Promise.all([
      this.getFinancialStatus(familyId, prevMonth),
      this.getMonthlySummary(familyId, prevMonth),
    ]);

    const realAsset = status.realAssetTotal;
    const prevRealAsset = prevStatus?.realAssetTotal ?? null;
    const realAssetChange = prevRealAsset != null ? realAsset - prevRealAsset : null;
    const realAssetChangeRate =
      realAssetChange != null && prevRealAsset && prevRealAsset !== 0
        ? (realAssetChange / prevRealAsset) * 100
        : null;

    const totalExpense = summary?.totalExpense ?? 0;
    const prevExpense = prevSummary?.totalExpense ?? null;
    const expenseChange =
      prevExpense != null && prevExpense !== 0
        ? ((totalExpense - prevExpense) / prevExpense) * 100
        : null;

    const overviewData: Omit<OverviewMonth, 'id'> = {
      realAsset,
      realAssetWithLease: status.realAssetWithLease,
      retirementFund: status.retirementTotal,
      realAssetChange,
      realAssetChangeRate,
      totalExpense,
      expenseChange,
    };

    await this.upsertOverview(familyId, yearMonth, overviewData);
    return { id: yearMonth, ...overviewData };
  },
};
