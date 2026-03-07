import { useState, useCallback, useMemo } from 'react';
import { Transaction, TransactionFilter } from '../../../shared/types';

const DEFAULT_FILTER: TransactionFilter = {};

export const useTransactionFilter = () => {
  const [filter, setFilterState] = useState<TransactionFilter>(DEFAULT_FILTER);

  const setFilter = useCallback((partial: Partial<TransactionFilter>) => {
    setFilterState(prev => ({ ...prev, ...partial }));
  }, []);

  const replaceFilter = useCallback((newFilter: TransactionFilter) => {
    setFilterState(newFilter);
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER);
  }, []);

  const filterTransactions = useCallback(
    (transactions: Transaction[]): Transaction[] => {
      return transactions.filter(tx => {
        if (filter.query) {
          const q = filter.query.toLowerCase();
          const nameMatch = tx.name.toLowerCase().includes(q);
          const memoMatch = tx.memo?.toLowerCase().includes(q);
          if (!nameMatch && !memoMatch) return false;
        }

        if (filter.category) {
          if (tx.category !== filter.category) return false;
        }

        if (filter.type && filter.type !== 'all') {
          if (tx.type !== filter.type) return false;
        }

        if (filter.amountMin != null && tx.amount < filter.amountMin) {
          return false;
        }
        if (filter.amountMax != null && tx.amount > filter.amountMax) {
          return false;
        }

        if (filter.dateFrom || filter.dateTo) {
          const txDate = tx.date.toDate();
          const txDateStr = txDate.toISOString().split('T')[0];
          if (filter.dateFrom && txDateStr < filter.dateFrom) return false;
          if (filter.dateTo && txDateStr > filter.dateTo) return false;
        }

        return true;
      });
    },
    [filter],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter.query) count++;
    if (filter.category) count++;
    if (filter.type && filter.type !== 'all') count++;
    if (filter.amountMin != null || filter.amountMax != null) count++;
    if (filter.dateFrom || filter.dateTo) count++;
    return count;
  }, [filter]);

  const isActive = activeFilterCount > 0;

  return { filter, setFilter, replaceFilter, resetFilter, filterTransactions, activeFilterCount, isActive };
};
