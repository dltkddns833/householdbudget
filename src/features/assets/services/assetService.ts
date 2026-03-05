import firestore from '@react-native-firebase/firestore';
import { Account, FinancialStatus } from '../../../shared/types';

const statusCollection = (familyId: string) =>
  firestore().collection('families').doc(familyId).collection('financialStatus');

const accountsCollection = (familyId: string, yearMonth: string) =>
  statusCollection(familyId).doc(yearMonth).collection('accounts');

export const assetService = {
  async getFinancialStatus(familyId: string, yearMonth: string): Promise<FinancialStatus | null> {
    const doc = await statusCollection(familyId).doc(yearMonth).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as FinancialStatus;
  },

  async getAccounts(familyId: string, yearMonth: string): Promise<Account[]> {
    const snapshot = await accountsCollection(familyId, yearMonth)
      .orderBy('sortOrder')
      .get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Account[];
  },

  async updateAccountAmount(
    familyId: string,
    yearMonth: string,
    accountId: string,
    amount: number,
  ): Promise<void> {
    await accountsCollection(familyId, yearMonth).doc(accountId).update({ amount });
    await this.recalculateStatus(familyId, yearMonth);
  },

  async recalculateStatus(familyId: string, yearMonth: string): Promise<void> {
    const accounts = await this.getAccounts(familyId, yearMonth);
    const statusDoc = await statusCollection(familyId).doc(yearMonth).get();
    const currentData = statusDoc.data() || {};

    let realAssetTotal = 0;
    let retirementTotal = 0;

    accounts.forEach((acc) => {
      if (acc.section === 'realAsset') realAssetTotal += acc.amount;
      else if (acc.section === 'retirement') retirementTotal += acc.amount;
    });

    const leaseDeposit = currentData.leaseDeposit || 0;
    const leaseLoan = currentData.leaseLoan || 0;
    const leaseNet = leaseDeposit - leaseLoan;

    await statusCollection(familyId).doc(yearMonth).set(
      {
        realAssetTotal,
        realAssetWithLease: realAssetTotal + leaseNet,
        retirementTotal,
        leaseDeposit,
        leaseLoan,
        leaseNet,
      },
      { merge: true },
    );
  },

  async copyFromPreviousMonth(
    familyId: string,
    sourceYearMonth: string,
    targetYearMonth: string,
  ): Promise<void> {
    const accounts = await this.getAccounts(familyId, sourceYearMonth);
    const sourceStatus = await this.getFinancialStatus(familyId, sourceYearMonth);

    const batch = firestore().batch();

    // Copy accounts
    accounts.forEach((acc) => {
      const newRef = accountsCollection(familyId, targetYearMonth).doc();
      const { id, ...data } = acc;
      batch.set(newRef, data);
    });

    // Copy financial status
    if (sourceStatus) {
      const { id, ...data } = sourceStatus;
      batch.set(statusCollection(familyId).doc(targetYearMonth), data);
    }

    await batch.commit();
  },

  async addAccount(
    familyId: string,
    yearMonth: string,
    account: Omit<Account, 'id'>,
  ): Promise<string> {
    const ref = accountsCollection(familyId, yearMonth).doc();
    await ref.set(account);
    await this.recalculateStatus(familyId, yearMonth);
    return ref.id;
  },

  async deleteAccount(
    familyId: string,
    yearMonth: string,
    accountId: string,
  ): Promise<void> {
    await accountsCollection(familyId, yearMonth).doc(accountId).delete();
    await this.recalculateStatus(familyId, yearMonth);
  },
};
