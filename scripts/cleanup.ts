import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const FAMILY_ID = 'cQYJThomJRZHuBjAGobH';

async function main() {
  const txRef = db.collection('families').doc(FAMILY_ID).collection('transactions');

  // Query all March transactions
  const marchSnap = await txRef.where('yearMonth', '==', '2026-03').get();
  console.log(`Total March transactions: ${marchSnap.size}`);

  const toDelete: admin.firestore.DocumentReference[] = [];
  const toKeep: any[] = [];

  marchSnap.forEach((doc) => {
    const d = doc.data();
    const date = d.date.toDate();
    const month = date.getMonth() + 1; // 0-indexed

    if (month === 2) {
      // February date in March yearMonth → delete
      toDelete.push(doc.ref);
      console.log(`  DELETE: ${date.toISOString().slice(0,10)} ${d.category} ${d.name} ${d.amount}`);
    } else {
      toKeep.push({ date: date.toISOString().slice(0,10), category: d.category, name: d.name, amount: d.amount });
    }
  });

  console.log(`\nKeeping: ${toKeep.length}`);
  toKeep.forEach((t) => console.log(`  KEEP: ${t.date} ${t.category} ${t.name} ${t.amount}`));

  console.log(`\nDeleting: ${toDelete.length} February transactions from March...`);

  // Batch delete
  const BATCH_SIZE = 400;
  for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
    const batch = db.batch();
    toDelete.slice(i, i + BATCH_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  // Recalculate March monthly summary from remaining transactions
  if (toKeep.length > 0 || toDelete.length > 0) {
    const remaining = await txRef.where('yearMonth', '==', '2026-03').get();
    let totalExpense = 0;
    let totalIncome = 0;
    const categoryBreakdown: Record<string, number> = {};
    const dailyTotals: Record<string, number> = {};

    remaining.forEach((doc) => {
      const d = doc.data();
      if (d.type === 'expense') {
        totalExpense += d.amount;
        categoryBreakdown[d.category] = (categoryBreakdown[d.category] || 0) + d.amount;
        const day = String(d.date.toDate().getDate()).padStart(2, '0');
        dailyTotals[day] = (dailyTotals[day] || 0) + d.amount;
      } else {
        totalIncome += d.amount;
      }
    });

    await db.collection('families').doc(FAMILY_ID)
      .collection('monthlySummaries').doc('2026-03')
      .set({ totalExpense, totalIncome, remaining: totalIncome - totalExpense, categoryBreakdown, dailyTotals });

    console.log(`\nUpdated March summary: expense=${totalExpense}, income=${totalIncome}`);
  }

  console.log('Done!');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
