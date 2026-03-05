export interface CategoryDef {
  key: string;
  label: string;
  icon: string; // MaterialIcons name
  color: string;
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { key: '식비', label: '식비', icon: 'restaurant', color: '#FF6B6B' },
  { key: '카페', label: '카페', icon: 'coffee', color: '#C68B59' },
  { key: '쇼핑', label: '쇼핑', icon: 'shopping-bag', color: '#4ECDC4' },
  { key: '구독', label: '구독', icon: 'autorenew', color: '#7C5CFC' },
  { key: '간식', label: '간식', icon: 'cookie', color: '#FFD93D' },
  { key: '교통', label: '교통', icon: 'directions-bus', color: '#6C9BCF' },
  { key: '관리비', label: '관리비', icon: 'home', color: '#95AABB' },
  { key: '기타', label: '기타', icon: 'more-horiz', color: '#A0A0A0' },
  { key: '건강', label: '건강', icon: 'favorite', color: '#FF8FAB' },
  { key: '통신비', label: '통신비', icon: 'phone-android', color: '#45B7D1' },
  { key: '취미', label: '취미', icon: 'sports-esports', color: '#96CEB4' },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { key: '급여', label: '급여', icon: 'account-balance-wallet', color: '#4CAF50' },
  { key: '환급', label: '환급', icon: 'undo', color: '#2196F3' },
  { key: '용돈', label: '용돈', icon: 'card-giftcard', color: '#FF9800' },
  { key: '청약', label: '청약', icon: 'savings', color: '#009688' },
  { key: '기타수입', label: '기타', icon: 'add-circle', color: '#607D8B' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const getCategoryByKey = (key: string): CategoryDef | undefined =>
  ALL_CATEGORIES.find(c => c.key === key);

export const getCategoryColor = (key: string): string =>
  getCategoryByKey(key)?.color ?? '#A0A0A0';
