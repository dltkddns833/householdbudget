# #2 정기 지출 (고정비) 관리

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/2

## 개요

매달 반복되는 거래(월세, 구독, 보험 등)를 등록하고 자동으로 이번 달 거래에 추가한다.
현재 매번 수동으로 같은 거래를 등록해야 하는 불편함을 해소하고, 고정비 누락을 방지한다.

---

## Firestore 데이터 모델

```
families/{familyId}/recurringTransactions/{id}
  - title: string           // 거래명 (예: "월세", "넷플릭스")
  - amount: number          // 금액 (원)
  - category: string        // 카테고리 키
  - dayOfMonth: number      // 매월 몇 일 (1~31)
  - type: 'expense' | 'income'
  - isActive: boolean       // 비활성화 시 자동 생성 안 함
  - createdAt: Timestamp
  - lastAppliedYearMonth?: string  // 마지막으로 적용된 yearMonth ("YYYY-MM")
```

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  type: 'expense' | 'income';
  isActive: boolean;
  createdAt: Timestamp;
  lastAppliedYearMonth?: string;
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/recurring/services/recurringService.ts` | Firestore CRUD |
| `src/features/recurring/hooks/useRecurring.ts` | React Query 훅 |
| `src/features/recurring/screens/RecurringListScreen.tsx` | 정기 거래 목록 화면 |
| `src/features/recurring/screens/RecurringFormScreen.tsx` | 정기 거래 추가/수정 폼 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | RecurringTransaction 타입 추가 |
| `src/features/settings/screens/MoreMenuScreen.tsx` | "정기 지출 관리" 메뉴 항목 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | MoreStack에 RecurringList, RecurringForm 스크린 추가 |
| `src/features/home/screens/HomeScreen.tsx` | 이번 달 미반영 고정비 알림 배너 추가 |

---

## 서비스 (`recurringService.ts`)

```typescript
const recurringCol = (familyId: string) =>
  firestore().collection('families').doc(familyId)
    .collection('recurringTransactions');

getRecurringList(familyId): Promise<RecurringTransaction[]>
createRecurring(familyId, data): Promise<string>
updateRecurring(familyId, id, data): Promise<void>
deleteRecurring(familyId, id): Promise<void>

// 이번 달 아직 생성 안 된 고정비 목록
getPendingRecurring(familyId, yearMonth): Promise<RecurringTransaction[]>
  // lastAppliedYearMonth !== yearMonth && isActive === true 필터링

// 개별 고정비를 이번 달 실제 거래로 추가
applyRecurring(familyId, recurring, yearMonth): Promise<void>
  // transactions에 추가 후 lastAppliedYearMonth 업데이트
```

---

## 훅 (`useRecurring.ts`)

```typescript
useRecurringList()         // useQuery - 정기 거래 목록
useCreateRecurring()       // useMutation - 등록
useUpdateRecurring()       // useMutation - 수정
useDeleteRecurring()       // useMutation - 삭제
usePendingRecurring(yearMonth)  // useQuery - 미반영 고정비 목록
useApplyRecurring()        // useMutation - 거래 반영
```

queryKey: `['recurring', familyId]`

---

## 화면 구성 / UX

### RecurringListScreen

**진입점**: MoreMenu → "정기 지출 관리"

```
Header: "정기 지출"  [+ 추가 버튼]

이번 달 미반영 고정비 섹션 (있을 때만):
  [배너] N개의 고정비가 아직 이번 달에 반영되지 않았어요
  고정비 목록 (각 항목에 [반영] 버튼)

전체 정기 거래 목록:
  각 항목:
    - 카테고리 아이콘 + 제목 + 매월 N일
    - 금액 (수입은 +색상, 지출은 -색상)
    - [활성/비활성] 토글
  스와이프 삭제
```

### RecurringFormScreen

```
Header: "정기 지출 추가" / "정기 지출 수정"

거래명 (텍스트 입력)
금액 (숫자 입력)
유형 (수입 / 지출 토글)
카테고리 선택
매월 며칠 (1~31 숫자 입력)

[저장] 버튼
```

### HomeScreen 수정

이번 달 미반영 고정비가 있으면 홈 상단에 알림 배너:
```
[!] 월세 등 2건의 고정비가 반영 안 됐어요 → [확인하기]
```

---

## 검증 항목

- [ ] 정기 거래 추가 → Firestore `recurringTransactions` 문서 생성 확인
- [ ] 목록 화면에서 활성/비활성 토글 동작
- [ ] 스와이프 삭제 동작
- [ ] 미반영 고정비 [반영] 버튼 → 실제 transactions 문서 생성 확인
- [ ] 반영 후 `lastAppliedYearMonth` 업데이트 확인
- [ ] HomeScreen 배너 표시/숨김 동작 (미반영 없으면 숨김)
- [ ] 비활성 거래는 미반영 목록에서 제외 확인
