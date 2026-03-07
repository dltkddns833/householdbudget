# #6 저축률 트래킹

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/6

## 개요

매달 저축률을 계산하고 목표 달성 여부를 추적한다.
홈 화면에 이번달 저축률을 표시하고 목표 저축률 달성 여부를 시각적으로 보여준다.

---

## Firestore 데이터 모델

### 목표 저축률 저장

```
families/{familyId}  (루트 문서에 필드 추가)
  - savingRateGoal?: number  // 목표 저축률 (0~100 정수)
```

> 가족 단위 목표이므로 가족 루트 문서에 저장. 별도 컬렉션 불필요.

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
export interface SavingRateSummary {
  savingRate: number;        // (income - expense) / income * 100 (소수점 1자리)
  savingAmount: number;      // income - expense (원)
  goalRate: number;          // 목표 저축률 (0이면 미설정)
  isGoalAchieved: boolean;
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/home/components/SavingRateCard.tsx` | 홈 화면 저축률 카드 컴포넌트 |
| `src/features/settings/screens/SavingRateGoalScreen.tsx` | 목표 저축률 설정 화면 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | SavingRateSummary 타입 추가, Family 인터페이스에 savingRateGoal 추가 |
| `src/features/home/screens/HomeScreen.tsx` | SavingRateCard 추가 |
| `src/features/settings/screens/MoreMenuScreen.tsx` | "저축률 목표 설정" 메뉴 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | MoreStack에 SavingRateGoal 스크린 추가 |
| `src/features/auth/services/familyService.ts` | savingRateGoal 업데이트 함수 추가 |

---

## 저축률 계산

```typescript
// src/features/home/hooks/useSavingRate.ts
useSavingRate(yearMonth?): SavingRateSummary
// 계산:
//   savingAmount = totalIncome - totalExpense
//   savingRate = totalIncome > 0 ? (savingAmount / totalIncome * 100) : 0
//   isGoalAchieved = goalRate > 0 && savingRate >= goalRate
```

---

## 화면 구성 / UX

### HomeScreen — SavingRateCard

메트릭 카드 영역에 저축률 카드 추가:

```
┌──────────────────────────────┐
│ 이번달 저축률                 │
│                              │
│   22.5%   ██████████░░░░░  ← 목표 30% 기준 게이지
│                              │
│   저축액: 450,000원           │
│   목표 달성까지: 7.5%p 남음   │
└──────────────────────────────┘
```

- 목표 미설정 시: 게이지 없이 저축률과 저축액만 표시
- 목표 달성 시: 초록색 + "목표 달성!" 텍스트
- 저축률 음수(지출 > 수입): 빨간색 표시

### SavingRateGoalScreen

```
Header: "저축률 목표 설정"

목표 저축률: [  30  ] %  (슬라이더 또는 숫자 입력)
  0% = 목표 없음

[저장] 버튼
```

---

## 검증 항목

- [ ] 홈 화면 저축률 카드 표시
- [ ] 저축률 계산 정확성 (수입 0원 → 0% 처리)
- [ ] 목표 저축률 설정 → Firestore 저장 확인
- [ ] 목표 달성 시 색상/텍스트 변경 확인
- [ ] 목표 미설정 시 게이지 숨김
- [ ] 지출 > 수입 시 음수 저축률 빨간색 표시
