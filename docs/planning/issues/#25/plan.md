# #25 소비 캘린더 뷰

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/25

## 개요

거래 목록의 날짜별 그룹 UI를 보완하여 달력 형태로 날짜별 지출 총액을 히트맵으로 표시.
지출이 많은 날은 진한 색, 적은 날은 연한 색으로 시각화하여 소비 패턴을 직관적으로 파악.
날짜 탭 시 해당 날의 거래 목록으로 이동.

---

## Firestore 데이터 모델

신규 컬렉션/필드 변경 없음. 기존 `monthlySummaries/{yearMonth}.dailyTotals` 활용:
```
dailyTotals: Record<"01"~"31", number>  // 날짜별 지출 합계
```

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
// 신규 타입 없음. 기존 MonthlySummary.dailyTotals 활용.
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/transactions/components/SpendingCalendar.tsx` | 달력 히트맵 컴포넌트 |
| `src/features/transactions/screens/CalendarScreen.tsx` | 캘린더 뷰 화면 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/features/transactions/screens/TransactionListScreen.tsx` | 우상단 캘린더 아이콘 버튼 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | TransactionStack에 Calendar 스크린 추가 |

---

## 화면 구성 / UX

### TransactionListScreen — 진입점

```
거래 목록 헤더 우상단에 [📅] 아이콘 버튼 추가
→ CalendarScreen으로 이동
```

### CalendarScreen

```
Header: "소비 캘린더"
MonthSelector (월 이동)

┌──────────────────────────────┐
│  일  월  화  수  목  금  토  │
│                              │
│  [  ] [ 2] [ 3] [ 4] [ 5]  │  ← 날짜 셀
│  [ 6] [ 7] [ 8] [ 9] [10]  │
│       ...                    │
│                              │
│  각 날짜 셀:                  │
│   ┌────┐                     │
│   │ 15 │  ← 배경 색상 = 히트맵│
│   │3만 │  ← 지출 금액 (만원)  │
│   └────┘                     │
└──────────────────────────────┘

[범례]  없음 □ 적음 ■ 보통 ■ 많음 ■
```

- 히트맵 기준: 해당 월 최대 일별 지출 대비 상대 비율
  - 0원: 배경 없음 (기본)
  - 1~33%: 연한 색
  - 34~66%: 중간 색
  - 67~100%: 진한 색
- 오늘 날짜: 테두리 강조
- 미래 날짜: 회색 처리
- 날짜 탭 → 해당 날 거래 목록 모달 또는 필터된 TransactionListScreen으로 이동

### 날짜 탭 시 상세

```
[2026년 3월 15일 거래]
━━━━━━━━━━━━━━━━━━━
식비   스타벅스          -5,500원
쇼핑   쿠팡              -32,000원
━━━━━━━━━━━━━━━━━━━
합계                     -37,500원
```

---

## 검증 항목

- [ ] 달력 날짜 셀 정상 렌더링 (1일 요일 맞게 시작)
- [ ] dailyTotals 기반 히트맵 색상 4단계 표시
- [ ] 오늘 날짜 강조 표시
- [ ] 미래 날짜 회색 처리
- [ ] 날짜 탭 시 해당 날 거래 목록 표시
- [ ] 월 이동 시 캘린더 업데이트
- [ ] 지출 없는 달 빈 캘린더 표시
