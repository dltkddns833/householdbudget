# #26 월간 결산 리포트

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/26

## 개요

한 달 수입/지출/저축/카테고리 분석을 하나의 이미지로 생성하여 공유하거나 저장.
월말 재무 점검 및 기록 보존용. 별도 백엔드 없이 클라이언트에서 View를 캡처하여 이미지화.

---

## Firestore 데이터 모델

신규 컬렉션/필드 변경 없음. 기존 데이터 활용:
- `monthlySummaries/{yearMonth}` — 수입/지출/저축/카테고리 breakdown
- `budgets/{yearMonth}` — 예산 달성률 (설정된 경우)

---

## 신규 타입

신규 타입 없음.

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/stats/components/MonthlyReportCard.tsx` | 리포트 UI 컴포넌트 (캡처 대상) |
| `src/features/stats/screens/MonthlyReportScreen.tsx` | 리포트 미리보기 + 공유/저장 화면 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/features/stats/screens/StatsScreen.tsx` | "결산 리포트" 버튼 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | StatsStack에 MonthlyReport 스크린 추가 |

### 의존성 추가

```bash
pnpm add react-native-view-shot   # View → 이미지 캡처
pnpm add react-native-share       # 이미지 공유
cd ios && pod install
```

---

## 화면 구성 / UX

### StatsScreen — 진입점

월간 탭 하단에 [📊 이달의 결산 리포트 보기] 버튼 추가.

### MonthlyReportScreen

```
Header: "2026년 3월 결산"  [공유] [저장]

┌─────────────────────────────────┐
│       🏠 우리집 가계부            │
│         2026년 3월 결산          │
│─────────────────────────────────│
│  수입          지출        저축  │
│  350만원       280만원    70만원 │
│                저축률: 20%       │
│─────────────────────────────────│
│  카테고리별 지출 TOP 5            │
│  식비   ██████████  120,000원   │
│  쇼핑   ███████     85,000원    │
│  교통   █████       62,000원    │
│  카페   ████        48,000원    │
│  구독   ███         35,000원    │
│─────────────────────────────────│
│  전월 대비                       │
│  ✅ 지난달보다 3만원 절약했어요   │
│  ⚠️ 쇼핑이 지난달의 1.5배예요   │
│─────────────────────────────────│
│  예산 달성률 (설정 시)            │
│  전체 예산의 78% 사용            │
└─────────────────────────────────┘
```

- `react-native-view-shot`으로 카드 영역 캡처 → PNG
- [공유] : `react-native-share`로 카카오톡·메시지 등 공유
- [저장] : 카메라롤에 저장
- 리포트 카드 배경: 앱 브랜드 컬러 그라디언트

---

## 검증 항목

- [ ] 수입/지출/저축/저축률 정확성
- [ ] 카테고리 TOP 5 표시 (5개 미만이면 있는 만큼만)
- [ ] 전월 비교 인사이트 표시 (전월 데이터 없으면 숨김)
- [ ] 예산 달성률 표시 (예산 미설정 시 숨김)
- [ ] 이미지 캡처 정상 동작 (iOS/Android)
- [ ] 공유 시트 정상 동작
- [ ] 카메라롤 저장 동작 (권한 요청 포함)
