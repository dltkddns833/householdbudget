# #6 저축률 트래킹 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(HomeScreen, MoreMenuScreen, familyService, monthlySummaries 구조) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 홈 화면에서 이번달 저축률을 바로 확인한다
- 목표 저축률을 설정해두면 달성 여부를 게이지로 한눈에 파악한다
- 지출이 수입을 초과한 달에는 음수 저축률이 빨간색으로 표시되어 경고를 인지한다

---

## 2. 기능 요구사항

### 저축률 표시

- 홈 화면 메트릭 영역에 SavingRateCard 추가
- 저축률 = (수입 - 지출) / 수입 × 100 (소수점 1자리)
- 저축액 = 수입 - 지출 (원 단위)

### 목표 저축률

- MoreMenu → "저축률 목표 설정" 화면에서 0~100% 입력
- 0% 입력 = 목표 없음 (게이지 숨김)
- 가족 단위 목표 (가족 루트 문서에 저장)

### 시각적 표현

- 목표 설정 시: 목표 기준 게이지 바 표시
- 목표 달성 시: 초록색 + "목표 달성!" 텍스트
- 저축률 음수 시: 빨간색 표시
- 목표 미설정 시: 저축률 수치 + 저축액만 표시

---

## 3. Firestore 데이터 모델 변경

```
families/{familyId}   ← 루트 문서에 필드 추가
  + savingRateGoal?: number   // 목표 저축률 (0~100 정수, 없으면 미설정)
```

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
// 기존 Family 인터페이스 확장
export interface Family {
  // ... 기존 필드
  savingRateGoal?: number;  // 0~100, undefined = 미설정
}

export interface SavingRateSummary {
  savingRate: number;        // 소수점 1자리 (음수 가능)
  savingAmount: number;      // 원 단위 (음수 가능)
  goalRate: number;          // 목표 저축률 (0이면 미설정)
  isGoalAchieved: boolean;   // savingRate >= goalRate && goalRate > 0
  status: 'positive' | 'negative' | 'zero';
}
```

---

## 5. 파일별 TODO

### [신규] src/features/home/hooks/useSavingRate.ts

- [ ] `useSavingRate(yearMonth?): SavingRateSummary`
  - `useMonthlySummary(yearMonth)`에서 totalIncome, totalExpense 가져오기
  - `useFamily()`에서 savingRateGoal 가져오기
  - 계산:
    - `savingAmount = totalIncome - totalExpense`
    - `savingRate = totalIncome > 0 ? round(savingAmount / totalIncome * 100, 1) : 0`
    - `isGoalAchieved = goalRate > 0 && savingRate >= goalRate`
    - `status = savingAmount > 0 ? 'positive' : savingAmount < 0 ? 'negative' : 'zero'`

### [신규] src/features/home/components/SavingRateCard.tsx

- [ ] `SavingRateSummary` props 수신
- [ ] 저축률 수치 표시 (상태별 색상: positive=초록, negative=빨강, zero=회색)
- [ ] 저축액 표시 (formatCurrency 유틸 활용)
- [ ] 목표 설정 시 게이지 바 렌더링
  - 게이지 진행률: `min(savingRate / goalRate * 100, 100)`
  - 목표 달성 전: primary 색상
  - 목표 달성: 초록색 + "목표 달성!" 텍스트
  - 목표 미달 시: "목표까지 N%p 남음" 텍스트
- [ ] 목표 미설정 시 게이지 영역 숨김

### [신규] src/features/settings/screens/SavingRateGoalScreen.tsx

- [ ] Header: "저축률 목표 설정"
- [ ] 슬라이더 또는 숫자 TextInput (0~100 범위)
- [ ] 현재 설정값 기본값으로 표시
- [ ] 0% 입력 안내: "0%는 목표 없음으로 설정됩니다"
- [ ] [저장] 버튼: `updateFamilySavingRateGoal` 호출 후 뒤로 이동

### [수정] src/features/auth/services/familyService.ts

- [ ] `updateSavingRateGoal(familyId, goal: number): Promise<void>`
  - `families/{familyId}` 문서 merge 업데이트

### [수정] src/features/home/screens/HomeScreen.tsx

- [ ] `useSavingRate(currentMonth)` 훅 추가
- [ ] 메트릭 카드 영역에 `<SavingRateCard>` 추가
  - totalIncome > 0인 달에만 표시 (수입 없는 달은 숨김)

### [수정] src/features/settings/screens/MoreMenuScreen.tsx

- [ ] "저축률 목표 설정" 메뉴 항목 추가
- [ ] `navigation.navigate('SavingRateGoal')` 연결

### [수정] src/app/navigation/MainTabNavigator.tsx

- [ ] `MoreStackParamList`에 `SavingRateGoal` 추가
- [ ] `SavingRateGoalScreen` import 및 Screen 등록

---

## 6. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 수입 = 0원인 달 | 저축률 0% 처리, SavingRateCard 숨김 |
| 지출 > 수입 (음수 저축률) | 빨간색 표시, 게이지 0%으로 표시 |
| 목표 저축률 = 0% | 게이지 숨김, 저축률과 저축액만 표시 |
| 저축률이 목표의 2배 이상 초과 | 게이지 100%로 클램프 |
| Family 문서에 savingRateGoal 없음 | undefined = 미설정으로 처리 |

---

## 7. 검증 항목

- [ ] 홈 화면 저축률 카드 표시 (수입 > 0인 달)
- [ ] 저축률 계산 정확성 검증
- [ ] 수입 0원인 달 카드 숨김 확인
- [ ] 목표 저축률 설정 → Firestore families 문서 저장 확인
- [ ] 목표 달성 시 초록색 + "목표 달성!" 표시 확인
- [ ] 목표 미달 시 "N%p 남음" 텍스트 표시
- [ ] 목표 미설정 (0%) 시 게이지 숨김
- [ ] 지출 > 수입 시 음수 저축률 빨간색 표시
