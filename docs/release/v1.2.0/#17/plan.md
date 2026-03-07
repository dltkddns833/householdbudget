# #17 푸시 알림

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/17

## 개요

중요한 시점에 푸시 알림을 보내 앱 활용도를 높인다.
Firebase Cloud Messaging (FCM) + Cloud Functions 스케줄 트리거로 구현한다.

---

## Firestore 데이터 모델

### FCM 토큰 저장

```
users/{uid}
  - fcmToken?: string       // 기기 FCM 토큰
  - notificationSettings: {
      budgetAlert: boolean,    // 예산 80% 초과 알림
      recurringAlert: boolean, // 고정비 납부일 알림
      monthlySetup: boolean,   // 월 초 예산 설정 안내
    }
```

> `users/{uid}` 컬렉션은 현재 미사용. 알림 기능 구현 시 신규 생성.

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
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

## 구현 파일 목록

### 클라이언트 (React Native)

| 파일 | 역할 |
|------|------|
| `src/features/notifications/services/notificationService.ts` | FCM 토큰 등록 & 알림 권한 요청 |
| `src/features/notifications/hooks/useNotifications.ts` | 토큰 저장, 포그라운드 알림 처리 |
| `src/features/settings/screens/NotificationSettingScreen.tsx` | 알림 설정 화면 |

### 수정 (클라이언트)

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | NotificationSettings, UserProfile 타입 추가 |
| `src/app/App.tsx` | 앱 시작 시 FCM 토큰 등록 |
| `src/features/settings/screens/MoreMenuScreen.tsx` | "알림 설정" 메뉴 추가 |
| `src/app/navigation/MainTabNavigator.tsx` | MoreStack에 NotificationSetting 스크린 추가 |

### Cloud Functions (신규)

```
functions/
  src/
    notifications/
      budgetAlertTrigger.ts     // Firestore 트리거: monthlySummary 갱신 시 예산 80% 체크
      recurringAlertScheduler.ts // 매일 오전 9시: 오늘 납부일인 고정비 알림
      monthlySetupScheduler.ts   // 매월 1일 오전 8시: 예산 설정 안내 알림
```

---

## 의존성 추가

```bash
# 클라이언트
pnpm add @react-native-firebase/messaging
cd ios && pod install

# Cloud Functions
cd functions && npm i firebase-admin firebase-functions
```

---

## 알림 종류 상세

### 1. 예산 80% 초과 알림 (Firestore 트리거)

- **트리거**: `monthlySummaries/{yearMonth}` 문서 업데이트
- **조건**: `categoryBreakdown[category] / budgets[category] >= 0.8`
- **메시지**: "식비 예산의 83%를 사용했어요 (남은 예산: 84,000원)"
- **중복 방지**: 이미 발송된 카테고리는 Firestore 플래그로 관리

### 2. 고정비 납부일 알림 (스케줄)

- **트리거**: Cloud Functions Scheduler — 매일 오전 9시
- **조건**: `recurringTransactions.dayOfMonth === 오늘 날짜 && isActive === true`
- **메시지**: "월세 납부일이에요 (500,000원)"

### 3. 월 초 예산 설정 안내 (스케줄)

- **트리거**: 매월 1일 오전 8시
- **조건**: 해당 월 `budgets/{yearMonth}` 문서 없음
- **메시지**: "이번 달 예산을 설정해보세요"

---

## 화면 구성 / UX

### NotificationSettingScreen

```
Header: "알림 설정"

[예산 초과 알림]          [토글]
  카테고리별 예산 80% 초과 시

[고정비 납부일 알림]      [토글]
  설정한 납부일 당일 오전 9시

[월 초 예산 설정 안내]    [토글]
  매월 1일, 예산 미설정 시

[시스템 알림 설정으로 이동] →
```

---

## FCM 토큰 등록 흐름

1. 앱 시작 시 `messaging().requestPermission()` 호출
2. 권한 허용 시 `messaging().getToken()` → FCM 토큰 취득
3. `users/{uid}.fcmToken` Firestore에 저장
4. 토큰 갱신 리스너 등록 (`onTokenRefresh`)

---

## 검증 항목

- [ ] 앱 시작 시 FCM 토큰 등록 및 Firestore 저장 확인
- [ ] iOS/Android 알림 권한 요청 동작
- [ ] 예산 80% 초과 시 알림 수신 (Firestore 트리거 동작)
- [ ] 고정비 납부일 당일 알림 수신 (스케줄 트리거 동작)
- [ ] 월 초 예산 설정 안내 알림 수신
- [ ] 알림 설정 화면에서 개별 토글 저장 확인
- [ ] 알림 비활성화 시 해당 알림 미발송 확인
- [ ] 포그라운드 상태에서 알림 수신 처리
- [ ] 알림 탭 시 해당 화면으로 딥링크 이동
