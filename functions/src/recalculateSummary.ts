/**
 * monthlySummary 집계 계산 로직 (순수 함수)
 * Cloud Function에서 호출된다.
 */

export interface TxData {
  type: 'expense' | 'income';
  amount: number;
  category: string;
  yearMonth: string;
  date: FirebaseFirestore.Timestamp;
}

export interface MonthlySummaryData {
  totalExpense: number;
  totalIncome: number;
  remaining: number;
  categoryBreakdown: Record<string, number>;
  dailyTotals: Record<string, number>;
}

export function calculateSummary(transactions: TxData[]): MonthlySummaryData {
  let totalExpense = 0;
  let totalIncome = 0;
  const categoryBreakdown: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      totalExpense += tx.amount;
      categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount;
      const day = String(tx.date.toDate().getDate());
      dailyTotals[day] = (dailyTotals[day] || 0) + tx.amount;
    } else {
      totalIncome += tx.amount;
    }
  }

  return {
    totalExpense,
    totalIncome,
    remaining: totalIncome - totalExpense,
    categoryBreakdown,
    dailyTotals,
  };
}
