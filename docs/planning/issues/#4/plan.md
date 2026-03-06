# #4 전월 비교 인사이트

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/4

## 개요

숫자만 나열하지 않고, 자동으로 생성된 텍스트 인사이트로 지출 패턴을 해석해준다.
별도 백엔드 없이 클라이언트에서 `monthlySummaries` 전월 데이터를 비교하여 텍스트를 생성한다.

---

## Firestore 데이터 모델

신규 컬렉션/필드 변경 없음. 기존 `monthlySummaries/{yearMonth}` 데이터 활용:
- `totalExpense`, `totalIncome`, `remaining`
- `categoryBreakdown: Record<categoryKey, number>`

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
export interface InsightMessage {
  type: 'saving' | 'warning' | 'info' | 'achievement';
  message: string;
  // type별 아이콘/색상 결정에 사용
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/stats/utils/insightGenerator.ts` | 인사이트 텍스트 생성 순수 함수 |
| `src/features/stats/components/InsightCard.tsx` | 인사이트 카드 UI 컴포넌트 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | InsightMessage 타입 추가 |
| `src/features/stats/screens/StatsScreen.tsx` | InsightCard를 상단에 추가 |
| `src/features/stats/hooks/useStats.ts` | 전월 summary 함께 조회 |

---

## 인사이트 생성 로직 (`insightGenerator.ts`)

```typescript
generateInsights(current: MonthlySummary, prev: MonthlySummary | null): InsightMessage[]
```

### 생성 규칙

| 조건 | 메시지 예시 | type |
|------|------------|------|
| 전월 대비 총 지출 증가 | "지난달보다 식비가 15만원 더 나왔어요" | warning |
| 전월 대비 총 지출 감소 | "지난달보다 5만원 절약했어요!" | saving |
| 가장 많이 증가한 카테고리 | "이번달 교통비가 지난달의 2배예요" | warning |
| 저축률 최고 달 | "이번달 저축률이 이번 연도 가장 높아요" | achievement |
| 저축액 양수 | "이번달 N만원을 모았어요" | info |
| 저축액 음수 | "이번달 지출이 수입을 초과했어요" | warning |

- 최대 3개 인사이트 표시
- 전월 데이터 없으면 단순 이번달 요약 메시지 1개만

---

## 훅 변경 (`useStats.ts`)

```typescript
// 기존: 현재 달 summary만 조회
// 변경: 현재 달 + 전월 summary 함께 조회
useMonthlySummary(yearMonth)
usePrevMonthlySummary(yearMonth)  // dayjs(yearMonth).subtract(1, 'month') 계산
useInsights(yearMonth)  // useMemo로 generateInsights 호출
```

---

## 화면 구성 / UX

### StatsScreen — InsightCard

통계 화면 상단 (월 선택기 바로 아래):

```
┌─────────────────────────────┐
│ 💡 지난달보다 식비가 15만원   │
│    더 나왔어요               │
├─────────────────────────────┤
│ ✅ 이번달 3만원을 절약했어요  │
└─────────────────────────────┘
```

- 카드 배경색: type별 구분 (warning=주황, saving=초록, achievement=파랑, info=회색)
- 인사이트 없으면 카드 숨김

---

## 검증 항목

- [ ] 전월 데이터 있을 때 인사이트 카드 표시
- [ ] 전월 데이터 없을 때 인사이트 카드 숨김 또는 단순 요약 표시
- [ ] 지출 증가 시 warning 인사이트 생성
- [ ] 지출 감소 시 saving 인사이트 생성
- [ ] 최대 3개 인사이트 표시 제한 확인
- [ ] type별 색상 구분 확인
