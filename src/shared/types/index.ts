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

export interface MonthlyDataPoint {
  month: number; // 1~12
  income: number;
  expense: number;
  saving: number;
}

export interface YearlySummary {
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalSaving: number;
  savingRate: number;
  monthlyData: MonthlyDataPoint[]; // 항상 12개, 없는 달 = 0
  topCategories: { category: string; label: string; amount: number }[];
}

export type InsightType = 'saving' | 'warning' | 'info' | 'achievement';

export interface InsightMessage {
  type: InsightType;
  message: string;
}

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  type: 'expense' | 'income';
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  lastAppliedYearMonth?: string;
}

export interface MonthlyBudget {
  yearMonth: string;
  categories: Record<string, number>; // categoryKey -> 예산 금액
  updatedAt: Date;
  updatedBy: string;
}

export interface CategoryBudgetProgress {
  categoryKey: string;
  label: string;
  color: string;
  icon: string;
  budgeted: number;   // 설정 예산 (0이면 미설정)
  spent: number;      // 실제 지출
  rate: number;       // spent / budgeted * 100 (미설정 시 -1)
  status: 'normal' | 'warning' | 'over' | 'unset';
}
