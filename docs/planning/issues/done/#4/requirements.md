# #4 전월 비교 인사이트 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(StatsScreen, monthlySummaries 데이터 구조, categories.ts) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 통계 화면을 열면 이번 달 지출 패턴을 해석한 짧은 문장을 확인한다
- "지난달보다 식비가 15만원 더 나왔어요" 같은 문장으로 어디서 많이 썼는지 즉시 파악한다
- 숫자를 직접 계산하지 않아도 앱이 알아서 요약해준다

---

## 2. 기능 요구사항

### 인사이트 생성

- 현재 달 + 전월 monthlySummaries 데이터 비교
- 최대 3개 인사이트 표시
- 전월 데이터 없으면 단순 이번달 요약 1개 (수입/지출/저축 요약)

### 인사이트 유형

| type | 아이콘 | 조건 예시 |
|------|--------|-----------|
| `warning` | 경고 | 총 지출 증가, 카테고리 지출 급증, 지출>수입 |
| `saving` | 절약 | 총 지출 감소 |
| `achievement` | 달성 | 저축률 최고치, 특정 카테고리 지출 0 |
| `info` | 정보 | 저축액 양수, 기타 일반 사실 |

### 인사이트 표시 위치

- StatsScreen 월 선택기 바로 아래 InsightCard 컴포넌트
- 인사이트 없으면 카드 숨김

---

## 3. Firestore 데이터 모델

신규 변경 없음. 기존 데이터 활용:
- `monthlySummaries/{yearMonth}.totalExpense`
- `monthlySummaries/{yearMonth}.totalIncome`
- `monthlySummaries/{yearMonth}.remaining`
- `monthlySummaries/{yearMonth}.categoryBreakdown`

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
export type InsightType = 'saving' | 'warning' | 'info' | 'achievement';

export interface InsightMessage {
  type: InsightType;
  message: string;
}
```

---

## 5. 파일별 TODO

### [신규] src/features/stats/utils/insightGenerator.ts

- [ ] `generateInsights(current: MonthlySummary, prev: MonthlySummary | null): InsightMessage[]`
  - 반환값 최대 3개 제한 (우선순위: warning > achievement > saving > info)
- [ ] 전월 없을 때: 이번달 수입/지출/저축 요약 info 1개 반환
- [ ] 총 지출 증가 (prev 있을 때): `(current.totalExpense - prev.totalExpense) > 10000` → warning
  - 메시지: "지난달보다 N만원 더 지출했어요"
- [ ] 총 지출 감소: → saving
  - 메시지: "지난달보다 N만원 절약했어요!"
- [ ] 카테고리 지출 급증 (전월 대비 50% 이상 증가하고 증가액 > 30000): → warning
  - 메시지: "이번달 {카테고리}가 지난달보다 N만원 늘었어요"
- [ ] 저축액 양수: `remaining > 0` → info
  - 메시지: "이번달 N만원을 모았어요"
- [ ] 저축액 음수: `remaining < 0` → warning
  - 메시지: "이번달 지출이 수입을 N만원 초과했어요"
- [ ] 저축률 20% 이상 달성: → achievement
  - 메시지: "이번달 저축률 N%를 달성했어요"
- [ ] 순수 함수로 작성 (사이드이펙트 없음, 테스트 가능)

### [신규] src/features/stats/components/InsightCard.tsx

- [ ] `InsightMessage[]` props 수신
- [ ] 각 메시지 행 렌더링: type별 아이콘 + 배경색 + 텍스트
  - warning: 주황 배경 (#FEF3C7), 경고 아이콘
  - saving: 초록 배경 (#D1FAE5), 절약 아이콘
  - achievement: 파랑 배경 (#DBEAFE), 달성 아이콘
  - info: 회색 배경, 정보 아이콘
- [ ] 빈 배열 전달 시 null 반환 (컴포넌트 숨김)

### [수정] src/features/stats/hooks/useStats.ts (또는 신규 useInsights.ts)

- [ ] 현재 달 monthlySummary 조회 (기존)
- [ ] 전월 summary 추가 조회: `dayjs(yearMonth).subtract(1, 'month').format('YYYY-MM')`
- [ ] `useInsights(yearMonth)`: useMemo로 `generateInsights(current, prev)` 호출
  - current 또는 prev 로딩 중에는 빈 배열 반환

### [수정] src/features/stats/screens/StatsScreen.tsx

- [ ] `useInsights(currentMonth)` 훅 추가
- [ ] 월 선택기 바로 아래 `<InsightCard messages={insights} />` 삽입
- [ ] insights 빈 배열이면 InsightCard 미렌더링

---

## 6. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 전월 데이터 없음 (앱 사용 첫 달) | 단순 이번달 요약 info 1개만 표시 |
| 전월 totalExpense = 0 | 증감 비교 건너뜀, 다른 인사이트 우선 표시 |
| 수입 = 0인 달 | 저축률 계산 건너뜀 (0% 처리, info 생성 안 함) |
| 카테고리 이름이 긴 경우 | 메시지 문자열 자동 줄바꿈 처리 |
| 인사이트 4개 이상 생성되는 경우 | 우선순위 기준으로 상위 3개만 반환 |

---

## 7. 검증 항목

- [ ] 전월 데이터 있을 때 인사이트 카드 표시
- [ ] 전월 데이터 없을 때 단순 요약 1개만 표시
- [ ] 지출 증가 → warning 인사이트 생성
- [ ] 지출 감소 → saving 인사이트 생성
- [ ] 저축액 양수 → info 인사이트 생성
- [ ] 지출 > 수입 → warning 인사이트 생성
- [ ] 최대 3개 인사이트 표시 제한 확인
- [ ] type별 배경색 구분 확인
- [ ] insightGenerator.ts 단위 테스트 작성 및 통과
