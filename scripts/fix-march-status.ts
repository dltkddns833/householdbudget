import * as admin from 'firebase-admin';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const FAMILY_ID = 'cQYJThomJRZHuBjAGobH';
const CSV_DIR = path.resolve(__dirname, '../../csv');

function parseCurrency(str: string): number {
  if (!str || str === '-' || str.trim() === '') return 0;
  const isNegative = str.startsWith('-') || str.includes('-₩');
  const cleaned = str.replace(/[₩,\s\-]/g, '');
  const value = parseInt(cleaned, 10);
  return isNaN(value) ? 0 : isNegative ? -value : value;
}

async function main() {
  // 1. Read March CSV to get correct amounts
  const csvPath = path.join(CSV_DIR, '가계부 - 재무상태_202603.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(content, { skip_empty_lines: false });

  // Build expected March amounts map: "owner|institution|accountName" → amount
  const marchAmounts = new Map<string, number>();
  for (const row of rows) {
    const owner = row[0]?.trim();
    const institution = row[3]?.trim();
    const accountName = row[4]?.trim();
    const amount = parseCurrency(row[5]);
    if (owner && institution && accountName && owner !== '구분') {
      if (owner === '전세자금') continue;
      const key = `${owner}|${institution}|${accountName}`;
      marchAmounts.set(key, amount);
    }
  }
  console.log('Expected March amounts:');
  marchAmounts.forEach((v, k) => console.log(`  ${k}: ${v}`));

  // 2. Delete ALL March accounts
  const marchAccountsRef = db.collection('families').doc(FAMILY_ID)
    .collection('financialStatus').doc('2026-03').collection('accounts');
  const snap = await marchAccountsRef.get();
  console.log(`\nDeleting all ${snap.size} accounts from March...`);

  const deleteBatch = db.batch();
  snap.forEach((doc) => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();

  // 3. Re-import correct March accounts from CSV
  console.log('\nRe-importing correct March accounts...');
  let sortOrder = 0;
  let section: 'realAsset' | 'retirement' = 'realAsset';
  let headerCount = 0;

  const insertBatch = db.batch();

  for (const row of rows) {
    const col0 = row[0]?.trim() || '';
    const col1 = row[1]?.trim() || '';

    if (col0 === '구분' && col1 === '타입') {
      headerCount++;
      if (headerCount >= 2) section = 'retirement';
      continue;
    }
    if (col0 === '전세자금' || !col0 || !col1) continue;

    const owner = col0;
    const accountType = col1;
    const subType = row[2]?.trim() || '';
    const institution = row[3]?.trim() || '';
    const accountName = row[4]?.trim() || '';
    const amount = parseCurrency(row[5]);

    const ref = marchAccountsRef.doc();
    insertBatch.set(ref, {
      owner, section, accountType, subType, institution, accountName, amount,
      sortOrder: sortOrder++,
    });
    console.log(`  [${sortOrder - 1}] ${owner} ${institution} ${accountName} ${amount} (${section})`);
  }
  await insertBatch.commit();

  // 4. Fix March financial status doc
  const statusRef = db.collection('families').doc(FAMILY_ID)
    .collection('financialStatus').doc('2026-03');
  await statusRef.set({
    realAssetTotal: 167213496,
    realAssetWithLease: 437213496,
    retirementTotal: 74867343,
    leaseDeposit: 320000000,
    leaseLoan: 50000000,
    leaseNet: 270000000,
  });
  console.log('\nFixed March status: realAsset=167213496, retirement=74867343');

  console.log(`\nDone! ${sortOrder} accounts re-imported.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
