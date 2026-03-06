# #5 연간 요약 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(StatsScreen, monthlySummaries 데이터 구조, react-native-chart-kit 사용 패턴) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 통계 화면에서 월간/연간 탭을 전환하여 올해 전체 수입·지출·저축 흐름을 확인한다
- 12개월 막대그래프로 어느 달에 지출이 많았는지 한눈에 파악한다
- 연도 이동 버튼으로 작년 데이터도 비교할 수 있다

---

## 2. 기능 요구사항

### 연간 통계 탭

- StatsScreen 상단에 [월간] / [연간] 탭 추가
- 탭 전환 시 뷰 교체 (기존 월간 뷰 유지)

### 연간 요약 수치

- 올해 총 수입 / 총 지출 / 총 저축액
- 연간 저축률 (수입 0원이면 0%)

### 월별 막대그래프

- 1~12월 수입 vs 지출 나란히 표시 (react-native-chart-kit BarChart)
- 아직 데이터 없는 미래 월: 0으로 표시
- 수입: 파란색, 지출: 빨간색/분홍색

### 카테고리별 연간 TOP 5

- monthlySummaries.categoryBreakdown 12개월 합산
- 금액 내림차순 5개 표시 + 가로 진행 바

### 연도 이동

- ← 연도 → 버튼으로 이전/다음 연도 이동
- 미래 연도로는 이동 불가 (현재 연도가 최대)

---

## 3. Firestore 데이터 모델

신규 변경 없음. 기존 monthlySummaries 활용:

```
// 연간 조회 쿼리
firestore()
  .collection('families').doc(familyId)
  .collection('monthlySummaries')
  .where('yearMonth', '>=', `${year}-01`)
  .where('yearMonth', '<=', `${year}-12`)
// 최대 12개 문서 반환
```

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
export interface MonthlyDataPoint {
  month: number;    // 1~12
  income: number;
  expense: number;
  saving: number;
}

export interface YearlySummary {
  year: number;
  totalIncome: number;
  totalExpense: number;
  totalSaving: number;
  savingRate: number;           // (totalIncome - totalExpense) / totalIncome * 100
  monthlyData: MonthlyDataPoint[];  // 항상 12개 (없는 달 = 0)
  topCategories: { category: string; label: string; amount: number }[];  // 최대 5개
}
```

---

## 5. 파일별 TODO

### [신규] src/features/stats/hooks/useYearlySummary.ts

- [ ] `useYearlySummary(year: number)` — useQuery
  - queryKey: `['yearly-summary', familyId, year]`
  - `monthlySummaries` 해당 연도 1~12월 일괄 조회
  - 결과를 `YearlySummary`로 변환:
    - monthlyData: 1~12월 배열 생성, 데이터 없는 월은 0 채움
    - topCategories: 12개월 categoryBreakdown 합산 후 상위 5개 추출
    - savingRate: totalIncome > 0 ? (totalSaving / totalIncome * 100) : 0
  - staleTime: 5분

### [신규] src/features/stats/components/YearlyStatsView.tsx

- [ ] `year`, `onYearChange` props 수신
- [ ] 연도 선택 헤더: [←] 2025 [→] (현재 연도 초과 시 [→] 비활성)
- [ ] 총 수입 / 총 지출 / 총 저축 요약 카드 3개 (가로 배치)
- [ ] 연간 저축률 표시
- [ ] `<MonthlyBarChart>` 컴포넌트 삽입
- [ ] 카테고리별 연간 TOP 5 리스트 (금액 + 진행 바)
- [ ] 로딩 상태: Skeleton 또는 ActivityIndicator

### [신규] src/features/stats/components/MonthlyBarChart.tsx

- [ ] `monthlyData: MonthlyDataPoint[]` props 수신
- [ ] react-native-chart-kit `BarChart` 활용
  - labels: ['1', '2', ..., '12']
  - datasets: 수입(파란색) + 지출(빨간색)
  - 미래 월(0 데이터) 회색 처리
- [ ] 그래프 탭 시 해당 월로 이동하는 인터랙션 (선택 사항)
- [ ] 스크롤 가능하도록 수평 스크롤 고려 (12개월이 좁으면 가로 스크롤)

### [수정] src/features/stats/screens/StatsScreen.tsx

- [ ] 상단에 [월간] / [연간] 탭 추가 (자체 탭 UI 또는 기존 스타일 활용)
- [ ] `activeTab: 'monthly' | 'yearly'` 로컬 state
- [ ] 연간 탭 선택 시 `<YearlyStatsView>` 렌더링, 월간 탭은 기존 뷰
- [ ] 연간 탭 시 월 선택기 숨김

---

## 6. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 해당 연도 데이터 전혀 없음 | 모든 월 0으로 표시, "데이터 없음" 안내 |
| 수입 = 0인 연도 | 저축률 0% 처리 |
| 미래 연도 이동 시도 | [→] 버튼 비활성화 또는 무시 |
| 카테고리 5개 미만 | 있는 카테고리만 표시 |
| 특정 월에 categoryBreakdown 없음 | 해당 월 카테고리 집계에서 0 처리 |

---

## 7. 검증 항목

- [ ] 월간/연간 탭 전환 동작
- [ ] 연도 ← → 버튼으로 연도 이동
- [ ] 현재 연도 초과 이동 불가 확인
- [ ] 연간 총 수입/지출/저축 합산 정확성 (monthlySummaries 합계와 비교)
- [ ] 연간 저축률 계산 정확성 (수입 0원 → 0% 처리)
- [ ] 월별 막대그래프 12개월 표시 (데이터 없는 미래 월 = 0)
- [ ] 카테고리별 연간 TOP 5 금액 정확성 확인
- [ ] 데이터 없는 연도 접근 시 빈 상태 처리
