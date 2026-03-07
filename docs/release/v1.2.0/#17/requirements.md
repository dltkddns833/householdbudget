# #17 푸시 알림 — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(App.tsx, MoreMenuScreen, MainTabNavigator, Firestore 모델) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 월 초에 앱 알림으로 "이번 달 예산을 설정해보세요" 메시지를 받는다
- 식비 예산의 80%를 넘으면 즉시 알림이 와서 지출을 조심한다
- 고정비 납부일 당일 아침에 알림을 받아 납부를 잊지 않는다
- 알림 설정 화면에서 필요 없는 알림을 개별적으로 끌 수 있다

---

## 2. 기능 요구사항

### 알림 종류

| 알림 | 트리거 | 조건 |
|------|--------|------|
| 예산 80% 초과 | Firestore 트리거 (monthlySummary 갱신) | categoryBreakdown / budget >= 0.8 |
| 고정비 납부일 | Cloud Scheduler (매일 오전 9시) | recurring.dayOfMonth == 오늘 && isActive |
| 월 초 예산 설정 안내 | Cloud Scheduler (매월 1일 오전 8시) | 해당 월 budgets 문서 없음 |

### FCM 토큰 관리

- 앱 시작 시 권한 요청 + 토큰 획득 + Firestore 저장
- 토큰 갱신 리스너 등록

### 알림 설정

- MoreMenu → "알림 설정" 화면
- 알림 종류별 개별 토글
- 시스템 알림 설정 이동 링크

---

## 3. Firestore 데이터 모델

### 신규: users/{uid}

```
users/{uid}
  fcmToken?: string
  notificationSettings: {
    budgetAlert: boolean     // 기본값: true
    recurringAlert: boolean  // 기본값: true
    monthlySetup: boolean    // 기본값: true
  }
```

> `users/{uid}` 컬렉션 신규 생성. 기존 인증 정보(Google Sign-In)와 별개.

### 기존: families 보안 규칙 확인

Cloud Functions에서 `families/{familyId}/budgets`, `recurringTransactions` 읽기 권한 필요.

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
export interface NotificationSettings {
  budgetAlert: boolean;
  recurringAlert: boolean;
  monthlySetup: boolean;
}

export interface UserProfile {
  uid: string;
  fcmToken?: string;
  notificationSettings: NotificationSettings;
}
```

---

## 5. 파일별 TODO

### [신규] src/features/notifications/services/notificationService.ts

- [ ] `requestPermissionAndGetToken(): Promise<string | null>`
  - `messaging().requestPermission()` — 거부 시 null 반환
  - 허용 시 `messaging().getToken()` 반환
- [ ] `saveTokenToFirestore(uid: string, token: string): Promise<void>`
  - `users/{uid}` 문서 merge 업데이트
- [ ] `updateNotificationSettings(uid: string, settings: Partial<NotificationSettings>): Promise<void>`
- [ ] `getNotificationSettings(uid: string): Promise<NotificationSettings>`
  - 문서 없으면 기본값 반환: `{ budgetAlert: true, recurringAlert: true, monthlySetup: true }`

### [신규] src/features/notifications/hooks/useNotifications.ts

- [ ] 앱 시작 시 FCM 토큰 등록 로직 포함
- [ ] `messaging().onTokenRefresh` 리스너 등록 (토큰 갱신 시 Firestore 업데이트)
- [ ] 포그라운드 알림 리스너 `messaging().onMessage` 등록
  - 포그라운드에서는 자동 표시 안 됨 → 로컬 알림으로 수동 표시
- [ ] 알림 탭 시 딥링크 처리 `messaging().onNotificationOpenedApp`
  - `type: 'budget'` → StatsScreen 이동
  - `type: 'recurring'` → RecurringListScreen 이동
  - `type: 'monthly_setup'` → BudgetSettingScreen 이동

### [신규] src/features/settings/screens/NotificationSettingScreen.tsx

- [ ] Header: "알림 설정"
- [ ] 알림 종류별 토글 3개:
  - "예산 초과 알림" — budgetAlert
  - "고정비 납부일 알림" — recurringAlert
  - "월 초 예산 설정 안내" — monthlySetup
- [ ] 토글 변경 시 `updateNotificationSettings` 호출 (디바운스 불필요, 즉시)
- [ ] 하단 "시스템 알림 설정으로 이동" → `Linking.openSettings()` 호출

### [수정] src/app/App.tsx

- [ ] 앱 마운트 시 `useNotifications` 훅 호출 (또는 직접 초기화)
- [ ] 백그라운드에서 알림으로 앱 실행 시 딥링크 처리: `messaging().getInitialNotification()`

### [수정] src/features/settings/screens/MoreMenuScreen.tsx

- [ ] "알림 설정" 메뉴 항목 추가

### [수정] src/app/navigation/MainTabNavigator.tsx

- [ ] `MoreStackParamList`에 `NotificationSetting` 추가
- [ ] `NotificationSettingScreen` import 및 Screen 등록

### [신규] functions/src/notifications/budgetAlertTrigger.ts (Cloud Functions)

- [ ] `onDocumentUpdated('families/{familyId}/monthlySummaries/{yearMonth}', ...)` 트리거
- [ ] 변경된 `categoryBreakdown` 각 카테고리 확인
- [ ] 해당 월 `budgets/{yearMonth}` 문서 조회
- [ ] `categoryBreakdown[cat] / budgets.categories[cat] >= 0.8` 이면 알림 발송
- [ ] 중복 발송 방지: Firestore에 `alertSent: Record<categoryKey, '80' | '100'>` 플래그 저장
- [ ] `budgetAlert === true` 설정한 가족 멤버에게만 발송

### [신규] functions/src/notifications/recurringAlertScheduler.ts (Cloud Functions)

- [ ] Cloud Scheduler: 매일 오전 9시 (KST: Asia/Seoul)
- [ ] 모든 가족의 `recurringTransactions` 조회
- [ ] `dayOfMonth === 오늘 날짜 && isActive === true` 필터
- [ ] `recurringAlert === true` 멤버에게 FCM 발송
- [ ] 메시지: "{title} 납부일이에요 ({amount}원)"

### [신규] functions/src/notifications/monthlySetupScheduler.ts (Cloud Functions)

- [ ] Cloud Scheduler: 매월 1일 오전 8시 (KST)
- [ ] 각 가족의 현재 월 `budgets/{yearMonth}` 문서 존재 여부 확인
- [ ] 없으면 `monthlySetup === true` 멤버에게 FCM 발송
- [ ] 메시지: "이번 달 예산을 설정해보세요"

---

## 6. 의존성 추가

```bash
# 클라이언트
pnpm add @react-native-firebase/messaging
cd ios && pod install

# Cloud Functions
cd functions && npm i firebase-admin firebase-functions
```

iOS `Info.plist`:
- `FirebaseAppDelegateProxyEnabled` = NO (수동 설정 시)

Android `AndroidManifest.xml`:
- `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />` (API 33+)

---

## 7. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 알림 권한 거부 | 알림 설정 화면에서 "시스템 설정에서 켜주세요" 안내 표시 |
| FCM 토큰 없는 사용자 | 알림 발송 건너뜀 (Cloud Functions에서 fcmToken 없으면 스킵) |
| 예산 80% → 100% 연속 발송 | alertSent 플래그로 동일 임계값 중복 발송 방지 |
| 고정비 dayOfMonth > 월 말일 | 말일에 발송 (Cloud Functions에서 말일 클램프) |
| 앱 포그라운드 상태에서 알림 수신 | 로컬 알림 라이브러리로 수동 표시 또는 인앱 배너 표시 |
| 앱 완전 종료 후 알림 탭 | `getInitialNotification()`으로 처리, 해당 화면으로 딥링크 |

---

## 8. 검증 항목

- [ ] 앱 시작 시 FCM 토큰 등록 및 `users/{uid}` Firestore 저장 확인
- [ ] iOS/Android 알림 권한 요청 팝업 표시
- [ ] 알림 설정 화면 토글 변경 → Firestore 저장 확인
- [ ] 예산 80% 초과 시 Cloud Functions 트리거 실행 + 알림 수신 확인
- [ ] 고정비 납부일 당일 알림 수신 (스케줄러 수동 트리거 테스트)
- [ ] 월 초 예산 설정 안내 알림 수신 (수동 트리거 테스트)
- [ ] 알림 비활성화 시 해당 알림 미발송 확인
- [ ] 포그라운드 상태 알림 수신 처리 확인
- [ ] 백그라운드/종료 상태 알림 탭 시 딥링크 이동 확인 (budget → StatsScreen 등)
- [ ] 동일 카테고리 예산 알림 중복 발송 없음 확인
