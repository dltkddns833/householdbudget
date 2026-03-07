# #28 홈 화면 위젯

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/28

## 개요

iOS·Android 홈 화면 위젯에서 이번달 지출·잔액을 앱을 열지 않고 바로 확인.
Firebase 실시간 데이터를 위젯에 표시하기 위해 SharedPreferences(Android) / App Groups(iOS)를
통해 네이티브와 데이터를 공유한다.

---

## Firestore 데이터 모델

신규 컬렉션/필드 변경 없음. 기존 `monthlySummaries/{yearMonth}` 데이터 활용.

---

## 신규 타입

```typescript
// 위젯에 전달할 경량 데이터 구조
export interface WidgetData {
  yearMonth: string;
  totalExpense: number;
  totalIncome: number;
  remaining: number;
  updatedAt: string;  // ISO 문자열
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/widget/services/widgetService.ts` | 위젯용 데이터 네이티브 브릿지 저장 |
| `src/features/widget/hooks/useWidgetSync.ts` | monthlySummary 변경 시 위젯 데이터 동기화 |
| `android/app/src/main/java/.../widget/BudgetWidget.kt` | Android 위젯 구현 |
| `android/app/src/main/res/layout/widget_budget.xml` | Android 위젯 레이아웃 |
| `ios/BudgetWidget/` | iOS Widget Extension 타겟 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/features/home/hooks/useOverview.ts` | 데이터 변경 시 useWidgetSync 호출 |

### 의존성 추가

```bash
pnpm add @react-native-community/async-storage  # 이미 있을 수 있음
# Android: 네이티브 AppWidgetProvider
# iOS: WidgetKit Extension 추가 (Xcode에서 직접 추가)
```

---

## 위젯 UI 디자인

### Small 위젯 (2×2)

```
┌─────────────────┐
│  우리집 가계부   │
│                 │
│  이번달 지출    │
│  280,000원      │
│                 │
│  잔액 70,000원  │
│  3월            │
└─────────────────┘
```

### Medium 위젯 (4×2)

```
┌──────────────────────────────┐
│  우리집 가계부     2026년 3월 │
│──────────────────────────────│
│  수입        지출       잔액  │
│  350만원     280만원   70만원 │
│  ████████████████░░░░  80%  │
└──────────────────────────────┘
```

---

## 데이터 동기화 흐름

1. 앱 실행 or 거래 추가 시 `monthlySummaries` 업데이트
2. `useWidgetSync` 훅이 변경 감지 → `widgetService.saveWidgetData()` 호출
3. Android: `SharedPreferences`에 JSON 저장 → AppWidgetProvider가 읽어 렌더링
4. iOS: `App Groups` UserDefaults 공유 → WidgetKit Timeline Provider가 읽어 렌더링
5. 위젯 탭 시 앱 홈 화면으로 딥링크 이동

---

## 플랫폼별 구현 참고

### Android
- `AppWidgetProvider` 서브클래스로 `BudgetWidget.kt` 구현
- `RemoteViews`로 레이아웃 업데이트
- `android/app/src/main/AndroidManifest.xml`에 위젯 등록

### iOS
- Xcode에서 Widget Extension 타겟 추가
- `WidgetKit` + `SwiftUI`로 위젯 UI 작성
- App Group ID로 메인 앱과 데이터 공유

---

## 검증 항목

- [ ] Android Small/Medium 위젯 홈 화면 추가 동작
- [ ] iOS Small/Medium 위젯 홈 화면 추가 동작
- [ ] 거래 추가 후 위젯 데이터 업데이트 확인
- [ ] 위젯 탭 시 앱 홈 화면으로 이동
- [ ] 앱 미실행 상태에서도 마지막 저장 데이터 표시
- [ ] 다크 모드 위젯 대응
