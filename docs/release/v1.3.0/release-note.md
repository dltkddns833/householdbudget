# v1.3.0 릴리즈 노트

**릴리즈 날짜**: 2026-03-07
**versionCode**: 4

---

## 버그 수정

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

### #24 더보기 클릭 시 스크롤 초기화 안됨

더보기 탭을 탭했을 때 스크롤이 최상단으로 초기화되지 않는 문제 수정.

- 원인: `tabPress` 리스너의 `e.preventDefault()` 호출이 `useScrollToTop`의 `e.defaultPrevented` 체크를 막고 있었음
- `MainTabNavigator`의 More/Stats 탭 커스텀 `tabPress` 리스너 제거
- React Navigation 기본 동작(서브스크린 → 루트 pop, 루트에서 scroll-to-top)으로 대체

관련 이슈: [#24](https://github.com/dltkddns833/householdbudget/issues/24)
