# v1.1.0 릴리즈 노트

**릴리즈 날짜**: 2026-03-07
**versionCode**: 2

---

## 신규 기능

### #1 예산 설정 & 달성률

카테고리별 월 예산을 설정하고 실제 지출 대비 달성률을 시각화.

- **Firestore**: `families/{familyId}/budgets/{yearMonth}` 컬렉션 신규 추가
- **MoreMenu → 예산 설정** 진입점 추가
- 카테고리 11개 금액 개별 설정, 이전 달 복사 기능
- StatsScreen 카테고리 랭킹에 예산 진행 바 표시
  - 80% 이상: warning (#F59E0B)
  - 100% 초과: danger (#EF4444)
- HomeScreen 예산 요약 카드 (예산 설정된 달에만 표시)

관련 이슈: [#1](https://github.com/dltkddns833/householdbudget/issues/1)
관련 커밋: `f57bbaf`

---

### #2 정기 지출 (고정비) 관리

월세, 구독, 보험 등 반복 거래를 등록하고 이번 달 거래에 반영.

- **Firestore**: `families/{familyId}/recurringTransactions/{id}` 컬렉션 신규 추가
- **MoreMenu → 정기 지출 관리** 진입점 추가
- 정기 거래 목록 화면: 활성/비활성 토글, 스와이프 삭제
- 미반영 고정비 섹션: 이번 달 아직 반영 안 된 항목 표시 및 [반영] 버튼
- HomeScreen 미반영 고정비 알림 배너

관련 이슈: [#2](https://github.com/dltkddns833/householdbudget/issues/2)
관련 커밋: `84dc19c`, `c7845a6`

---

## 기타 변경사항

- Android hermesc 경로 pnpm 환경에 맞게 수정 (`0ddd83d`)
