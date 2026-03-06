# #3 가족 멤버별 지출 분리 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(TransactionAddModal, TransactionEditScreen, StatsScreen, HomeScreen, types) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 부부가 각자 쓴 금액을 구분하여 "이번 달 내가 얼마 썼는지" 확인한다
- 거래 추가 시 지출 주체를 선택할 수 있으며 기본값은 로그인한 본인이다
- 통계 화면에서 멤버별 지출 비중을 한눈에 파악한다

---

## 2. 기능 요구사항

### 거래 등록/수정 — 멤버 선택

- 거래 폼에 멤버 선택 칩 UI 추가 (수평 스크롤)
- 기본값: 로그인한 본인 uid
- "공동" 선택 시 memberId = undefined (가족 공동 지출)
- 가족 멤버 1인일 때는 UI 숨김

### 통계 화면 — 멤버별 breakdown

- 카테고리 통계 아래에 멤버별 지출 섹션 추가
- 각 멤버: 이름 + 가로 진행 바 + 금액
- "공동" 지출 별도 표시

### 홈 화면 — 멤버별 메트릭

- 가족 멤버 2인 이상일 때만 표시
- 각 멤버의 이번달 총 지출 표시

---

## 3. Firestore 데이터 모델 변경

```
families/{familyId}/transactions/{id}
  + memberId?: string   // 지출 멤버 uid. 없음 = 공동 지출
```

- 기존 거래에는 memberId 없음 → 공동 지출로 취급 (UI에서 "공동" 표시)
- monthlySummaries는 초기에 클라이언트 계산 방식 사용 (서버 집계 불필요)

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
// 기존 Transaction 인터페이스 확장
export interface Transaction {
  // ... 기존 필드
  memberId?: string;  // undefined = 공동 지출
}

export interface MemberExpenseSummary {
  uid: string | null;   // null = 공동 지출
  name: string;         // "공동" 또는 실제 이름
  totalExpense: number;
  totalIncome: number;
  percentage: number;   // 이번달 전체 지출 대비 비중
}
```

---

## 5. 파일별 TODO

### [수정] src/shared/types/index.ts

- [ ] `Transaction` 인터페이스에 `memberId?: string` 필드 추가
- [ ] `MemberExpenseSummary` 타입 추가

### [수정] src/features/transactions/screens/TransactionAddModal.tsx

- [ ] 거래 폼에 멤버 선택 영역 추가 (카테고리 선택 아래)
- [ ] `useFamily()` 훅으로 멤버 목록 조회
- [ ] 멤버 칩 렌더링: "공동" + 각 멤버 이름 (수평 FlatList)
- [ ] 기본 선택값: 로그인한 본인 uid
- [ ] 멤버 1인 가족이면 선택 UI 조건부 숨김 (`family.members.length < 2`)
- [ ] 저장 시 `memberId` 포함하여 createTransaction 호출

### [수정] src/features/transactions/screens/TransactionEditScreen.tsx

- [ ] TransactionAddModal과 동일한 멤버 선택 UI 추가
- [ ] 기존 거래의 `memberId` 기본값으로 세팅
- [ ] 저장 시 `memberId` 포함하여 updateTransaction 호출

### [수정] src/features/transactions/services/transactionService.ts

- [ ] `createTransaction` 파라미터에 `memberId?: string` 추가
- [ ] `updateTransaction` 파라미터에 `memberId?: string` 추가

### [신규] src/features/stats/hooks/useMemberBreakdown.ts

- [ ] `useMemberBreakdown(yearMonth?): MemberExpenseSummary[]`
  - `useTransactions(yearMonth)` 데이터에서 memberId 기준 집계
  - `family.memberNames`로 이름 매핑
  - memberId 없는 거래 → "공동" 항목으로 집계
  - totalExpense 내림차순 정렬
  - percentage 계산: memberExpense / totalFamilyExpense * 100

### [수정] src/features/stats/screens/StatsScreen.tsx

- [ ] `useMemberBreakdown(currentMonth)` 훅 추가
- [ ] 카테고리 랭킹 아래 "멤버별 지출" 섹션 추가
- [ ] 멤버 2인 미만이고 공동 지출만 있으면 섹션 숨김
- [ ] 각 행: 이름 + 가로 진행 바 + 금액 + 비중(%)

### [수정] src/features/home/screens/HomeScreen.tsx

- [ ] 가족 멤버 2인 이상일 때 멤버별 소비 카드 추가
- [ ] 각 멤버 이름 + 이번달 지출 금액 표시 (그리드 형태)

---

## 6. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 기존 거래 (memberId 없음) | "공동" 지출로 취급 |
| 가족 멤버 1인 | 멤버 선택 UI 숨김, 저장 시 memberId 미포함 |
| 멤버가 가족을 탈퇴한 경우 | memberNames에 없으면 uid 그대로 표시 또는 "알 수 없음" |
| 전체 지출이 0원인 달 | percentage 0으로 처리 |
| "공동" 항목이 없는 달 | MemberExpenseSummary에서 공동 항목 제외 |

---

## 7. 검증 항목

- [ ] 거래 추가 시 멤버 선택 UI 표시 (가족 멤버 2인 이상)
- [ ] 가족 멤버 1인이면 멤버 선택 UI 숨김
- [ ] 선택한 memberId가 Firestore transactions에 저장 확인
- [ ] 기존 거래 수정 시 memberId 기본값 표시 확인
- [ ] StatsScreen 멤버별 지출 breakdown 표시
- [ ] 비중(%) 합산이 100% 근사치인지 확인
- [ ] HomeScreen 멤버별 소비 메트릭 표시 (2인 이상)
- [ ] 기존 거래(memberId 없음) "공동" 집계 정확성 확인
