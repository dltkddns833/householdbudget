# v1.5.0 릴리즈 노트

**릴리즈 날짜**: 2026-03-09
**versionCode**: 6

---

## 신규 기능

### #3 가족 멤버별 지출 분리

거래 등록 시 지출 주체 멤버를 태깅하고, 통계에서 멤버별 지출을 확인한다.

- `Transaction` 타입에 `memberId` 필드 추가
- `TransactionAddScreen` 하단에 멤버 선택 chip UI (가족 2명 이상일 때만 표시)
- `StatsScreen`에 멤버별 지출 비율 바 표시 (2명 이상일 때만 표시)

관련 이슈: [#3](https://github.com/dltkddns833/householdbudget/issues/3) | 커밋: 37034b6

---

### #25 소비 캘린더 뷰

월별 소비를 캘린더 형태로 시각화.

- `CalendarScreen` 신규: 날짜별 지출 표시, 날짜 선택 시 해당 일 거래 목록 표시
- `SpendingCalendar` 컴포넌트: `monthlySummaries.dailyTotals` 기반 히트맵 스타일
- `TransactionListScreen`에서 캘린더 아이콘으로 진입

관련 이슈: [#25](https://github.com/dltkddns833/householdbudget/issues/25) | 커밋: 37034b6

---

### #27 자산 변동 추이 상세

기간별 총 자산 변동을 꺾은선 차트로 확인.

- `AssetTrendScreen` 신규: 6 / 12 / 24개월 기간 선택, LineChart 시각화
- `useAssetTrend` 훅: `financialStatus` 데이터 기반 월별 자산 합산
- `AssetScreen`에서 진입

관련 이슈: [#27](https://github.com/dltkddns833/householdbudget/issues/27) | 커밋: 37034b6

---

### #26 월간 결산 리포트

월말 루틴으로 활용할 수 있는 결산 요약 화면.

- `MonthlyReportScreen` 신규: 수입·지출·저축액·저축률·카테고리 TOP3·예산 달성률 요약
- `MonthlyReportCard` 컴포넌트로 공유(Share) 기능 포함
- `StatsScreen`에서 진입

관련 이슈: [#26](https://github.com/dltkddns833/householdbudget/issues/26) | 커밋: 37034b6

---
