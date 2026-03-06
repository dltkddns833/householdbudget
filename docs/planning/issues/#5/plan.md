# #5 연간 요약

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/5

## 개요

월 단위에 집중된 현재 통계를 보완하여 연간 흐름을 한눈에 파악한다.
`monthlySummaries`에서 해당 연도 데이터를 일괄 조회하여 통계 화면에 연/월 탭으로 제공한다.

---

## Firestore 데이터 모델

신규 컬렉션/필드 변경 없음. 기존 `monthlySummaries/{yearMonth}` 활용:
- 연간 조회: `yearMonth.startsWith(year)` 조건으로 최대 12개 문서 일괄 조회

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
export interface YearlySummary {
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalSaving: number;
  savingRate: number;  // (totalIncome - totalExpense) / totalIncome * 100
  monthlyData: {
    month: number;       // 1~12
    income: number;
    expense: number;
    saving: number;
  }[];
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/stats/hooks/useYearlySummary.ts` | 연간 데이터 조회 & 집계 훅 |
| `src/features/stats/components/YearlyStatsView.tsx` | 연간 통계 뷰 컴포넌트 |
| `src/features/stats/components/MonthlyBarChart.tsx` | 월별 수입/지출 막대그래프 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | YearlySummary 타입 추가 |
| `src/features/stats/screens/StatsScreen.tsx` | 상단에 연/월 탭 추가, 연간 뷰 조건부 렌더링 |

---

## 훅 (`useYearlySummary.ts`)

```typescript
useYearlySummary(year: number): {
  data: YearlySummary | null;
  isLoading: boolean;
}
// 내부 동작:
// 1. firestore where('yearMonth', '>=', `${year}-01`) where('yearMonth', '<=', `${year}-12`) 조회
// 2. 12개월 데이터 집계 → YearlySummary 계산
// 3. 데이터 없는 월은 0으로 채움
```

queryKey: `['yearly-summary', familyId, year]`

---

## 화면 구성 / UX

### StatsScreen — 연/월 탭

화면 상단에 탭 추가:
```
[월간]  [연간]
```

### YearlyStatsView

```
연도 선택: ← 2025 →

[총 수입]        [총 지출]       [총 저축]
 3,600만원        2,800만원       800만원

연간 저축률: 22.2%

월별 수입 vs 지출 막대그래프:
  Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
  ■수입 □지출

카테고리별 연간 지출 TOP 5:
  식비  5,200,000원  ████████
  교통  1,800,000원  ███
  ...
```

### MonthlyBarChart

- `react-native-chart-kit` BarChart 활용
- 수입: 파란색, 지출: 빨간색 나란히 배치
- 데이터 없는 월(미래)은 회색으로 표시

---

## 검증 항목

- [ ] 연/월 탭 전환 동작
- [ ] 연도 ← → 버튼으로 연도 이동
- [ ] 연간 총 수입/지출/저축 합산 정확성
- [ ] 연간 저축률 계산 정확성 (수입 0원일 때 0% 처리)
- [ ] 월별 막대그래프 12개월 표시 (데이터 없는 미래 월 = 0)
- [ ] 카테고리별 연간 TOP 5 표시
