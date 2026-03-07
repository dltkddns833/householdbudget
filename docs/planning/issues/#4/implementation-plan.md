# #4 전월 비교 인사이트 — 구현 계획

## Context

통계 화면에서 현월/전월 `monthlySummaries`를 비교하여 자동 생성된 텍스트 인사이트를 최대 3개 카드로 표시한다.
"지난달보다 식비가 15만원 더 나왔어요", "이번달 저축률 22% 달성" 등 사용자가 소비 패턴을 직관적으로 파악할 수 있도록 돕는다.

---

## 주의사항

- 기존 코드 패턴 따르기: useState + Alert.alert (react-hook-form/zod 사용 안 함)
- 순수 함수(`insightGenerator.ts`)로 인사이트 생성 로직 분리 → 테스트 용이
- 기존 유틸 재사용:
  - `getPrevMonth(yearMonth)` — `src/shared/utils/date.ts`
  - `formatCurrencyShort(amount)` — `src/shared/utils/currency.ts`
  - `transactionService.getMonthlySummary(familyId, yearMonth)` — 전월 summary 조회
  - `getCategoryByKey(key)` — `src/shared/constants/categories.ts`
- `useStats.ts` 파일은 존재하지 않음 → 신규 `useInsights.ts` 생성

---

## 인사이트 타입 및 생성 규칙

### 타입
| type | 배경색 (라이트) | 배경색 (다크) | 아이콘 |
|------|----------------|--------------|--------|
| `warning` | #FEF3C7 | #451A03 | `trending-up` |
| `saving` | #D1FAE5 | #052E16 | `trending-down` |
| `achievement` | #DBEAFE | #1E3A5F | `star` |
| `info` | surfaceSecondary | surfaceSecondary | `info` |

### 생성 규칙 (우선순위: warning > achievement > saving > info)

| 조건 | 메시지 | 타입 |
|------|--------|------|
| 총 지출 ↑ > 10,000원 (전월 대비) | "지난달보다 N만원 더 지출했어요" | warning |
| 총 지출 ↓ (전월 대비) | "지난달보다 N만원 절약했어요!" | saving |
| 카테고리 급증 (50%↑ & 30,000원↑) | "이번달 {카테고리}가 지난달보다 N만원 늘었어요" | warning |
| 저축액 < 0 | "이번달 지출이 수입을 N만원 초과했어요" | warning |
| 저축률 >= 20% | "이번달 저축률 N%를 달성했어요!" | achievement |
| 저축액 > 0 | "이번달 N만원을 모았어요" | info |
| 전월 데이터 없음 | 수입/지출/저축 요약 1개 | info |

**엣지 케이스**
- 전월 totalExpense = 0 → 증감 비교 건너뜀
- 수입 = 0인 달 → 저축률 계산 건너뜀
- 인사이트 4개 이상 → 우선순위 상위 3개만 반환

---

## 구현 순서

### 1단계: 타입 추가
**수정 파일:** `src/shared/types/index.ts`

```ts
export type InsightType = 'saving' | 'warning' | 'info' | 'achievement';

export interface InsightMessage {
  type: InsightType;
  message: string;
}
```

### 2단계: 인사이트 생성 순수 함수
**신규 파일:** `src/features/stats/utils/insightGenerator.ts`

```ts
export function generateInsights(
  current: MonthlySummary,
  prev: MonthlySummary | null,
): InsightMessage[]
```

- 전월 null → info 1개 (수입/지출/저축 요약) 반환
- 전월 있음 → 규칙에 따라 인사이트 생성 후 우선순위 정렬, 상위 3개 반환
- `formatCurrencyShort()` 로 금액 표기

### 3단계: 훅 생성
**신규 파일:** `src/features/stats/hooks/useInsights.ts`

- `getPrevMonth(yearMonth)` 로 전월 계산
- React Query로 전월 summary 조회 (queryKey: `['monthlySummary', familyId, prevYearMonth]`)
- 현월 summary는 `useTransactions(yearMonth)` 재사용
- `useMemo`로 `generateInsights(current, prev)` 호출

### 4단계: InsightCard 컴포넌트
**신규 파일:** `src/features/stats/components/InsightCard.tsx`

- `insights: InsightMessage[]` props
- 타입별 배경색 + 아이콘 + 메시지 텍스트
- `isDark` 분기로 다크모드 배경색 적용
- 빈 배열이면 null 반환 (숨김)

### 5단계: StatsScreen 수정
**수정 파일:** `src/features/stats/screens/StatsScreen.tsx`

- `useInsights(currentMonth)` 훅 추가
- MonthSelector 바로 아래 `<InsightCard insights={insights} />` 삽입

---

## 수정/신규 파일 목록

| 파일 | 작업 |
|------|------|
| `src/shared/types/index.ts` | `InsightType`, `InsightMessage` 타입 추가 |
| `src/features/stats/utils/insightGenerator.ts` | **신규** — 순수 함수 |
| `src/features/stats/hooks/useInsights.ts` | **신규** — React Query 훅 |
| `src/features/stats/components/InsightCard.tsx` | **신규** — UI 컴포넌트 |
| `src/features/stats/screens/StatsScreen.tsx` | `useInsights` + `InsightCard` 추가 |

---

## 검증 방법

1. 통계 탭 → MonthSelector 아래 인사이트 카드 표시 확인
2. 전월 데이터 있는 달 → 최대 3개 카드, 타입별 배경색 확인
3. 전월 데이터 없는 달 → info 1개(수입/지출/저축 요약)만 표시
4. 지출 증가 달 → warning 인사이트 노출
5. 지출 감소 달 → saving 인사이트 노출
6. 카테고리 급증 (50%↑, 30,000원↑) → 해당 카테고리 warning 노출
7. 저축률 20%↑ → achievement 인사이트 노출
8. 인사이트 없으면 카드 영역 미표시 확인
9. 다크 모드에서 배경색 올바르게 표시 확인
