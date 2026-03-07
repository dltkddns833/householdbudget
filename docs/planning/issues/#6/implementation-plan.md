# #6 저축률 트래킹 — 구현 계획

## Context

홈 화면 메트릭 카드 영역에 이번달 저축률 카드를 추가하고, MoreMenu에서 목표 저축률을 설정할 수 있게 한다.
수입이 있는 달에만 카드를 표시하며, 목표 달성 여부를 게이지 바로 시각화한다.

---

## 주의사항

- 기존 패턴 따르기: useState + Alert.alert (react-hook-form 미사용)
- `useTransactions(currentMonth).summary`로 `totalIncome`, `totalExpense` 획득 (queryKey 재사용)
- `useAuthStore().family.savingRateGoal`로 목표 저축률 획득 (별도 훅 불필요)
- `authService.ts`에 `updateSavingRateGoal` 추가 (familyService.ts 별도 파일 없음, authService에 family 함수 모여 있음)
- `HomeScreen`의 `metricsRow`는 현재 2개 카드 — `SavingRateCard`는 별도 전체 폭 카드로 아래에 추가
- 기존 유틸 재사용:
  - `formatCurrency()` — `src/shared/utils/currency.ts`
  - `useAuthStore()` — familyId, family.savingRateGoal 획득
  - `useTransactions()` — summary(totalIncome, totalExpense) 획득

---

## 구현 순서

### 1단계: 타입 추가

**수정 파일:** `src/shared/types/index.ts`

```ts
// Family 인터페이스에 필드 추가
export interface Family {
  // ... 기존 필드
  savingRateGoal?: number; // 0~100 정수, undefined = 미설정
}

// 신규 타입 추가
export interface SavingRateSummary {
  savingRate: number;      // 소수점 1자리 (음수 가능)
  savingAmount: number;    // 원 단위 (음수 가능)
  goalRate: number;        // 목표 저축률 (0이면 미설정)
  isGoalAchieved: boolean;
  status: 'positive' | 'negative' | 'zero';
}
```

### 2단계: 서비스 함수 추가

**수정 파일:** `src/features/auth/services/authService.ts`

```ts
async updateSavingRateGoal(familyId: string, goal: number): Promise<void> {
  await firestore().collection('families').doc(familyId).update({ savingRateGoal: goal });
}
```

### 3단계: useSavingRate 훅 생성

**신규 파일:** `src/features/home/hooks/useSavingRate.ts`

- `useTransactions(yearMonth).summary`에서 totalIncome, totalExpense 획득
- `useAuthStore().family?.savingRateGoal`에서 목표 저축률 획득
- 계산 로직:
  - `savingAmount = totalIncome - totalExpense`
  - `savingRate = totalIncome > 0 ? round(savingAmount / totalIncome * 100, 1) : 0`
  - `isGoalAchieved = goalRate > 0 && savingRate >= goalRate`
  - `status = savingAmount > 0 ? 'positive' : savingAmount < 0 ? 'negative' : 'zero'`
- `totalIncome === 0`이면 `null` 반환 (카드 숨김용)

### 4단계: SavingRateCard 컴포넌트 생성

**신규 파일:** `src/features/home/components/SavingRateCard.tsx`

- Props: `summary: SavingRateSummary`
- 상태별 색상:
  - `positive`: `colors.income` (초록)
  - `negative`: `colors.expense` (빨강)
  - `zero`: `colors.textTertiary` (회색)
- 목표 설정 시 (`goalRate > 0`) 게이지 바 렌더링:
  - 진행률: `Math.min(savingRate / goalRate * 100, 100)` (음수면 0으로 클램프)
  - 목표 달성: 초록색 + "목표 달성!" 텍스트
  - 목표 미달: primary 색상 + "목표까지 N%p 남음" 텍스트
- 목표 미설정 시: 게이지 숨김, 저축률 + 저축액만 표시
- 스타일: `Card` 컴포넌트 활용, `metricsRow` 아래 전체 폭으로 배치

### 5단계: SavingRateGoalScreen 생성

**신규 파일:** `src/features/settings/screens/SavingRateGoalScreen.tsx`

- Header: "저축률 목표 설정" (뒤로가기 버튼)
- 숫자 TextInput (0~100, keyboardType="number-pad")
- 현재 `family.savingRateGoal` 값을 초기값으로 표시
- 0% 입력 시 안내 문구: "0%는 목표 없음으로 설정됩니다"
- [저장] 버튼: `authService.updateSavingRateGoal(familyId, goal)` 호출 후 뒤로 이동
- 저장 성공 후 `authStore`의 family 상태 업데이트 필요 → `authStore.setFamily` or 직접 reload

### 6단계: 기존 파일 수정

**수정 파일:** `src/features/home/screens/HomeScreen.tsx`

- `useSavingRate(currentMonth)` 훅 추가
- `metricsRow` 아래에 `{savingRateSummary && <SavingRateCard summary={savingRateSummary} />}` 삽입

**수정 파일:** `src/features/settings/screens/MoreMenuScreen.tsx`

- `menuItems` 배열에 항목 추가 (정기 지출 관리 다음):
  ```ts
  {
    icon: 'trending-up',
    label: '저축률 목표 설정',
    subtitle: family?.savingRateGoal ? `목표: ${family.savingRateGoal}%` : '목표 없음',
    onPress: () => navigation.navigate('SavingRateGoal'),
  }
  ```

**수정 파일:** `src/app/navigation/MainTabNavigator.tsx`

- `SavingRateGoalScreen` import 추가
- `MoreStackScreen`에 `<MoreStack.Screen name="SavingRateGoal" component={SavingRateGoalScreen} />` 추가

---

## 수정/신규 파일 목록

| 파일 | 작업 |
|------|------|
| `src/shared/types/index.ts` | `Family`에 `savingRateGoal` 추가, `SavingRateSummary` 타입 신규 |
| `src/features/auth/services/authService.ts` | `updateSavingRateGoal()` 함수 추가 |
| `src/features/home/hooks/useSavingRate.ts` | **신규** — 저축률 계산 훅 |
| `src/features/home/components/SavingRateCard.tsx` | **신규** — 저축률 카드 컴포넌트 |
| `src/features/settings/screens/SavingRateGoalScreen.tsx` | **신규** — 목표 저축률 설정 화면 |
| `src/features/home/screens/HomeScreen.tsx` | `useSavingRate` + `SavingRateCard` 추가 |
| `src/features/settings/screens/MoreMenuScreen.tsx` | "저축률 목표 설정" 메뉴 항목 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | `SavingRateGoal` 스크린 등록 |

---

## 엣지 케이스 처리

| 케이스 | 처리 |
|--------|------|
| 수입 = 0원인 달 | `useSavingRate` null 반환 → `SavingRateCard` 숨김 |
| 지출 > 수입 (음수 저축률) | 빨간색, 게이지 0%으로 클램프 |
| 목표 저축률 미설정 (0 or undefined) | 게이지 숨김 |
| 저축률이 목표 초과 | 게이지 100%로 클램프 |
| Family에 savingRateGoal 없음 | `goalRate = 0`으로 처리 |

---

## 검증 방법

1. 홈 화면 → 수입 있는 달: 저축률 카드 표시 확인
2. 수입 0원인 달: 카드 숨김 확인
3. 저축률 계산 정확성 (예: 수입 200만, 지출 155.5만 → 22.3%)
4. MoreMenu → "저축률 목표 설정" 항목 확인 및 이동
5. 목표 입력 후 저장 → Firestore `families/{familyId}.savingRateGoal` 저장 확인
6. 홈 화면 게이지 바 표시 + 달성 전: "목표까지 N%p 남음"
7. 저축률 >= 목표: 초록색 + "목표 달성!" 표시
8. 목표 0% 설정: 게이지 숨김
9. 지출 > 수입: 빨간색 표시, 게이지 0%
