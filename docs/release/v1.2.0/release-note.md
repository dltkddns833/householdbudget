# v1.2.0 릴리즈 노트

**릴리즈 날짜**: 2026-03-07
**versionCode**: 3

---

## 신규 기능

### #5 연간 요약

통계 화면에 연간 탭 추가. 연도별 수입/지출/저축 흐름을 한눈에 파악.

- StatsScreen 상단 월간/연간 탭 전환 추가
- 연도 선택(← →), 총 수입/지출/저축 요약 카드, 연간 저축률 배지
- 월별 수입 vs 지출 나란히 막대그래프 (수평 스크롤)
- 카테고리별 연간 지출 TOP 5

관련 이슈: [#5](https://github.com/dltkddns833/householdbudget/issues/5)

---

### #6 저축률 트래킹

이번 달 저축률을 홈 화면에서 실시간 확인. 목표 저축률 설정 및 달성 여부 시각화.

- HomeScreen 저축률 카드 추가 (저축률, 저축액, 목표 게이지)
- 목표 달성 시 초록색 + "목표 달성!" 표시, 음수 저축률 빨간색
- MoreMenu → 저축률 목표 설정 화면 (0~100% 입력, 0% = 미설정)
- families 루트 문서에 `savingRateGoal` 저장

관련 이슈: [#6](https://github.com/dltkddns833/householdbudget/issues/6)

---

### #7 거래 검색 & 필터

거래 목록에서 메모/금액/카테고리/날짜 복합 필터로 원하는 거래를 빠르게 검색.

- 실시간 텍스트 검색 (거래명 + 메모 동시 검색, 대소문자 무시)
- 필터 패널 (유형/카테고리/금액 범위/날짜 범위), 유형 변경 시 카테고리 목록 연동
- 활성 필터 수 배지 표시, 필터 초기화

관련 이슈: [#7](https://github.com/dltkddns833/householdbudget/issues/7)

---

### #11 거래 사진 첨부 (영수증)

거래에 영수증 사진을 첨부하여 지출 근거 보관.

- 카메라 촬영 / 갤러리 선택 (1080px 압축)
- Firebase Storage 업로드 (`receipts/{familyId}/{txId}.jpg`)
- 거래 상세 화면에서 사진 확인, 탭 시 전체 화면 모달
- 거래 삭제 시 Storage 이미지 함께 삭제

관련 이슈: [#11](https://github.com/dltkddns833/householdbudget/issues/11)

---

### #14 자산 목표 설정

"1억 모으기" 같은 자산 목표를 설정하고 달성 진행률을 홈 화면에서 확인.

- Firestore `families/{familyId}/goals/{id}` 컬렉션 신규 추가
- 새 목표 생성 시 기존 활성 목표 batch로 비활성화
- HomeScreen 목표 진행률 카드 (현재 자산 / 목표 금액, 게이지)
- MoreMenu → 자산 목표 설정 화면 (생성/수정/삭제)

관련 이슈: [#14](https://github.com/dltkddns833/householdbudget/issues/14)

---

### #17 푸시 알림

FCM 기반 푸시 알림으로 예산 초과, 고정비 납부일, 월 초 예산 설정을 알림.

- FCM 토큰 등록, 알림 종류별 개별 토글 설정 (MoreMenu → 알림 설정)
- 포그라운드/백그라운드/앱 종료 후 딥링크 3가지 케이스 처리

**Cloud Functions**:
- 예산 80%/100% 초과 시 알림 (monthlySummaries Firestore 트리거, 중복 발송 방지)
- 고정비 납부일 당일 오전 9시 알림 (Cloud Scheduler)
- 매월 1일 오전 8시 예산 미설정 안내 알림 (Cloud Scheduler)

관련 이슈: [#17](https://github.com/dltkddns833/householdbudget/issues/17)
