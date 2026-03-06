# 기획 문서 디렉토리

> 이 폴더는 "우리집 가계부" 앱의 기획 관련 문서를 관리합니다.
> 새 대화에서 기획 작업을 시작할 때 이 문서를 먼저 참고하세요.

## 목차

- `README.md` — 현재 파일. 앱 현황 및 기획 컨텍스트
- `features.md` — 추가 예정 기능 목록 및 우선순위
- `issues/` — GitHub 이슈별 상세 기획 문서 (아래 루틴 참고)

---

## 이슈 관리 루틴

새 기능 기획이 확정되면 아래 순서로 진행한다.

### 1. GitHub 이슈 생성
```bash
gh issue create --title "feat: 기능명" --body "..."
```

### 2. 이슈 폴더 & 문서 생성
이슈 번호에 맞춰 `docs/planning/issues/#{번호}/plan.md` 파일을 생성한다.

```
docs/planning/issues/
  #1/
    plan.md   ← 상세 기획 (데이터 모델, 구현 파일, UX, 검증 항목)
  #2/
    plan.md
  ...
```

### plan.md 필수 항목
| 섹션 | 내용 |
|------|------|
| 개요 | 기능 목적 및 배경 |
| Firestore 데이터 모델 | 신규/변경 컬렉션 구조 |
| 신규 타입 | `src/shared/types/index.ts` 추가 내용 |
| 구현 파일 목록 | 신규 생성 / 수정 파일 |
| 화면 구성 | 주요 UX 및 인터랙션 |
| 검증 항목 | 체크리스트 (완료 시 체크) |

---

## 앱 개요

**앱명**: 우리집 가계부
**성격**: 부부/가족 단위 공유 가계부 + 자산 관리
**플랫폼**: React Native (iOS / Android)
**백엔드**: Firebase (Firestore + Auth + Google Sign-In)
**현재 버전**: v1.0.0

---

## 현재 구현된 기능

### 화면 구성 (탭 5개)

| 탭 | 화면 | 주요 내용 |
|----|------|-----------|
| 홈 | `HomeScreen` | 실자산 히어로 카드, 이번달 소비, 은퇴자금, 실자산 추이 차트 (7개월), 월별 현황 리스트 |
| 거래 | `TransactionListScreen` | 월별 거래 목록, 수입/지출 탭 전환 |
| 추가 | FAB 모달 | `TransactionAddModal` — 전역 모달로 App.tsx에서 관리 |
| 통계 | `StatsScreen` | 총 지출, 카테고리별 비율 (누적 바 + 랭킹 리스트), 월별 소비 추이 막대차트, 일별 지출 막대차트 |
| 더보기 | `MoreMenuScreen` | 재무상태, 화면 모드, 가족 초대 코드 복사, 로그아웃 |

### 자산 관리 (`AssetScreen`)

더보기 > 재무상태에서 접근. 계좌별 자산 등록 및 수정, 전월 복사, 전세 보증금/대출 관리.

### 인증 흐름

Google Sign-In → 가족 없으면 `FamilySetupScreen` (새로 만들기 or 초대 코드 입력) → 메인 탭

---

## Firestore 데이터 모델 (현재)

```
families/{familyId}
  ├─ members: string[]          // uid 배열
  ├─ memberNames: Record<uid, string>
  ├─ inviteCode: string
  │
  ├─ transactions/{txId}
  │    ├─ type: 'expense' | 'income'
  │    ├─ date: Timestamp
  │    ├─ yearMonth: string       // "2026-01"
  │    ├─ category: string
  │    ├─ name: string
  │    ├─ amount: number          // 원 단위 정수
  │    ├─ memo: string
  │    └─ createdBy: uid
  │
  ├─ monthlySummaries/{yearMonth}
  │    ├─ totalExpense: number
  │    ├─ totalIncome: number
  │    ├─ remaining: number
  │    ├─ categoryBreakdown: Record<category, number>
  │    └─ dailyTotals: Record<"01"~"31", number>
  │
  └─ financialStatus/{yearMonth}
       ├─ realAssetTotal: number
       ├─ realAssetWithLease: number
       ├─ retirementTotal: number
       ├─ leaseDeposit: number
       ├─ leaseLoan: number
       ├─ leaseNet: number
       └─ accounts/{accountId}
            ├─ owner: string          // "상운" | "채원"
            ├─ section: 'realAsset' | 'retirement'
            ├─ accountType: string
            ├─ subType: string
            ├─ institution: string
            ├─ accountName: string
            ├─ amount: number
            └─ sortOrder: number
```

---

## 카테고리 정의 (현재)

**지출 (11개)**: 식비, 카페, 쇼핑, 구독, 간식, 교통, 관리비, 기타, 건강, 통신비, 취미
**수입 (5개)**: 급여, 환급, 용돈, 청약, 기타수입

---

## 기술 스택 요약

- **상태관리**: Zustand (authStore, uiStore) + React Query (서버 캐시)
- **실시간**: Firestore `onSnapshot` (거래 목록)
- **스타일**: 자체 ThemeProvider (light/dark/system)
- **아이콘**: react-native-vector-icons/MaterialIcons
- **날짜**: dayjs
- **차트**: react-native-chart-kit

---

## 기획 시 고려사항

### 데이터 모델 확장 원칙
- 모든 데이터는 `families/{familyId}/` 하위에 위치
- 거래 조회는 `yearMonth` 필드로 파티셔닝 (Firestore 쿼리 최적화)
- 집계 데이터는 `monthlySummaries`에 pre-aggregate (클라이언트 연산 최소화)
- 새 필드 추가 시 기존 문서와의 하위 호환성 유지 필요

### UX 원칙
- 월(Month) 단위가 기본 뷰 단위 — `uiStore.currentMonth`로 전역 관리
- 거래 추가는 FAB 탭에서 전역 모달로 접근 (어느 탭에서든 빠르게)
- 가족 공유 앱이므로 누가 입력했는지(`createdBy`) 항상 기록

### 현재 없는 기능 (기획 대상)
- 예산 설정
- 정기/반복 거래
- 멤버별 지출 구분 (createdBy는 있으나 UI에서 활용 안 함)
- 거래 검색
- 푸시 알림
- 연간 통계
- 저축률 트래킹

자세한 내용은 `features.md` 참고.
