import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const FAMILY_ID = 'cQYJThomJRZHuBjAGobH';
const YEAR_MONTH = '2026-03';

interface MonthlySummary {
  totalExpense: number;
  totalIncome: number;
  remaining: number;
  categoryBreakdown: Record<string, number>;
  dailyTotals: Record<string, number>;
}

async function main() {
  const txSnap = await db
    .collection('families').doc(FAMILY_ID)
    .collection('transactions')
    .where('yearMonth', '==', YEAR_MONTH)
    .get();

  let totalExpense = 0;
  let totalIncome = 0;
  const categoryBreakdown: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};

  txSnap.forEach((doc) => {
    const d = doc.data();
    if (d.type === 'expense') {
      totalExpense += d.amount;
      categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + d.amount;
      const day = String(d.date.toDate().getDate()).padStart(2, '0');
      dailyTotals[day] = (dailyTotals[day] || 0) + d.amount;
    } else if (d.type === 'income') {
      totalIncome += d.amount;
    }
  });

  const summary: MonthlySummary = {
    totalExpense,
    totalIncome,
    remaining: totalIncome - totalExpense,
    categoryBreakdown,
    dailyTotals,
  };

  console.log('재계산 결과:', JSON.stringify(summary, null, 2));

  await db
    .collection('families').doc(FAMILY_ID)
    .collection('monthlySummaries').doc(YEAR_MONTH)
    .set(summary);

  console.log(`✅ ${YEAR_MONTH} monthlySummary 업데이트 완료`);
}

main().catch(console.error).finally(() => process.exit());
