# v1.5.1 릴리즈 노트

**릴리즈 날짜**: 2026-03-09
**versionCode**: 7

---

## 버그 수정

### #35 Android 거래 추가 날짜 선택 버그 수정

Android에서 거래 추가 시 DatePicker가 정상 동작하지 않던 문제 해결.

- 원인: `@react-native-community/datetimepicker`를 커스텀 Modal 안에 `display="spinner"`로 렌더링 시, Android 네이티브 다이얼로그와 충돌
- 수정: Android에서 imperative API(`DateTimePickerAndroid.open()`)를 사용하도록 전환
- iOS는 기존 Modal + spinner 방식 그대로 유지

관련 이슈: [#35](https://github.com/dltkddns833/householdbudget/issues/35) | 커밋: c392d7c

---

## 개선

### 더보기 화면 앱 버전 표시 수정

- 더보기 화면에 표시되는 앱 버전을 실제 버전과 일치하도록 수정 (v1.0.0 → v1.5.1)

---

## 패키지 호환성 업그레이드

RN 0.84 + New Architecture 환경에서 iOS 빌드 실패를 유발하는 패키지 업그레이드.

| 패키지 | 이전 | 이후 | 사유 |
|---|---|---|---|
| `react-native-share` | 11.0.0 | 12.2.5 | `RCT-Folly` 의존성 제거됨 |
| `react-native-view-shot` | 4.0.0 | 5.0.0-alpha.2 | `RCTScrollView` 제거 대응 |

---
