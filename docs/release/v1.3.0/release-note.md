# v1.3.0 릴리즈 노트

**릴리즈 날짜**: 2026-03-08
**versionCode**: 4

---

## 보안

### #8 Firestore Rules — families 읽기 권한 강화

인증된 모든 사용자가 타인의 가족 문서를 읽을 수 있던 문제 수정.

- `families/{familyId}` 읽기를 `isFamilyMember`로 제한 (멤버 전용)
- `users/{userId}` 읽기를 본인 전용으로 유지
- `inviteCodes` 컬렉션 도입으로 join 흐름 재설계 (#9 연계)

관련 이슈: [#8](https://github.com/dltkddns833/householdbudget/issues/8) | 커밋: 36c223f

---

### #9 초대 코드 보안 강화

`Math.random()` 기반 영구 초대 코드를 암호학적으로 안전한 만료형 코드로 교체.

- `inviteCodes/{code}` 최상위 컬렉션 신규 도입 (`familyId`, `expiresAt`, `createdBy`)
- 코드 생성: `uuid()` 기반 8자리 대문자 (`Math.random()` 제거)
- 유효 기간 7일, 만료 코드 입력 시 에러 반환
- `authService`에 `createInviteCode`, `getActiveInviteCode`, `regenerateInviteCode` 추가
- `Family` 타입에서 `inviteCode` 필드 제거, `InviteCode` 타입 신규 추가

관련 이슈: [#9](https://github.com/dltkddns833/householdbudget/issues/9) | 커밋: 36c223f

---

### #10 monthlySummary Cloud Functions 이전

클라이언트가 직접 monthlySummary를 계산·쓰던 구조를 서버로 이전.

- `functions/src/onTransactionWrite.ts`: 트랜잭션 쓰기 이벤트 트리거
- `functions/src/recalculateSummary.ts`: 집계 계산 순수 함수 분리
- `transactionService.recalculateMonthlySummary()` 완전 제거
- 날짜 변경 수정 시 이전 월 + 새 월 summary 동시 갱신

관련 이슈: [#10](https://github.com/dltkddns833/householdbudget/issues/10) | 커밋: 36c223f, 6647987

---

### #12 joinFamily 중복 참여 방지

초대 코드 입력 시 이미 다른 가족에 속한 유저가 중복 참여할 수 있던 문제 수정.

- `joinFamily` 시작 시 `users/{uid}.familyId` 사전 확인
- 이미 가족 소속이면 에러 반환: "이미 가족에 속해있습니다. 기존 가족에서 탈퇴 후 다시 시도해주세요."
- Firestore Rules에서도 중복 추가 불가 조건 추가 (이중 방어)

관련 이슈: [#12](https://github.com/dltkddns833/householdbudget/issues/12) | 커밋: 36c223f

---

### #13 서버측 입력값 검증 추가

클라이언트 우회 시 음수 금액·임의 카테고리 등 비정상 데이터 삽입이 가능하던 문제 수정.

- `firestore.rules`에 `isValidTransactionFields()` / `isValidTransactionCreate()` 함수 추가
- 검증 항목: type, amount(양의 정수·최대 10억), category(허용 16개), name(1~100자), memo(0~200자)
- create: `createdBy == auth.uid` 추가 검증 / update: 타 멤버 거래 수정 허용

관련 이슈: [#13](https://github.com/dltkddns833/householdbudget/issues/13) | 커밋: 36c223f, 6647987

---

## 신규 기능

### #31 가족 정보 화면

더보기 > 가족 정보를 전용 화면으로 확장.

- `FamilyInfoScreen` 신규: 멤버 목록(프로필 사진/이니셜·이름·"나" 뱃지·역할), 초대 코드(코드·만료일·복사·재생성), 가족 탈퇴 버튼
- `MoreMenuScreen` 프로필 카드에 가족 정보 행 통합 (멤버 이름 미리보기)

관련 이슈: [#31](https://github.com/dltkddns833/householdbudget/issues/31) | 커밋: 703f6ec

---

### #29 가족 탈퇴 기능

가족에서 나갈 수 있는 방법이 없던 문제 해결.

- `authService.leaveFamily()`: 마지막 멤버 탈퇴 시 가족 문서·초대 코드 일괄 삭제, 일반 탈퇴 시 members·memberNames에서 제거
- 가족 정보 화면 하단 '가족 탈퇴' 버튼으로 진입

관련 이슈: [#29](https://github.com/dltkddns833/householdbudget/issues/29) | 커밋: 703f6ec

---

## 버그 수정

### #34 가족 설정 화면에서 로그인 화면으로 돌아가는 UI 없음

`FamilySetupScreen` choose 모드에서 다른 계정으로 전환할 방법이 없던 문제 수정.

- 하단에 '다른 계정으로 로그인' 버튼 추가 → 확인 Alert → 로그아웃 후 LoginScreen 이동

관련 이슈: [#34](https://github.com/dltkddns833/householdbudget/issues/34) | 커밋: e6e3340

---

### #22 화면 모드 선택, 앱 재시작 시 미반영

Zustand `persist` 스토어의 hydration(MMKV에서 테마 복원)이 완료되기 전에 스플래시 화면이 끝나는 경우 기본값('system')으로 렌더링되는 문제 수정.

- `RootNavigator`에 `useUIStore.persist.hasHydrated()` / `onFinishHydration()` 체크 추가
- 스토어 hydration 완료 후 스플래시가 종료되도록 `isReady` 조건 수정

관련 이슈: [#22](https://github.com/dltkddns833/householdbudget/issues/22)

---

### #23 재무상태 추가/삭제 없음

재무상태 화면에서 계좌를 추가하거나 삭제할 수 없었던 문제 수정.

- `useAddAccount`, `useDeleteAccount` 훅 추가 (`useAssets.ts`)
- `AssetAddScreen` 신규 생성 (분류, 소유자, 계좌명, 금융기관, 유형, 금액 입력 폼)
- `AssetScreen` 헤더 우측에 `+` 버튼 추가 → 계좌 추가 화면으로 이동
- `AssetEditScreen` 헤더 우측에 삭제 버튼 추가 (확인 Alert 포함)
- `MainTabNavigator`에 `AssetAdd` 라우트 등록

관련 이슈: [#23](https://github.com/dltkddns833/householdbudget/issues/23)

---

### 로그인 화면 디자인 개선

기존 이모지 아이콘 대신 실제 앱 로고를 사용하고, 브랜드 컬러에 맞게 전면 재디자인.

- 배경을 teal(#0D9488) 단색으로 변경
- 앱 아이콘 이미지(`app-icon.png`) 적용 — 이모지 "💰" 제거
- Google 로그인 버튼을 반투명 글라스 스타일로 변경
- 약관 안내 문구 추가

커밋: f3cae54

---

### #24 더보기 클릭 시 스크롤 초기화 안됨

더보기 탭을 탭했을 때 스크롤이 최상단으로 초기화되지 않는 문제 수정.

- 원인: `tabPress` 리스너의 `e.preventDefault()` 호출이 `useScrollToTop`의 `e.defaultPrevented` 체크를 막고 있었음
- `MainTabNavigator`의 More/Stats 탭 커스텀 `tabPress` 리스너 제거
- React Navigation 기본 동작(서브스크린 → 루트 pop, 루트에서 scroll-to-top)으로 대체

관련 이슈: [#24](https://github.com/dltkddns833/householdbudget/issues/24)
