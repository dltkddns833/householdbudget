# #7 거래 검색 & 필터 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(TransactionListScreen, useTransactions 훅, categories.ts) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 거래 목록 상단 검색 바에 "스타벅스"를 입력하면 관련 거래만 필터링된다
- 필터 패널을 열어 카테고리, 금액 범위, 날짜 범위를 조합하여 원하는 거래를 찾는다
- 활성화된 필터 수가 배지로 표시되어 얼마나 좁혀졌는지 파악한다

---

## 2. 기능 요구사항

### 텍스트 검색

- 거래 이름(`name`) + 메모(`memo`) 기준으로 실시간 필터링
- 대소문자 무시, 한국어 포함

### 필터 패널

- 유형: 전체 / 수입 / 지출
- 카테고리: 전체 또는 특정 카테고리 선택 (단일 선택)
- 금액 범위: 최솟값 ~ 최댓값 (원 단위)
- 날짜 범위: 시작일 ~ 종료일 (YYYY-MM-DD)

### 복합 필터

- 여러 조건 AND 조합
- 활성 필터 수 배지 (필터 버튼에 표시)

### 검색 모드 UI 변경

- 검색 활성화 시 월 이동 UI 숨김
- 검색 결과가 없으면 "검색 결과가 없어요" 빈 상태 표시

---

## 3. Firestore 데이터 모델

신규 변경 없음. 기존 `transactions` 컬렉션에서 클라이언트 필터링.

> Firestore 복합 쿼리 한계로 해당 월 전체 데이터 조회 후 클라이언트 필터링.
> 날짜 범위가 여러 달에 걸치는 경우: 각 yearMonth 별도 조회 후 병합.

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
export interface TransactionFilter {
  query?: string;                         // 이름/메모 텍스트 검색
  category?: string;                      // '' 또는 카테고리 키
  type?: 'income' | 'expense' | 'all';
  amountMin?: number;                     // 원 단위
  amountMax?: number;                     // 원 단위
  dateFrom?: string;                      // "YYYY-MM-DD"
  dateTo?: string;                        // "YYYY-MM-DD"
}
```

---

## 5. 파일별 TODO

### [신규] src/features/transactions/hooks/useTransactionFilter.ts

- [ ] `filter: TransactionFilter` 로컬 상태 관리 (useState)
- [ ] `setFilter(partial: Partial<TransactionFilter>): void`
- [ ] `resetFilter(): void` — filter 초기화
- [ ] `activeFilterCount: number` 계산:
  - query 비어있지 않으면 +1
  - category 설정 시 +1
  - type !== 'all' 이면 +1
  - amountMin 또는 amountMax 설정 시 +1
  - dateFrom 또는 dateTo 설정 시 +1
- [ ] `filterTransactions(transactions: Transaction[]): Transaction[]`
  - query: `(tx.name + tx.memo).includes(query)` (소문자 변환 후 비교)
  - category: `tx.category === filter.category`
  - type: `tx.type === filter.type` (all이면 스킵)
  - amountMin/Max: `tx.amount >= amountMin && tx.amount <= amountMax`
  - dateFrom/dateTo: `dayjs(tx.date).isBetween(dateFrom, dateTo, 'day', '[]')`
- [ ] `isSearchActive: boolean` — filter가 기본값과 다르면 true

### [신규] src/features/transactions/components/SearchBar.tsx

- [ ] TextInput 기반 검색 바
- [ ] 우측에 [필터 ▼] 버튼 + activeFilterCount > 0이면 숫자 배지 표시
- [ ] 검색어 입력 중 [X] 클리어 버튼 표시
- [ ] `onSearchChange`, `onFilterPress` 콜백 props

### [신규] src/features/transactions/components/FilterPanel.tsx

- [ ] 슬라이드 다운 애니메이션 (Animated API 또는 react-native-reanimated)
- [ ] 유형 선택: [전체] [수입] [지출] 칩 버튼
- [ ] 카테고리 선택: 드롭다운 또는 스크롤 가능한 칩 목록
  - 유형에 따라 카테고리 목록 변경 (EXPENSE_CATEGORIES / INCOME_CATEGORIES)
- [ ] 금액 범위: 최솟값 / 최댓값 TextInput (숫자만)
- [ ] 날짜 범위: 시작일 / 종료일 DatePicker 또는 텍스트 입력
- [ ] 하단 [초기화] [적용] 버튼
  - [초기화]: `resetFilter()` 호출
  - [적용]: 패널 닫기

### [수정] src/features/transactions/screens/TransactionListScreen.tsx

- [ ] `useTransactionFilter()` 훅 추가
- [ ] 상단에 `<SearchBar>` 추가
- [ ] 검색 활성화 시 (`isSearchActive === true`) 월 이동 UI 숨김
- [ ] `<FilterPanel>` 조건부 렌더링 (필터 버튼 탭 시 표시)
- [ ] 기존 `transactions` 목록에 `filterTransactions` 적용
- [ ] 필터링 결과 0건 시 빈 상태 메시지 "검색 결과가 없어요"

---

## 6. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 날짜 범위가 여러 달에 걸침 | 각 관련 yearMonth 데이터 별도 조회 후 클라이언트 병합 |
| amountMin > amountMax | 필터 패널에서 실시간 유효성 검사, 적용 불가 |
| 검색어에 특수문자 포함 | 정규식 에러 방지: `String.includes` 사용 (정규식 미사용) |
| 카테고리 선택 후 유형 변경 | 카테고리 선택 초기화 (다른 유형의 카테고리는 유효하지 않음) |
| 검색 결과 0건 | "검색 결과가 없어요" 빈 상태, [필터 초기화] 버튼 제공 |

---

## 7. 검증 항목

- [ ] 이름 텍스트 검색 동작 (한국어, 대소문자 무시)
- [ ] 메모 텍스트 검색 동작
- [ ] 카테고리 필터 단일 선택 동작
- [ ] 수입/지출 유형 필터 동작
- [ ] 금액 범위 필터 동작 (최솟값, 최댓값 단독 및 조합)
- [ ] 날짜 범위 필터 동작
- [ ] 복합 필터 (여러 조건 동시 적용) 동작
- [ ] 필터 초기화 후 전체 목록 복원 확인
- [ ] 활성 필터 수 배지 정확성 확인
- [ ] 검색 활성화 시 월 이동 UI 숨김 확인
- [ ] 검색 결과 0건 시 빈 상태 메시지 표시
