# #14 자산 목표 설정 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(HomeScreen, MoreMenuScreen, financialStatus 데이터 구조, AssetScreen) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- "1억 모으기"처럼 목표 금액을 설정하면 현재 자산 대비 달성률을 홈 화면에서 확인한다
- 목표를 달성했을 때 축하 애니메이션으로 성취감을 느낀다
- 목표를 수정하거나 삭제하여 새로운 목표로 교체할 수 있다

---

## 2. 기능 요구사항

### 목표 설정

- 목표명 + 목표 금액 입력
- 활성 목표는 1개만 유지 (새 목표 생성 시 기존 목표 비활성화)

### 홈 화면 진행률 카드

- 목표 설정된 경우에만 표시
- 현재 실자산 / 목표 금액 / 남은 금액 표시
- 달성률 진행 바 + 퍼센트

### 달성 시 축하

- 진행률 100% 도달 시 축하 애니메이션
- 간단한 React Native Animated API 활용 (Lottie 미도입 시)

---

## 3. Firestore 데이터 모델

```
families/{familyId}/goals/{id}
  title: string          // "1억 모으기"
  targetAmount: number   // 목표 금액 (원)
  createdAt: Timestamp
  createdBy: string      // uid
  isActive: boolean      // 활성 목표 = true (동시에 1개만)
```

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
export interface AssetGoal {
  id: string;
  title: string;
  targetAmount: number;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
}

export interface AssetGoalProgress {
  goal: AssetGoal;
  currentAmount: number;    // 현재 실자산 총액 (financialStatus 최신 데이터)
  remaining: number;        // targetAmount - currentAmount (음수 가능 = 초과 달성)
  percentage: number;       // min(currentAmount / targetAmount * 100, 100)
  isAchieved: boolean;      // currentAmount >= targetAmount
}
```

---

## 5. 파일별 TODO

### [신규] src/features/goals/services/goalService.ts

- [ ] `getActiveGoal(familyId): Promise<AssetGoal | null>`
  - `isActive === true` 쿼리, 1개 반환
- [ ] `createGoal(familyId, data, uid): Promise<string>`
  - 기존 활성 목표 먼저 비활성화 (`isActive: false` 업데이트)
  - 새 목표 생성 (`isActive: true`)
- [ ] `updateGoal(familyId, id, data): Promise<void>`
  - title, targetAmount 수정 가능
- [ ] `deleteGoal(familyId, id): Promise<void>`
  - 활성 목표 삭제 시 다른 목표 자동 활성화 없음 (단순 삭제)

### [신규] src/features/goals/hooks/useGoals.ts

- [ ] `useActiveGoal()` — useQuery
  - queryKey: `['goals', familyId, 'active']`
  - staleTime: 5분
- [ ] `useGoalProgress(): AssetGoalProgress | null`
  - useMemo: `useActiveGoal()` + 현재 실자산 데이터 조합
  - 현재 실자산: `financialStatus` 최신 문서의 `realAssetTotal`
  - 목표 없으면 null 반환
- [ ] `useCreateGoal()` — useMutation
  - 성공 시 `['goals', familyId]` invalidate
- [ ] `useUpdateGoal()` — useMutation
  - 성공 시 invalidate
- [ ] `useDeleteGoal()` — useMutation
  - 성공 시 invalidate

### [신규] src/features/goals/screens/GoalSettingScreen.tsx

- [ ] Header: "자산 목표 설정"
- [ ] 기존 활성 목표 있으면 현재 진행률 카드 표시 (수정 / 삭제 버튼)
- [ ] 새 목표 입력 폼:
  - 목표명: TextInput (최대 20자)
  - 목표 금액: 숫자 TextInput (`formatInputNumber` 유틸 재사용)
- [ ] [저장] 버튼: `createGoal` 또는 `updateGoal` 분기
- [ ] 삭제 확인 다이얼로그: "목표를 삭제하면 진행률이 사라져요"

### [신규] src/features/home/components/AssetGoalCard.tsx

- [ ] `AssetGoalProgress` props 수신
- [ ] 목표명 + 아이콘 표시
- [ ] 현재 자산 / 목표 금액 / 남은 금액 표시 (formatCurrency 활용)
- [ ] 달성률 진행 바 + 퍼센트 (percentage 기준)
- [ ] `isAchieved === true` 시 축하 애니메이션:
  - React Native Animated로 간단한 펄스 또는 색상 전환 효과
  - "목표 달성!" 텍스트 + 특별 배경색
- [ ] 카드 탭 시 GoalSettingScreen 이동

### [수정] src/features/home/screens/HomeScreen.tsx

- [ ] `useGoalProgress()` 훅 추가
- [ ] 실자산 카드 아래에 `<AssetGoalCard>` 추가 (goalProgress 있을 때만)

### [수정] src/features/settings/screens/MoreMenuScreen.tsx

- [ ] "자산 목표 설정" 메뉴 항목 추가
- [ ] `navigation.navigate('GoalSetting')` 연결

### [수정] src/app/navigation/MainTabNavigator.tsx

- [ ] `MoreStackParamList`에 `GoalSetting` 추가
- [ ] `GoalSettingScreen` import 및 Screen 등록

---

## 6. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 활성 목표 없음 | AssetGoalCard 숨김 |
| financialStatus 데이터 없음 | currentAmount = 0 으로 처리 |
| 현재 자산 > 목표 (초과 달성) | percentage = 100% 클램프, "목표 달성!" 표시 |
| targetAmount = 0 입력 | 폼 유효성 검사로 차단 (1원 이상 필수) |
| 새 목표 생성 시 기존 목표 비활성화 중 에러 | 트랜잭션 처리로 원자성 보장 |

---

## 7. 검증 항목

- [ ] 목표 생성 → Firestore `goals` 문서 생성 + `isActive: true` 확인
- [ ] 새 목표 생성 시 기존 활성 목표 `isActive: false`로 변경 확인
- [ ] HomeScreen AssetGoalCard 표시 (목표 설정 후)
- [ ] 달성률 계산 정확성 (현재 자산 / 목표 금액)
- [ ] 진행률 100% 클램프 확인 (초과 달성 시)
- [ ] 목표 달성 시 축하 애니메이션 표시
- [ ] 목표 삭제 시 카드 숨김 확인
- [ ] 목표 수정 후 HomeScreen 카드 갱신 확인
