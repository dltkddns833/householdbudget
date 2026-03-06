# #1 예산 설정 & 달성률 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(StatsScreen, HomeScreen, MoreMenuScreen, types, categories) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 부부가 함께 카테고리별 월 예산을 설정한다
- 지출 입력 후 StatsScreen에서 예산 대비 달성률을 실시간으로 확인한다
- HomeScreen에서 이번달 전체 예산 소진율을 한눈에 본다
- 예산 80% 이상 소진 시 경고 색상으로 인지한다

---

## 2. 기능 요구사항

### 예산 설정

- 카테고리별 금액 입력 (지출 11개 카테고리 전체)
- 예산 미입력 카테고리 = 무제한 (달성률 표시 없음)
- 전월 예산 복사 버튼
- 저장 시 합계 실시간 갱신
- 이미 설정된 예산이 있으면 불러와서 수정 모드로 진입

### 달성률 시각화

- StatsScreen 카테고리 랭킹 리스트: 예산 설정된 카테고리에 달성률 progress bar 추가
  - 현재 이미 지출 progress bar 존재 → 예산 progress bar를 아래에 오버레이
  - 색상: 정상(<80%) primary, 경고(80~99%) #F59E0B, 초과(≥100%) #EF4444
  - 텍스트: "예산 120만원 중 85만원 (70%)"
- HomeScreen 메트릭 행: "이번달 소비" 카드 아래에 예산 달성률 바 추가
  - 예산 미설정 시 미표시

### 네비게이션

- MoreMenuScreen에 "예산 설정" 메뉴 항목 추가
- MoreMenu 스택 네비게이터에 BudgetSettingScreen 등록

---

## 3. Firestore 스키마 상세

```
families/{familyId}/budgets/{yearMonth}
  categories: Record<string, number>  // { "식비": 500000, "카페": 100000, ... }
  updatedAt: Timestamp
  updatedBy: string  // uid
```

- `yearMonth` = "YYYY-MM" (기존 monthlySummaries와 동일 키 형식)
- 예산 미설정 카테고리는 `categories`에 키 없음 (0 저장 X)

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
export interface MonthlyBudget {
  yearMonth: string;
  categories: Record<string, number>;  // categoryKey -> 예산 금액
  updatedAt: Date;
  updatedBy: string;
}

export interface CategoryBudgetProgress {
  categoryKey: string;
  label: string;
  color: string;
  icon: string;
  budgeted: number;     // 설정 예산 (0이면 미설정)
  spent: number;        // 실제 지출
  rate: number;         // spent / budgeted * 100 (미설정 시 -1)
  status: 'normal' | 'warning' | 'over' | 'unset';
}
```

---

## 5. 파일별 TODO

### [신규] src/features/budget/services/budgetService.ts

- [ ] `getBudget(familyId, yearMonth): Promise<MonthlyBudget | null>`
- [ ] `upsertBudget(familyId, yearMonth, categories, uid): Promise<void>`
- [ ] `getPreviousMonthBudget(familyId, yearMonth): Promise<MonthlyBudget | null>`
  - yearMonth에서 1개월 전 계산 후 조회

### [신규] src/features/budget/hooks/useBudget.ts

- [ ] `useBudget(yearMonth)` — React Query, familyId는 authStore에서
- [ ] `useUpsertBudget()` — mutation, 성공 시 해당 월 캐시 invalidate
- [ ] `useBudgetProgress(yearMonth): CategoryBudgetProgress[]`
  - `useBudget` + `useMonthlySummary` 조합
  - categories.ts의 EXPENSE_CATEGORIES 순서대로 정렬
  - 지출 없고 예산도 없는 카테고리는 리스트에서 제외

### [신규] src/features/budget/screens/BudgetSettingScreen.tsx

- [ ] FlatList로 지출 카테고리 11개 렌더링
- [ ] 각 행: 카테고리 아이콘 + 이름 + 금액 TextInput (숫자, 만원 단위 표시 보조)
- [ ] 상단 합계 카드: 설정된 예산 합계 실시간 표시
- [ ] 하단 "전월 복사" 버튼: 전월 예산 데이터 로드 → 폼에 채우기
- [ ] 하단 "저장" 버튼: upsertBudget 호출 후 뒤로 이동
- [ ] 빈 금액 입력 = 해당 카테고리 예산 삭제 (categories 키에서 제거)

### [수정] src/features/stats/screens/StatsScreen.tsx

- [ ] `useBudgetProgress(currentMonth)` 훅 추가
- [ ] 카테고리 랭킹 리스트 아이템에 예산 달성률 표시 추가
  - 예산 설정된 항목만 "X만원 / Y만원" + 달성률 progress bar 렌더링
  - 달성률 색상 조건부 적용 (normal/warning/over)

### [수정] src/features/home/screens/HomeScreen.tsx

- [ ] `useBudgetProgress(currentMonth)` 훅 추가
- [ ] 이번달 소비 섹션에 전체 예산 대비 소진율 progress bar 추가
  - 전체 예산 = categories 합계, 전체 소비 = totalExpense
  - 예산 미설정 시 해당 UI 미렌더링

### [수정] src/features/more/screens/MoreMenuScreen.tsx

- [ ] "예산 설정" 메뉴 항목 추가 (재무상태 위)
- [ ] `navigation.navigate('BudgetSetting')` 연결

### [수정] 네비게이터 (MoreMenu 스택)

- [ ] `BudgetSettingScreen` import 및 Screen 등록
- [ ] `MoreStackParamList`에 `BudgetSetting` 추가

---

## 6. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 예산 미설정 월 | 달성률 UI 전체 숨김 |
| 수입 카테고리 | 예산 설정 대상 제외 |
| 예산 0원 입력 | 미설정과 동일하게 처리 (저장 시 키 제거) |
| 지출은 있는데 예산 없는 카테고리 | 달성률 바 미표시, 지출 금액만 표시 |
| 전월 예산 없을 때 "전월 복사" | 토스트로 "전월 예산이 없습니다" 안내 |

---

## 7. 검증 항목

- [ ] BudgetSettingScreen에서 카테고리별 예산 저장 → Firestore 반영 확인
- [ ] 전월 복사 버튼 동작 (전월 데이터 있는 경우 / 없는 경우)
- [ ] StatsScreen 카테고리 랭킹에 달성률 바 표시 (예산 설정 카테고리만)
- [ ] 달성률 80% 이상 → 황색, 100% 초과 → 적색 표시
- [ ] HomeScreen 이번달 소비 섹션에 예산 소진율 바 표시
- [ ] 예산 미설정 월에는 달성률 UI 미노출
- [ ] MoreMenuScreen "예산 설정" 메뉴 → BudgetSettingScreen 이동
