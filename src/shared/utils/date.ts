import dayjs from 'dayjs';

export const getCurrentYearMonth = (): string => dayjs().format('YYYY-MM');

export const formatYearMonth = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  return `${year}년 ${parseInt(month)}월`;
};

export const formatDate = (date: Date): string => dayjs(date).format('MM.DD');

export const formatDateFull = (date: Date): string => dayjs(date).format('YYYY.MM.DD');

export const formatDateWithDay = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const d = dayjs(date);
  return `${d.format('MM.DD')} (${days[d.day()]})`;
};

export const getYearMonth = (date: Date): string => dayjs(date).format('YYYY-MM');

export const getPrevMonth = (yearMonth: string): string =>
  dayjs(yearMonth + '-01').subtract(1, 'month').format('YYYY-MM');

export const getNextMonth = (yearMonth: string): string =>
  dayjs(yearMonth + '-01').add(1, 'month').format('YYYY-MM');

export const getMonthRange = (yearMonth: string, count: number): string[] => {
  const result: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    result.push(dayjs(yearMonth + '-01').subtract(i, 'month').format('YYYY-MM'));
  }
  return result;
};

export const parseCSVDate = (dateStr: string): Date => {
  // "2026.01.03" → Date
  const [year, month, day] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
};

export const getDayOfMonth = (date: Date): string =>
  dayjs(date).format('DD');
