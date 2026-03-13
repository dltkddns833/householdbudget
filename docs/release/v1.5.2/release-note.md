# v1.5.2 릴리즈 노트

**릴리즈 날짜**: 2026-03-13
**versionCode**: 8

---

## 버그 수정

### 월간 요약(총지출/총수입) 실시간 반영 안 되는 문제 수정

거래 추가/수정/삭제 시 홈 화면의 이번달 소비, 총수입 등이 즉시 반영되지 않던 문제 해결.

- 원인: Cloud Function(`onTransactionWrite`)의 monthlySummary 갱신이 불안정하여 React Query로 fetch한 값이 갱신 전 데이터를 반환
- 수정: Firestore monthlySummaries 문서에 의존하지 않고, 실시간 거래 목록(`onSnapshot`)에서 클라이언트가 직접 summary를 계산하도록 `useTransactions` 훅 변경

커밋: 84da2eb

---

## 기능 제거

### 예산 설정 및 정기 지출 관리 기능 제거

사용하지 않는 예산(Budget)과 정기 지출(Recurring) 기능 전체 제거.

- `src/features/budget/` — 예산 설정 화면, 훅, 서비스 삭제
- `src/features/recurring/` — 정기 지출 관리 화면, 폼, 훅, 서비스 삭제
- Cloud Functions 3개 삭제: `budgetAlertTrigger`, `recurringAlertScheduler`, `monthlySetupScheduler`
- 홈 화면: 예산 프로그레스 바, 정기 지출 미반영 배너 제거
- 통계/결산 리포트: 예산 달성률 표시 제거
- 더보기 메뉴: 예산 설정, 정기 지출 관리 메뉴 항목 제거
- 알림 설정: 예산/정기 지출 관련 알림 항목 제거
- 관련 타입 정의 삭제 (`RecurringTransaction`, `MonthlyBudget`, `CategoryBudgetProgress`)

커밋: 1f71994

---
