# #7 거래 검색 & 필터

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/7

## 개요

거래 목록에서 원하는 거래를 빠르게 찾을 수 있다.
메모·카테고리·금액 범위로 검색하고 날짜 범위 필터를 제공한다.
거래가 누적될수록 필요성이 증가하는 기능.

---

## Firestore 데이터 모델

신규 컬렉션/필드 변경 없음. 기존 `transactions` 컬렉션에서 클라이언트 필터링.

> Firestore 쿼리 한계(복합 필터)로 인해 해당 월 전체 데이터를 가져온 후 클라이언트에서 필터링.
> 날짜 범위 필터는 여러 달에 걸칠 경우 복수 yearMonth 데이터 조회.

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
export interface TransactionFilter {
  query?: string;           // 메모 텍스트 검색
  category?: string;        // 카테고리 키 ('' = 전체)
  type?: 'income' | 'expense' | 'all';
  amountMin?: number;
  amountMax?: number;
  dateFrom?: string;        // "YYYY-MM-DD"
  dateTo?: string;          // "YYYY-MM-DD"
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/transactions/components/SearchBar.tsx` | 검색 바 컴포넌트 |
| `src/features/transactions/components/FilterPanel.tsx` | 필터 패널 컴포넌트 (슬라이드 다운) |
| `src/features/transactions/hooks/useTransactionFilter.ts` | 필터 상태 관리 & 클라이언트 필터링 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | TransactionFilter 타입 추가 |
| `src/features/transactions/screens/TransactionListScreen.tsx` | SearchBar, FilterPanel 추가 |

---

## 훅 (`useTransactionFilter.ts`)

```typescript
useTransactionFilter() {
  filter: TransactionFilter;
  setFilter: (partial: Partial<TransactionFilter>) => void;
  resetFilter: () => void;
  filterTransactions: (transactions: Transaction[]) => Transaction[];
  activeFilterCount: number;  // 적용된 필터 수 (배지 표시용)
}

// filterTransactions 내부 로직:
// 1. query: transaction.memo.includes(query) (대소문자 무시)
// 2. category: transaction.category === category
// 3. type: transaction.type === type
// 4. amountMin/Max: 범위 내 amount
// 5. dateFrom/dateTo: 날짜 범위 내 date
```

---

## 화면 구성 / UX

### TransactionListScreen — 검색 바

```
[ 🔍 거래 검색... ]  [필터 ▼ (N)]
```

- 검색 바 탭 시 키보드 활성화, 실시간 필터링
- 필터 버튼에 활성 필터 수 배지 표시

### FilterPanel (슬라이드 다운)

```
───────────────────────────
유형:    [전체]  [수입]  [지출]
카테고리: [전체 ▼]  (드롭다운 또는 칩 목록)
금액:    최소 [______] ~ 최대 [______] 원
날짜:    [____-__-__] ~ [____-__-__]
                          [초기화]  [적용]
───────────────────────────
```

### 검색 결과 표시

- 결과 없음: "검색 결과가 없어요" 빈 상태 메시지
- 검색 중: 기존 거래 목록과 동일한 그룹화(날짜별) 유지
- 검색 바 있을 때 월 이동 UI 숨김 (검색 모드)

---

## 검증 항목

- [ ] 메모 텍스트 검색 동작 (대소문자 무시)
- [ ] 카테고리 필터 동작
- [ ] 수입/지출 유형 필터 동작
- [ ] 금액 범위 필터 동작
- [ ] 날짜 범위 필터 동작
- [ ] 복합 필터 (여러 조건 동시 적용) 동작
- [ ] 필터 초기화 동작
- [ ] 활성 필터 수 배지 표시
- [ ] 검색 결과 없을 때 빈 상태 메시지 표시
