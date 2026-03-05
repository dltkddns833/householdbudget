/**
 * CSV → Firestore Migration Script
 *
 * Usage:
 *   FAMILY_ID=xxx CREATOR_UID=yyy npx ts-node scripts/migrate-csv.ts
 *
 * Requires:
 *   - firebase-admin (npm install firebase-admin)
 *   - csv-parse (npm install csv-parse)
 *   - A service account key at scripts/serviceAccountKey.json
 */

import * as admin from 'firebase-admin';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

// ---- Configuration ----
const CSV_DIR = path.resolve(__dirname, '../../csv');
const FAMILY_ID = process.env.FAMILY_ID || '';
const CREATOR_UID = process.env.CREATOR_UID || '';

if (!FAMILY_ID || !CREATOR_UID) {
  console.error('Error: FAMILY_ID and CREATOR_UID env vars are required');
  console.error('Usage: FAMILY_ID=xxx CREATOR_UID=yyy npx ts-node scripts/migrate-csv.ts');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ---- Helpers ----
function parseCurrency(str: string): number {
  if (!str || str === '-' || str.trim() === '') return 0;
  const isNegative = str.startsWith('-') || str.includes('-₩');
  const cleaned = str.replace(/[₩,\s\-]/g, '');
  const value = parseInt(cleaned, 10);
  return isNaN(value) ? 0 : isNegative ? -value : value;
}

function parseRate(str: string): number | null {
  if (!str || str === '-' || str.trim() === '') return null;
  const cleaned = str.replace('%', '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

function parseCSVDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // noon to avoid timezone issues
}

function getYearMonth(dateStr: string): string {
  const [year, month] = dateStr.split('.').map(Number);
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getDayOfMonth(dateStr: string): string {
  const day = dateStr.split('.')[2];
  return day.padStart(2, '0');
}

function normalizeExpenseCategory(cat: string): string {
  if (cat === '교통비') return '교통';
  return cat;
}

function mapIncomeCategory(name: string): string {
  const n = name.trim();
  if (n === '급여') return '급여';
  if (n === '환급') return '환급';
  if (n.includes('청약')) return '청약';
  if (n.includes('용돈')) return '용돈';
  // 지출결의서, 정혜련, etc.
  return '기타수입';
}

// Batch helper: Firestore batch has 500 ops limit
async function commitInBatches(ops: Array<{ ref: admin.firestore.DocumentReference; data: any }>) {
  const BATCH_SIZE = 400;
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = ops.slice(i, i + BATCH_SIZE);
    for (const op of chunk) {
      batch.set(op.ref, op.data);
    }
    await batch.commit();
  }
}

// ---- Migration Functions ----

async function migrateOverview() {
  console.log('\n--- Migrating OVERVIEW ---');
  const csvPath = path.join(CSV_DIR, '가계부 - OVERVIEW.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(content, { skip_empty_lines: true });

  const ops: Array<{ ref: admin.firestore.DocumentReference; data: any }> = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const yearMonth = row[0]?.trim();
    if (!yearMonth || !yearMonth.match(/^\d{4}-\d{1,2}$/)) continue;

    const [y, m] = yearMonth.split('-');
    const normalizedYM = `${y}-${m.padStart(2, '0')}`;

    const overview = {
      realAsset: parseCurrency(row[1]),
      realAssetWithLease: parseCurrency(row[2]),
      retirementFund: parseCurrency(row[3]),
      realAssetChange: row[4] === '-' || !row[4]?.trim() ? null : parseCurrency(row[4]),
      realAssetChangeRate: parseRate(row[5]),
      totalExpense: parseCurrency(row[6]),
      expenseChange: parseRate(row[7]),
    };

    const ref = db.collection('families').doc(FAMILY_ID)
      .collection('overview').doc(normalizedYM);
    ops.push({ ref, data: overview });
    console.log(`  ${normalizedYM}: realAsset=${overview.realAsset}, expense=${overview.totalExpense}`);
  }

  await commitInBatches(ops);
  console.log(`  Done: ${ops.length} months`);
}

async function migrateMonthlyTransactions(yearMonth: string) {
  // yearMonth: "2026-01" → CSV: "가계부 - 2026.01.csv"
  const [y, m] = yearMonth.split('-');
  const formattedFile = `가계부 - ${y}.${m}.csv`;
  const csvPath = path.join(CSV_DIR, formattedFile);

  if (!fs.existsSync(csvPath)) {
    console.log(`  File not found: ${formattedFile}, skipping`);
    return;
  }

  console.log(`\n--- Migrating transactions: ${yearMonth} ---`);
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(content, { skip_empty_lines: false });

  let expenseCount = 0;
  let incomeCount = 0;
  let totalExpense = 0;
  let totalIncome = 0;
  const categoryBreakdown: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};

  const txRef = db.collection('families').doc(FAMILY_ID).collection('transactions');
  const ops: Array<{ ref: admin.firestore.DocumentReference; data: any }> = [];

  // Process expenses (columns A-E, index 0-4)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const dateStr = row[0]?.trim();
    const category = row[1]?.trim();
    const name = row[2]?.trim();
    const amountStr = row[3]?.trim();

    if (!dateStr || !category || !name || !amountStr) continue;
    if (!dateStr.match(/^\d{4}\.\d{2}\.\d{2}$/)) continue;

    const date = parseCSVDate(dateStr);
    const amount = parseCurrency(amountStr);
    if (amount <= 0) continue;

    const memo = row[4]?.trim() || '';
    const normalizedCategory = normalizeExpenseCategory(category);
    const txYearMonth = getYearMonth(dateStr);

    ops.push({
      ref: txRef.doc(),
      data: {
        type: 'expense',
        date: admin.firestore.Timestamp.fromDate(date),
        yearMonth: txYearMonth,
        category: normalizedCategory,
        name,
        amount,
        memo,
        createdBy: CREATOR_UID,
      },
    });

    totalExpense += amount;
    categoryBreakdown[normalizedCategory] = (categoryBreakdown[normalizedCategory] || 0) + amount;
    const day = getDayOfMonth(dateStr);
    dailyTotals[day] = (dailyTotals[day] || 0) + amount;
    expenseCount++;
  }

  // Process income (columns G-I, index 6-8)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const dateStr = row[6]?.trim();
    const name = row[7]?.trim();
    const amountStr = row[8]?.trim();

    if (!dateStr || !name || !amountStr) continue;
    if (!dateStr.match(/^\d{4}\.\d{2}\.\d{2}$/)) continue;

    const date = parseCSVDate(dateStr);
    const amount = parseCurrency(amountStr);
    if (amount <= 0) continue;

    const incomeCategory = mapIncomeCategory(name);

    ops.push({
      ref: txRef.doc(),
      data: {
        type: 'income',
        date: admin.firestore.Timestamp.fromDate(date),
        yearMonth: getYearMonth(dateStr),
        category: incomeCategory,
        name,
        amount,
        memo: '',
        createdBy: CREATOR_UID,
      },
    });

    totalIncome += amount;
    incomeCount++;
  }

  // Write all transactions
  await commitInBatches(ops);

  // Write monthly summary
  const summaryRef = db.collection('families').doc(FAMILY_ID)
    .collection('monthlySummaries').doc(yearMonth);
  await summaryRef.set({
    totalExpense,
    totalIncome,
    remaining: totalIncome - totalExpense,
    categoryBreakdown,
    dailyTotals,
  });

  console.log(`  Expenses: ${expenseCount}, Income: ${incomeCount}`);
  console.log(`  Total expense: ${totalExpense}, income: ${totalIncome}`);
}

async function migrateFinancialStatus(yearMonth: string) {
  const fileYM = yearMonth.replace('-', '');
  const formattedFile = `가계부 - 재무상태_${fileYM}.csv`;
  const csvPath = path.join(CSV_DIR, formattedFile);

  if (!fs.existsSync(csvPath)) {
    console.log(`  File not found: ${formattedFile}, skipping`);
    return;
  }

  console.log(`\n--- Migrating financial status: ${yearMonth} ---`);
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parse(content, { skip_empty_lines: false });

  const accountsRef = db.collection('families').doc(FAMILY_ID)
    .collection('financialStatus').doc(yearMonth).collection('accounts');

  // Row 0: header with totals
  const realAssetTotal = parseCurrency(rows[0][5]);
  const realAssetWithLease = parseCurrency(rows[0][6]);

  let sortOrder = 0;
  let section: 'realAsset' | 'retirement' = 'realAsset';
  let retirementTotal = 0;
  let leaseDeposit = 0;
  let leaseLoan = 0;
  let leaseNet = 0;
  let headerCount = 0;

  const ops: Array<{ ref: admin.firestore.DocumentReference; data: any }> = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const col0 = row[0]?.trim() || '';
    const col1 = row[1]?.trim() || '';

    // Skip header rows
    if (col0 === '구분' && col1 === '타입') {
      headerCount++;
      if (headerCount >= 2) section = 'retirement';
      continue;
    }

    // Handle 전세자금 row
    if (col0 === '전세자금') {
      leaseDeposit = parseCurrency(row[1]);
      leaseLoan = parseCurrency(row[2]);
      leaseNet = parseCurrency(row[5]);
      continue;
    }

    // Skip empty rows
    if (!col0 || !col1) {
      // Check if this row has the retirement total in column 5
      const col5 = row[5]?.trim() || '';
      if (col5 && parseCurrency(col5) > 0 && section === 'realAsset') {
        retirementTotal = parseCurrency(col5);
      }
      continue;
    }

    const owner = col0;
    const accountType = col1;
    const subType = row[2]?.trim() || '';
    const institution = row[3]?.trim() || '';
    const accountName = row[4]?.trim() || '';
    const amount = parseCurrency(row[5]);

    ops.push({
      ref: accountsRef.doc(),
      data: {
        owner,
        section,
        accountType,
        subType,
        institution,
        accountName,
        amount,
        sortOrder: sortOrder++,
      },
    });

    if (section === 'retirement') {
      retirementTotal += amount;
    }
  }

  await commitInBatches(ops);

  // If retirement total was found in the standalone row, use that
  // Otherwise use the calculated total from individual accounts
  // Check row 23-24 area for standalone retirement total
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const col0 = row[0]?.trim() || '';
    const col1 = row[1]?.trim() || '';
    if (!col0 && !col1) {
      const col5 = row[5]?.trim() || '';
      if (col5) {
        const val = parseCurrency(col5);
        if (val > 1_000_000) {
          // This is likely the retirement total
          retirementTotal = val;
          break;
        }
      }
    }
  }

  // Write financial status document
  const statusRef = db.collection('families').doc(FAMILY_ID)
    .collection('financialStatus').doc(yearMonth);
  await statusRef.set({
    realAssetTotal,
    realAssetWithLease,
    retirementTotal,
    leaseDeposit,
    leaseLoan,
    leaseNet,
  });

  console.log(`  Accounts: ${sortOrder}`);
  console.log(`  Real asset: ${realAssetTotal}, + Lease: ${realAssetWithLease}`);
  console.log(`  Retirement: ${retirementTotal}`);
  console.log(`  Lease: deposit=${leaseDeposit}, loan=${leaseLoan}, net=${leaseNet}`);
}

// ---- Main ----
async function main() {
  console.log('Starting CSV -> Firestore migration...');
  console.log(`CSV directory: ${CSV_DIR}`);
  console.log(`Family ID: ${FAMILY_ID}`);
  console.log(`Creator UID: ${CREATOR_UID}`);

  // 1. Migrate OVERVIEW
  await migrateOverview();

  // 2. Migrate monthly transactions
  const months = ['2026-01', '2026-02', '2026-03'];
  for (const month of months) {
    await migrateMonthlyTransactions(month);
  }

  // 3. Migrate financial status
  for (const month of months) {
    await migrateFinancialStatus(month);
  }

  console.log('\nMigration complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
