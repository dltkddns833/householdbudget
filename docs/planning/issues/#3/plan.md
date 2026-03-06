# #3 가족 멤버별 지출 분리

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/3

## 개요

거래 등록 시 어떤 가족 구성원의 지출인지 태깅하고, 멤버별로 통계를 확인한다.
가족 앱의 핵심 차별점으로, 누가 얼마나 썼는지 한눈에 파악할 수 있다.

---

## Firestore 데이터 모델 변경

### transactions 필드 추가

```
families/{familyId}/transactions/{id}
  - memberId: string  // 추가 — 지출 주체 멤버 uid (기존 거래: 빈 문자열 또는 미설정)
```

### monthlySummaries 필드 추가 (선택적)

```
families/{familyId}/monthlySummaries/{yearMonth}
  - memberBreakdown: Record<uid, { totalExpense: number, totalIncome: number }>
    // 멤버별 집계 — 거래 쓰기 시 재계산
```

> `memberBreakdown`은 클라이언트에서 거래 목록 기반으로 계산 가능하므로 초기에는 클라이언트 계산 방식으로 구현.

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
// Transaction 인터페이스에 필드 추가
export interface Transaction {
  // ... 기존 필드
  memberId?: string;  // 지출 멤버 uid (미설정 = 가족 공동)
}

export interface MemberExpenseSummary {
  uid: string;
  name: string;
  totalExpense: number;
  totalIncome: number;
}
```

---

## 구현 파일 목록

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | Transaction에 memberId 필드 추가, MemberExpenseSummary 타입 추가 |
| `src/features/transactions/screens/TransactionAddModal.tsx` | 멤버 선택 UI 추가 |
| `src/features/transactions/screens/TransactionEditScreen.tsx` | 멤버 선택 UI 추가 |
| `src/features/transactions/services/transactionService.ts` | memberId 필드 저장 |
| `src/features/stats/screens/StatsScreen.tsx` | 멤버별 지출 breakdown 섹션 추가 |
| `src/features/home/screens/HomeScreen.tsx` | 멤버별 이번달 소비 메트릭 추가 |

---

## 서비스 변경 (`transactionService.ts`)

```typescript
// 거래 생성/수정 시 memberId 포함
createTransaction(familyId, data: { ..., memberId?: string }): Promise<string>
updateTransaction(familyId, id, data: { ..., memberId?: string }): Promise<void>
```

---

## 훅 추가 (`useTransactions.ts` 또는 별도 훅)

```typescript
useMemberBreakdown(yearMonth?)
  // transactions 목록에서 memberId 기준으로 집계
  // MemberExpenseSummary[] 반환
  // family.memberNames를 통해 이름 매핑
```

---

## 화면 구성 / UX

### TransactionAddModal / TransactionEditScreen — 멤버 선택

거래 폼에 멤버 선택 영역 추가:
```
멤버:  [공동] [홍길동] [김철수]   ← 수평 칩 목록
       (기본값: 로그인한 본인)
```

- 가족 멤버가 1명이면 멤버 선택 UI 숨김
- `family.memberNames`에서 멤버 목록 가져옴

### StatsScreen — 멤버별 breakdown

카테고리 통계 아래 멤버별 지출 섹션 추가:
```
[멤버별 지출]
홍길동  ████████░░  320,000원
김철수  █████░░░░░  180,000원
```

### HomeScreen — 멤버별 메트릭

메트릭 카드 영역에 멤버별 소비 표시 (가족 멤버 2인 이상일 때):
```
[멤버별 이번달 소비]
홍길동: 320,000원   김철수: 180,000원
```

---

## 마이그레이션 고려사항

- 기존 거래에는 `memberId` 없음 → `memberId` 미설정 = "공동 지출"로 처리
- 필터/통계에서 `memberId`가 없는 거래는 별도 "공동" 항목으로 묶거나 전체에 포함

---

## 검증 항목

- [ ] 거래 추가 시 멤버 선택 UI 표시 (가족 멤버 2인 이상)
- [ ] 가족 멤버 1인이면 멤버 선택 UI 숨김
- [ ] 선택한 memberId가 Firestore에 저장 확인
- [ ] StatsScreen 멤버별 breakdown 표시
- [ ] HomeScreen 멤버별 소비 메트릭 표시
- [ ] 기존 거래(memberId 없음) 통계에 영향 없음 확인
