import * as admin from 'firebase-admin';

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const FAMILY_ID = 'cQYJThomJRZHuBjAGobH';

async function main() {
  const txRef = db.collection('families').doc(FAMILY_ID).collection('transactions');

  for (const ym of ['2026-01', '2026-02', '2026-03']) {
    const snap = await txRef.where('yearMonth', '==', ym).get();
    console.log(`${ym}: ${snap.size} transactions`);
  }

  // Check Feb duplicates
  const febSnap = await txRef.where('yearMonth', '==', '2026-02').get();
  const febTxs: any[] = [];
  febSnap.forEach((doc) => {
    const d = doc.data();
    febTxs.push({
      id: doc.id,
      date: d.date.toDate().toISOString().slice(0, 10),
      name: d.name,
      amount: d.amount,
      category: d.category,
      type: d.type,
    });
  });

  // Find duplicates by date+name+amount
  const seen = new Map<string, any[]>();
  for (const tx of febTxs) {
    const key = `${tx.date}_${tx.name}_${tx.amount}_${tx.type}`;
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key)!.push(tx);
  }

  const duplicates = [...seen.entries()].filter(([, v]) => v.length > 1);
  console.log(`\nFeb duplicates: ${duplicates.length} groups`);
  duplicates.forEach(([key, items]) => {
    console.log(`  ${key} x${items.length}`);
  });

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
