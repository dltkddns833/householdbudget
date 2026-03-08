/**
 * #10 — monthlySummary 서버 계산
 * transactions onCreate/onUpdate/onDelete 시 monthlySummaries를 자동 갱신한다.
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { calculateSummary, TxData } from './recalculateSummary';

const db = admin.firestore();

async function recalculate(familyId: string, yearMonth: string): Promise<void> {
  const snapshot = await db
    .collection('families')
    .doc(familyId)
    .collection('transactions')
    .where('yearMonth', '==', yearMonth)
    .get();

  const transactions: TxData[] = snapshot.docs.map((doc) => doc.data() as TxData);
  const summary = calculateSummary(transactions);

  await db
    .collection('families')
    .doc(familyId)
    .collection('monthlySummaries')
    .doc(yearMonth)
    .set(summary);
}

export const onTransactionWrite = functions
  .region('asia-northeast3')
  .firestore.document('families/{familyId}/transactions/{txId}')
  .onWrite(async (change, context) => {
    const { familyId } = context.params;

    const beforeData = change.before.exists ? (change.before.data() as TxData) : null;
    const afterData = change.after.exists ? (change.after.data() as TxData) : null;

    const yearMonths = new Set<string>();
    if (beforeData?.yearMonth) yearMonths.add(beforeData.yearMonth);
    if (afterData?.yearMonth) yearMonths.add(afterData.yearMonth);

    await Promise.all([...yearMonths].map((ym) => recalculate(familyId, ym)));
  });
