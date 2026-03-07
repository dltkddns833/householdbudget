# #27 자산 변동 추이 상세

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/27

## 개요

홈 화면의 7개월 실자산 추이 카드를 보완하여, 계좌별·섹션별(실자산/은퇴자금) 상세 자산 추이를
전용 화면에서 확인한다. 자산이 어느 계좌에서 증감했는지, 장기적인 자산 흐름을 파악할 수 있다.

---

## Firestore 데이터 모델

신규 컬렉션/필드 변경 없음. 기존 데이터 활용:

```
families/{familyId}/financialStatus/{yearMonth}
  - realAssetTotal: number
  - retirementTotal: number
  - accounts/{accountId}
      - section: 'realAsset' | 'retirement'
      - accountName: string
      - institution: string
      - amount: number
```

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
export interface AssetTrendPoint {
  yearMonth: string;       // "YYYY-MM"
  realAsset: number;
  retirement: number;
  total: number;
}

export interface AccountTrendPoint {
  yearMonth: string;
  accountId: string;
  accountName: string;
  institution: string;
  amount: number;
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/assets/hooks/useAssetTrend.ts` | 월별 자산 추이 조회 훅 |
| `src/features/assets/screens/AssetTrendScreen.tsx` | 자산 변동 추이 상세 화면 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/features/home/screens/HomeScreen.tsx` | 실자산 히어로 카드에 "자세히 보기" 링크 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | MoreStack에 AssetTrend 스크린 추가 |

---

## 훅 (`useAssetTrend.ts`)

```typescript
useAssetTrend(months: number = 12): {
  data: AssetTrendPoint[];   // 최근 N개월
  isLoading: boolean;
}
// financialStatus를 최근 N개월치 조회 → 월별 집계
// 데이터 없는 달은 이전 달 값으로 채움 (보간)
```

---

## 화면 구성 / UX

### HomeScreen — 진입점

실자산 히어로 카드 우하단에 [추이 자세히 →] 텍스트 버튼 추가.

### AssetTrendScreen

```
Header: "자산 변동 추이"

기간 선택: [6개월] [12개월] [전체]

━━━ 전체 자산 추이 ━━━
[라인 차트]
  실자산 ─── 은퇴자금 ───
  Jan Feb Mar Apr May Jun ...

━━━ 월별 증감 ━━━
2026-03   +1,200,000원  ↑
2026-02   -  300,000원  ↓
2026-01   +2,500,000원  ↑
...

━━━ 계좌별 현황 (최근 월) ━━━
[실자산]
  KB 주택청약    12,500,000원  (+200,000)
  토스 저축예금  35,000,000원  (+1,000,000)
  ...
[은퇴자금]
  삼성증권 IRP   48,000,000원  (+500,000)
  ...
```

- 라인 차트: `react-native-chart-kit` LineChart 활용
- 증감 색상: 양수 → 초록, 음수 → 빨강
- 기간 선택에 따라 차트 및 목록 업데이트

---

## 검증 항목

- [ ] 6개월/12개월/전체 기간 선택 동작
- [ ] 실자산/은퇴자금 라인 차트 정확성
- [ ] 월별 증감액 계산 정확성 (전월 대비)
- [ ] 계좌별 최근 월 현황 및 전월 대비 증감 표시
- [ ] 데이터 없는 초기 달 처리 (0 또는 보간)
- [ ] HomeScreen "추이 자세히" 버튼 → AssetTrendScreen 이동
