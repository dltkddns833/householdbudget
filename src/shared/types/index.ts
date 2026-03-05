import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  familyId: string | null;
  photoURL: string | null;
}

export interface Family {
  id: string;
  members: string[];
  memberNames: Record<string, string>;
  inviteCode: string;
}

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: FirebaseFirestoreTypes.Timestamp;
  yearMonth: string; // "2026-01"
  category: string;
  name: string;
  amount: number; // 원 단위 정수
  memo: string;
  createdBy: string;
}

export interface TransactionInput {
  type: TransactionType;
  date: Date;
  category: string;
  name: string;
  amount: number;
  memo: string;
}

export interface MonthlySummary {
  id: string; // yearMonth
  totalExpense: number;
  totalIncome: number;
  remaining: number;
  categoryBreakdown: Record<string, number>;
  dailyTotals: Record<string, number>;
}

export interface OverviewMonth {
  id: string; // yearMonth
  realAsset: number;
  realAssetWithLease: number;
  retirementFund: number;
  realAssetChange: number | null;
  realAssetChangeRate: number | null;
  totalExpense: number;
  expenseChange: number | null;
}

export interface Account {
  id: string;
  owner: string; // "상운" | "채원"
  section: 'realAsset' | 'retirement';
  accountType: string; // "입출금", "투자자산(절세형)", etc.
  subType: string; // "자유입출식", "ISA", etc.
  institution: string; // "신한은행", etc.
  accountName: string;
  amount: number;
  sortOrder: number;
}

export interface FinancialStatus {
  id: string; // yearMonth
  realAssetTotal: number;
  realAssetWithLease: number;
  retirementTotal: number;
  leaseDeposit: number;
  leaseLoan: number;
  leaseNet: number;
}

export interface LeaseInfo {
  deposit: number;
  loan: number;
  net: number;
}
