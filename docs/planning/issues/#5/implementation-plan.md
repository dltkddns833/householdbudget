# #5 연간 요약 — 구현 계획

## Context

월 단위에 집중된 현재 통계 화면을 보완하여 연간 흐름을 한눈에 파악할 수 있게 한다.
StatsScreen에 월간/연간 탭을 추가하고, 연간 탭에서 총 수입/지출/저축, 저축률, 월별 차트, 카테고리 TOP 5를 표시한다.

---

## 주의사항

- 기존 패턴 따르기: useState + Alert.alert, React Query staleTime 5분
- 기존 유틸 재사용:
  - `formatCurrencyShort()` — `src/shared/utils/currency.ts`
  - `getCategoryByKey()` — `src/shared/constants/categories.ts`
  - `BarChart` — react-native-chart-kit (기존 StatsScreen에서 이미 사용 중)
  - `useAuthStore()` — familyId 획득
  - `LoadingSpinner`, `EmptyState` — `src/shared/components`
- Firestore 신규 컬렉션/필드 변경 없음 — 기존 `monthlySummaries/{yearMonth}` 활용
- BarChart grouped bar는 chart-kit 미지원 → 수입/지출 각각 별도 BarChart 2개로 표현

---

## 타입 추가

**수정 파일:** `src/shared/types/index.ts`

```ts
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
  savingRate: number; // totalIncome > 0 ? totalSaving / totalIncome * 100 : 0
  monthlyData: MonthlyDataPoint[]; // 항상 12개, 없는 달 = 0
  topCategories: { category: string; label: string; amount: number }[]; // 최대 5개
}
```

---

## 구현 순서

### 1단계: 타입 추가
`src/shared/types/index.ts`에 `MonthlyDataPoint`, `YearlySummary` 추가

### 2단계: 훅 생성
**신규 파일:** `src/features/stats/hooks/useYearlySummary.ts`

- queryKey: `['yearly-summary', familyId, year]`
- Firestore 쿼리: yearMonth >= `${year}-01` && <= `${year}-12`
- 변환: monthlyData 1~12 배열(없는 달 0), 합산, topCategories 상위 5개
- staleTime: 5 * 60 * 1000

### 3단계: MonthlyBarChart 컴포넌트
**신규 파일:** `src/features/stats/components/MonthlyBarChart.tsx`

- Props: `monthlyData: MonthlyDataPoint[]`
- react-native-chart-kit BarChart 2개 (수입 파란색, 지출 빨간색)
- 레이블: 1~12월, 단위: 만원

### 4단계: YearlyStatsView 컴포넌트
**신규 파일:** `src/features/stats/components/YearlyStatsView.tsx`

- Props: `year: number`, `onYearChange: (year: number) => void`
- 연도 선택 헤더 (← 연도 →, 현재 연도 초과 불가)
- 요약 카드 3개 (총 수입 / 총 지출 / 총 저축)
- 저축률 배지
- MonthlyBarChart 삽입
- 카테고리 TOP 5 리스트 (아이콘 + 금액 + 비율 진행 바)
- 로딩: LoadingSpinner, 빈 상태: EmptyState (icon: "bar-chart")

### 5단계: StatsScreen 수정
**수정 파일:** `src/features/stats/screens/StatsScreen.tsx`

- `activeTab: 'monthly' | 'yearly'` 로컬 state 추가
- `selectedYear` 로컬 state 추가 (초기값: 현재 연도)
- 헤더 아래 탭 UI 추가
- 연간 탭: MonthSelector 숨기고 YearlyStatsView 렌더링

---

## 수정/신규 파일 목록

| 파일 | 작업 |
|------|------|
| `src/shared/types/index.ts` | `MonthlyDataPoint`, `YearlySummary` 타입 추가 |
| `src/features/stats/hooks/useYearlySummary.ts` | **신규** |
| `src/features/stats/components/MonthlyBarChart.tsx` | **신규** |
| `src/features/stats/components/YearlyStatsView.tsx` | **신규** |
| `src/features/stats/screens/StatsScreen.tsx` | 탭 + YearlyStatsView 추가 |

---

## 검증 방법

1. 통계 탭 상단 [월간] / [연간] 탭 전환 확인
2. 연간 탭: MonthSelector 숨김, YearlyStatsView 렌더링 확인
3. ← → 연도 이동, 현재 연도 초과 불가 확인
4. 총 수입/지출/저축 합산 정확성 확인
5. 저축률 계산 (수입 0원 → 0% 처리)
6. 월별 차트 12개월 표시 (미래 달 = 0)
7. 카테고리 TOP 5 금액 정확성 확인
8. 데이터 없는 연도 EmptyState 표시 확인
9. 다크 모드 색상 정상 표시 확인
