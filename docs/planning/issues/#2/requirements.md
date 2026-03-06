# #2 정기 지출 (고정비) 관리 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(HomeScreen, MoreMenuScreen, types, transactionService) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 매달 똑같이 나가는 월세, 넷플릭스, 보험료를 한 번만 등록해두면 반복 입력 없이 관리한다
- 월 초에 앱을 켜면 아직 이번 달에 반영 안 된 고정비 목록을 확인하고 한 번에 반영한다
- 고정비를 비활성화하면 자동 생성 없이 목록에만 남긴다

---

## 2. 기능 요구사항

### 정기 거래 등록/수정/삭제

- 제목, 금액, 유형(수입/지출), 카테고리, 매월 며칠 입력
- 활성/비활성 토글 (비활성화 시 미반영 목록에서 제외)
- 스와이프 삭제

### 이번 달 반영

- 미반영 고정비 = `isActive === true && lastAppliedYearMonth !== 현재 yearMonth`
- 개별 [반영] 버튼으로 실제 거래(transactions) 생성
- 반영 후 `lastAppliedYearMonth` 업데이트

### 홈 화면 알림

- 미반영 고정비가 1건 이상이면 홈 상단 배너 표시
- 배너 탭 시 RecurringListScreen으로 이동

---

## 3. Firestore 스키마 상세

```
families/{familyId}/recurringTransactions/{id}
  title: string               // 거래명
  amount: number              // 원 단위
  category: string            // categories.ts의 카테고리 키
  dayOfMonth: number          // 1~31
  type: 'expense' | 'income'
  isActive: boolean
  createdAt: Timestamp
  createdBy: string           // uid
  lastAppliedYearMonth?: string  // "YYYY-MM"
```

- `lastAppliedYearMonth` 없음 = 한 번도 반영 안 됨
- 반영 시 생성되는 transaction의 `createdBy`는 반영한 사용자 uid

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  dayOfMonth: number;
  type: 'expense' | 'income';
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  lastAppliedYearMonth?: string;
}
```

---

## 5. 파일별 TODO

### [신규] src/features/recurring/services/recurringService.ts

- [ ] `getRecurringList(familyId): Promise<RecurringTransaction[]>`
  - `createdAt` 오름차순 정렬
- [ ] `createRecurring(familyId, data, uid): Promise<string>`
- [ ] `updateRecurring(familyId, id, data): Promise<void>`
- [ ] `deleteRecurring(familyId, id): Promise<void>`
- [ ] `getPendingRecurring(familyId, yearMonth): Promise<RecurringTransaction[]>`
  - `isActive === true && (lastAppliedYearMonth 없음 || lastAppliedYearMonth !== yearMonth)` 필터
- [ ] `applyRecurring(familyId, recurring, yearMonth, uid): Promise<void>`
  - transactions에 새 거래 추가 (date는 `dayOfMonth` 기준 해당 월 날짜)
  - `lastAppliedYearMonth` 업데이트 (merge)

### [신규] src/features/recurring/hooks/useRecurring.ts

- [ ] `useRecurringList()` — useQuery, queryKey: `['recurring', familyId]`
- [ ] `usePendingRecurring(yearMonth)` — useQuery, queryKey: `['recurring-pending', familyId, yearMonth]`
- [ ] `useCreateRecurring()` — useMutation, 성공 시 `['recurring', familyId]` invalidate
- [ ] `useUpdateRecurring()` — useMutation, 성공 시 invalidate
- [ ] `useDeleteRecurring()` — useMutation, 성공 시 invalidate
- [ ] `useApplyRecurring()` — useMutation, 성공 시 `['recurring-pending', ...]`, `['transactions', ...]` invalidate

### [신규] src/features/recurring/screens/RecurringListScreen.tsx

- [ ] Header: "정기 지출" + 우상단 [+] 버튼
- [ ] 미반영 섹션 (pending 있을 때만): 건수 표시 + 각 항목에 [반영] 버튼
- [ ] 전체 목록: 카테고리 아이콘 + 제목 + "매월 N일" + 금액 + 활성 토글
- [ ] 스와이프 삭제 (react-native-gesture-handler Swipeable 활용)
- [ ] 빈 목록 상태: "등록된 정기 지출이 없어요" 안내

### [신규] src/features/recurring/screens/RecurringFormScreen.tsx

- [ ] 신규/수정 모드 구분 (route.params.recurring 유무)
- [ ] react-hook-form + zod 유효성 검사
  - title: 필수, 최대 20자
  - amount: 필수, 1원 이상
  - dayOfMonth: 1~31 숫자
- [ ] 카테고리 선택: 유형에 따라 EXPENSE_CATEGORIES / INCOME_CATEGORIES 표시
- [ ] 저장 버튼: create or update 분기 후 뒤로 이동

### [수정] src/features/home/screens/HomeScreen.tsx

- [ ] `usePendingRecurring(currentMonth)` 훅 추가
- [ ] pending 1건 이상이면 배너 컴포넌트 렌더링
  - "월세 등 N건의 고정비가 반영 안 됐어요" + [확인하기] 버튼
  - [확인하기] 탭 시 RecurringListScreen 이동 (`navigation.navigate`)

### [수정] src/features/settings/screens/MoreMenuScreen.tsx

- [ ] "정기 지출 관리" 메뉴 항목 추가 (예산 설정 아래)
- [ ] `navigation.navigate('RecurringList')` 연결

### [수정] src/app/navigation/MainTabNavigator.tsx

- [ ] `MoreStackParamList`에 `RecurringList`, `RecurringForm` 추가
- [ ] `RecurringListScreen`, `RecurringFormScreen` import 및 Screen 등록

---

## 6. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| dayOfMonth > 해당 월 말일 (예: 31일인데 2월) | 해당 월 말일로 clamp |
| 이미 반영한 월에 다시 [반영] 누름 | `lastAppliedYearMonth` 체크로 버튼 비활성화 |
| 비활성화된 거래 | 미반영 목록 및 홈 배너에서 제외 |
| 반영 중 네트워크 오류 | 에러 토스트 표시, lastAppliedYearMonth는 업데이트하지 않음 |
| 정기 거래 삭제 시 기존 반영된 거래 | 기존 실제 거래는 유지 (영향 없음) |

---

## 7. 검증 항목

- [ ] 정기 거래 추가 → Firestore `recurringTransactions` 문서 생성 확인
- [ ] 수정/삭제 동작 확인
- [ ] 활성/비활성 토글 동작
- [ ] 스와이프 삭제 동작
- [ ] 미반영 고정비 [반영] 버튼 → transactions 문서 생성 + lastAppliedYearMonth 업데이트 확인
- [ ] 반영된 거래의 date가 dayOfMonth 기준 날짜로 정확히 설정되는지 확인
- [ ] HomeScreen 배너 표시 (미반영 있을 때) / 숨김 (없을 때) 확인
- [ ] 비활성 거래는 미반영 목록 및 홈 배너에서 제외 확인
- [ ] dayOfMonth > 말일인 달의 반영 날짜 처리 확인
