# #1 예산 설정 & 달성률 기능

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/1

## 개요

카테고리별 월 예산을 설정하고 실제 지출 대비 달성률을 시각화하는 기능.
현재 `monthlySummaries.categoryBreakdown`에 카테고리별 지출이 이미 집계되어 있어 예산 비교가 용이함.

---

## Firestore 데이터 모델

```
families/{familyId}/budgets/{yearMonth}
  - categories: Record<categoryKey, number>  // 미설정 카테고리는 키 없음
  - updatedAt: Timestamp
```

> subcollection 대신 단일 문서 + map 구조 (11번의 읽기/쓰기 → 1번으로 절감)

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
export interface MonthlyBudget {
  id: string; // yearMonth
  categories: Record<string, number>; // { '식비': 500000, '카페': 100000 }
  updatedAt: Timestamp;
}

export interface CategoryBudgetProgress {
  category: string;
  label: string;
  icon: string;
  color: string;
  budget: number;      // 0이면 미설정
  spent: number;
  percentage: number;  // spent / budget * 100 (budget=0이면 0)
  isOverBudget: boolean;
  isWarning: boolean;  // percentage >= 80
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/budget/services/budgetService.ts` | Firestore CRUD |
| `src/features/budget/hooks/useBudgets.ts` | React Query 훅 |
| `src/features/budget/screens/BudgetSettingScreen.tsx` | 예산 설정 화면 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | MonthlyBudget, CategoryBudgetProgress 타입 추가 |
| `src/features/settings/screens/MoreMenuScreen.tsx` | "예산 설정" 메뉴 항목 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | MoreStack에 BudgetSetting 스크린 추가 |
| `src/features/stats/screens/StatsScreen.tsx` | 카테고리 항목에 예산 진행 바 추가 |
| `src/features/home/screens/HomeScreen.tsx` | 예산 요약 카드 추가 |

---

## 서비스 (`budgetService.ts`)

```typescript
const budgetDoc = (familyId, yearMonth) =>
  firestore().collection('families').doc(familyId)
    .collection('budgets').doc(yearMonth);

getBudget(familyId, yearMonth): Promise<MonthlyBudget | null>
upsertBudget(familyId, yearMonth, categories: Record<string, number>): Promise<void>
  // merge: true로 부분 업데이트 지원
```

---

## 훅 (`useBudgets.ts`)

```typescript
useBudget(yearMonth?)         // useQuery - 해당 월 예산 조회
useUpsertBudget()             // useMutation - 예산 저장
useBudgetProgress(yearMonth?) // useMemo - budget + categoryBreakdown 합산
  // CategoryBudgetProgress[] 반환 (지출 있는 카테고리 우선 정렬)
```

queryKey: `['budget', familyId, yearMonth]`

---

## BudgetSettingScreen

**진입점**: MoreMenu → "예산 설정"

**화면 구성**:
```
Header: "예산 설정"
MonthSelector (월 이동)

카테고리 목록 (지출 11개):
  각 행:
  - 카테고리 아이콘 + 이름
  - 금액 입력 (탭 시 숫자 키패드, 0원 = "미설정" placeholder)
  - [현재 월이면] 실지출 / 예산 진행률 텍스트

[저장] 버튼 (하단 고정)
```

**UX 상세**:
- 금액 입력: `formatInputNumber` / `parseInputNumber` 유틸 재사용
- 0원 입력 = 미설정 (저장 시 해당 키 제거)
- 저장: `upsertBudget` 호출 후 `monthlySummary`, `budget` queryKey 무효화

---

## StatsScreen 수정

카테고리 랭킹 항목에 예산 진행 바 추가:

```
[식비 아이콘]  식비                    320,000원
               ████████░░  64% (예산 500,000원)
```

- 예산 미설정 카테고리: 진행 바 없이 금액만 표시
- 80% 이상: `colors.warning` (#F59E0B)
- 100% 초과: `colors.danger` (#EF4444)

---

## HomeScreen 수정

메트릭 카드 영역 아래 예산 요약 카드 추가 (예산 설정된 달에만):

```
[이번달 예산]
전체 예산 대비 지출
  [████████░░] 68%  680,000 / 1,000,000원
예산 초과 카테고리: 식비, 쇼핑
```

---

## 네비게이션

```
MoreMenu → BudgetSetting  (신규)
MoreMenu → Assets → AssetEdit  (기존)
```

MoreMenuScreen 아이콘: `account-balance-wallet`

---

## 경고 기준 (시각적)

| 구간 | 색상 | 코드 |
|------|------|------|
| 80% 이상 | warning | `#F59E0B` |
| 100% 초과 | danger | `#EF4444` |

푸시 알림은 별도 feature로 분리 (낮은 우선순위).

---

## 검증 항목

- [ ] MoreMenu → "예산 설정" 진입 확인
- [ ] 카테고리별 금액 저장 → Firestore `budgets/{yearMonth}` 문서 생성 확인
- [ ] StatsScreen 진행 바 표시 (미설정 카테고리는 미표시)
- [ ] HomeScreen 예산 요약 카드 표시
- [ ] 80% / 100% 경계값 색상 변경 확인
- [ ] 예산 없는 달 → 홈 카드 숨김 확인
