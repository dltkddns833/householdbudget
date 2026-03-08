# v1.4.0 릴리즈 노트

**릴리즈 날짜**: 2026-03-08
**versionCode**: 5

---

## 신규 기능

### #33 설정 화면 분리 — 우측 상단 톱니바퀴

더보기 화면에서 설정 관련 항목을 별도 `SettingsScreen`으로 분리.

- `SettingsScreen` 신규 생성: 화면 모드, 알림 설정, 로그아웃, 회원 탈퇴
- 더보기 헤더 우측 상단 톱니바퀴(⚙️) 버튼으로 진입
- 더보기는 기능 허브(재무상태·예산·정기지출·저축률·자산목표·가족정보)에 집중

관련 이슈: [#33](https://github.com/dltkddns833/householdbudget/issues/33) | 커밋: 748bb80

---

### #30 회원 탈퇴 기능

App Store·Google Play 필수 정책 대응.

- Google 재인증 → 가족 탈퇴(`leaveFamily`) → `users` 문서 삭제 → Firebase Auth 계정 삭제
- 마지막 가족 구성원 탈퇴 시 가족 문서·초대 코드 일괄 삭제
- `SettingsScreen` 계정 섹션 하단에 위치
- Firestore Rules: `users/{userId}` 삭제 권한 추가

관련 이슈: [#30](https://github.com/dltkddns833/householdbudget/issues/30) | 커밋: 748bb80

---

## 버그 수정

### #22 화면 모드 선택, 앱 재시작 시 미반영

react-native-mmkv v2.12.2가 New Architecture(RN 0.84)에서 스토리지 초기화에 실패하여 themePreference가 인메모리로만 저장되던 문제 수정.

- react-native-mmkv v2.12.2 → v3.3.3 업그레이드 (New Architecture 공식 지원)
- Android: 재빌드만으로 즉시 적용. iOS: pod install 필요.

관련 이슈: [#22](https://github.com/dltkddns833/householdbudget/issues/22) | 커밋: 748bb80

---

### #32 카메라·앨범 권한 다이얼로그 미표시 및 기능 미작동 (Android)

영수증 첨부 기능 전체 불가 문제 수정 (Android 완료, iOS는 pod install 후 적용).

- 기존 라이브러리를 `react-native-image-picker` v7.1.2로 교체 (자동 권한 요청 지원)
- Android `READ_MEDIA_IMAGES` 권한 추가 (Android 13+)
- iOS `PrivacyInfo.xcprivacy` 사진 라이브러리 접근 사유 추가
- 취소·에러 응답 핸들링 보완 (`didCancel`, `errorCode` 체크)

관련 이슈: [#32](https://github.com/dltkddns833/householdbudget/issues/32) | 커밋: 748bb80

---

## 기타

- 하단 탭 버튼 Android ripple(원형 효과) 제거 — `tabBarButton`을 `TouchableOpacity`로 교체 | 커밋: 5bf112e
