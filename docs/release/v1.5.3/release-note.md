# v1.5.3 릴리즈 노트

**릴리즈 날짜**: 2026-04-01
**versionCode**: 9

---

## 버그 수정

### 09시 이전 거래가 전날로 표시되는 UTC 버그 수정

자정~오전 9시 사이에 등록한 거래가 전날 날짜로 저장되던 문제 해결.

- 원인: 날짜 처리 시 UTC 기준으로 변환되어 KST(+9) 오프셋만큼 날짜가 밀림
- 수정: 로컬 타임존 기준으로 날짜를 처리하도록 변경

커밋: 02cb6f1

### 재무상태 월 자동 초기화 실패 시 에러 처리 및 수동 재시도 추가

재무상태 화면에서 새 달 진입 시 자동 초기화가 실패하면 빈 화면이 표시되던 문제 해결.

- 에러 발생 시 사용자에게 알림 표시 및 수동 재시도 버튼 추가

커밋: 1f68888

---

## CI/CD

### GitHub Actions Android 빌드 & Firebase Distribution 배포 자동화 (#36)

수동으로 진행하던 Android 빌드 및 Firebase App Distribution 배포를 GitHub Actions로 자동화.

- `.github/workflows/distribute-android.yml` 워크플로우 생성
- 트리거: 수동 실행(workflow_dispatch) + `v*` 태그 push
- Gradle 빌드 후 Firebase CLI로 APK 업로드
- `gradle.properties`에서 macOS 전용 JAVA_HOME 하드코딩 제거
- `hermesCommand`를 rootDir 기준 상대경로로 변경
- `pnpm-lock.yaml` git 트래킹 추가

관련 이슈: #36
