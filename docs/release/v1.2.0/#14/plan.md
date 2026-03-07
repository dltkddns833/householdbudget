# #14 자산 목표 설정

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/14

## 개요

"1억 모으기" 같은 목표 금액을 설정하고 달성 진행률을 홈 화면에서 확인한다.
현재 실자산 총액과 목표 금액을 비교하여 동기부여를 제공한다.

---

## Firestore 데이터 모델

```
families/{familyId}/goals/{id}
  - title: string          // 목표명 (예: "1억 모으기", "전세 보증금")
  - targetAmount: number   // 목표 금액 (원)
  - createdAt: Timestamp
  - isActive: boolean      // 활성 목표 (1개만 활성화)
```

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
export interface AssetGoal {
  id: string;
  title: string;
  targetAmount: number;
  createdAt: Timestamp;
  isActive: boolean;
}

export interface AssetGoalProgress {
  goal: AssetGoal;
  currentAmount: number;   // 현재 실자산 총액
  remaining: number;       // targetAmount - currentAmount
  percentage: number;      // currentAmount / targetAmount * 100 (최대 100)
  isAchieved: boolean;
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/goals/services/goalService.ts` | Firestore CRUD |
| `src/features/goals/hooks/useGoals.ts` | React Query 훅 |
| `src/features/goals/screens/GoalSettingScreen.tsx` | 자산 목표 설정 화면 |
| `src/features/home/components/AssetGoalCard.tsx` | 홈 화면 목표 진행률 카드 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | AssetGoal, AssetGoalProgress 타입 추가 |
| `src/features/settings/screens/MoreMenuScreen.tsx` | "자산 목표 설정" 메뉴 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | MoreStack에 GoalSetting 스크린 추가 |
| `src/features/home/screens/HomeScreen.tsx` | AssetGoalCard 추가 |

---

## 서비스 (`goalService.ts`)

```typescript
const goalsCol = (familyId: string) =>
  firestore().collection('families').doc(familyId).collection('goals');

getActiveGoal(familyId): Promise<AssetGoal | null>
  // isActive === true 인 목표 조회 (1개)
createGoal(familyId, data): Promise<string>
  // 생성 전 기존 활성 목표 비활성화
updateGoal(familyId, id, data): Promise<void>
deleteGoal(familyId, id): Promise<void>
```

---

## 훅 (`useGoals.ts`)

```typescript
useActiveGoal()          // useQuery - 활성 목표 조회
useGoalProgress()        // useMemo - 실자산 + 목표 합산 → AssetGoalProgress
  // 실자산: financialStatus 최신 데이터에서 총 자산 합계
useCreateGoal()          // useMutation
useUpdateGoal()          // useMutation
useDeleteGoal()          // useMutation
```

queryKey: `['goals', familyId]`

---

## 화면 구성 / UX

### HomeScreen — AssetGoalCard

실자산 카드 아래에 목표 진행률 카드 추가 (목표 설정된 경우에만):

```
┌──────────────────────────────────┐
│ 🎯 1억 모으기                     │
│                                  │
│ 현재 자산   목표까지 남은 금액     │
│  7,800만원   2,200만원           │
│                                  │
│ [████████████████░░░░]  78%      │
└──────────────────────────────────┘
```

- 목표 달성(100%) 시 축하 애니메이션 (Lottie 또는 간단한 RN 애니메이션)
- 목표 없으면 카드 숨김

### GoalSettingScreen

```
Header: "자산 목표 설정"

현재 활성 목표 (있을 경우):
  ┌──────────────────────────┐
  │ 1억 모으기  78%          │
  │ [수정]      [삭제]       │
  └──────────────────────────┘

새 목표 설정:
  목표명: [_______________]
  목표 금액: [___________] 원

  [저장]
```

---

## 검증 항목

- [ ] 목표 생성 → Firestore `goals` 문서 생성 확인
- [ ] 목표 설정 시 HomeScreen AssetGoalCard 표시
- [ ] 진행률 계산 정확성 (현재 자산 / 목표 금액)
- [ ] 목표 달성(100%) 시 축하 애니메이션
- [ ] 목표 없으면 카드 숨김
- [ ] 기존 활성 목표 교체 시 이전 목표 비활성화 확인
- [ ] 목표 삭제 시 카드 숨김
