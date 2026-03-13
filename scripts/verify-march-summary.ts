import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const FAMILY_ID = 'cQYJThomJRZHuBjAGobH';
const YEAR_MONTH = '2026-03';

async function main() {
  // 1. monthlySummary 문서 조회
  const summaryDoc = await db
    .collection('families').doc(FAMILY_ID)
    .collection('monthlySummaries').doc(YEAR_MONTH)
    .get();

  console.log('=== monthlySummaries 문서 ===');
  if (summaryDoc.exists) {
    const s = summaryDoc.data()!;
    console.log(`totalExpense: ${s.totalExpense}`);
    console.log(`totalIncome: ${s.totalIncome}`);
    console.log(`remaining: ${s.remaining}`);
    console.log(`categoryBreakdown:`, JSON.stringify(s.categoryBreakdown, null, 2));
  } else {
    console.log('문서 없음');
  }

  // 2. 실제 거래 조회 및 수동 합산
  const txSnap = await db
    .collection('families').doc(FAMILY_ID)
    .collection('transactions')
    .where('yearMonth', '==', YEAR_MONTH)
    .get();

  let manualExpense = 0;
  let manualIncome = 0;
  const expenses: { name: string; amount: number; category: string; date: string }[] = [];
  const incomes: { name: string; amount: number; category: string; date: string }[] = [];

  txSnap.forEach((doc) => {
    const d = doc.data();
    const dateStr = d.date?.toDate?.()?.toISOString?.()?.slice(0, 10) ?? '?';
    if (d.type === 'expense') {
      manualExpense += d.amount;
      expenses.push({ name: d.name, amount: d.amount, category: d.category, date: dateStr });
    } else if (d.type === 'income') {
      manualIncome += d.amount;
      incomes.push({ name: d.name, amount: d.amount, category: d.category, date: dateStr });
    } else {
      console.log(`⚠️ 알 수 없는 type: "${d.type}" — name: ${d.name}, amount: ${d.amount}`);
    }
  });

  console.log('\n=== 수동 합산 결과 ===');
  console.log(`총 거래 수: ${txSnap.size}`);
  console.log(`지출 합계: ${manualExpense} (${expenses.length}건)`);
  console.log(`수입 합계: ${manualIncome} (${incomes.length}건)`);

  // 3. 비교
  if (summaryDoc.exists) {
    const s = summaryDoc.data()!;
    const expenseDiff = manualExpense - s.totalExpense;
    const incomeDiff = manualIncome - s.totalIncome;
    console.log('\n=== 차이 ===');
    console.log(`지출 차이: ${expenseDiff} (수동 ${manualExpense} - 저장 ${s.totalExpense})`);
    console.log(`수입 차이: ${incomeDiff} (수동 ${manualIncome} - 저장 ${s.totalIncome})`);
  }

  // 4. 지출 거래 상세 목록
  console.log('\n=== 지출 거래 목록 ===');
  expenses
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((tx) => {
      console.log(`${tx.date} | ${tx.category.padEnd(8)} | ${String(tx.amount).padStart(8)}원 | ${tx.name}`);
    });

  console.log('\n=== 수입 거래 목록 ===');
  incomes
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((tx) => {
      console.log(`${tx.date} | ${tx.category.padEnd(8)} | ${String(tx.amount).padStart(8)}원 | ${tx.name}`);
    });
}

main().catch(console.error).finally(() => process.exit());
