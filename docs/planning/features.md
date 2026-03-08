# 기능 우선순위 및 대기 이슈

> 마지막 업데이트: 2026-03-08

---

## 작업 순서

### 🔴 1순위 — 보안 (즉시 처리)

> 채원 합류로 실사용자가 2명이 됨. 아래 이슈들은 2026-03-08 코드 검토 결과 **모두 미수정 상태.**
> 권장 처리 순서: #12 → #9+#8 (묶음) → #13 → #10

| 이슈 | 제목 | 심각도 | 현황 |
|------|------|--------|------|
| [#12](https://github.com/dltkddns833/householdbudget/issues/12) | joinFamily — 기존 가족 탈퇴 없이 중복 참여 허용 | high | ❌ 미수정. 채원이 실수로 다른 코드 입력 시 데이터 꼬임 발생 가능 |
| [#9](https://github.com/dltkddns833/householdbudget/issues/9) | 초대 코드 — 암호학적으로 취약하고 영구 유효 | critical | ❌ 미수정. `Math.random()` 6자리, 만료 없음. #8 해결의 선결 조건 |
| [#8](https://github.com/dltkddns833/householdbudget/issues/8) | Firestore Rules — families 컬렉션을 인증된 모든 사용자가 읽기 가능 | critical | ⚠️ 부분 수정. `users` 읽기는 본인만 가능하도록 수정됨. `families` 읽기는 여전히 `isAuth()`만으로 개방. #9와 묶어서 설계 필요 |
| [#13](https://github.com/dltkddns833/householdbudget/issues/13) | 서버측 입력값 검증 없음 — amount 음수·임의 category 주입 가능 | high | ❌ 미수정. Rules에 필드 검증 없음 |
| [#10](https://github.com/dltkddns833/householdbudget/issues/10) | monthlySummary를 클라이언트가 직접 계산/쓰기 — 임의 데이터 삽입 가능 | high | ❌ 미수정. 채원 합류로 파급 범위 증가. Cloud Functions 마이그레이션 필요로 작업량 가장 큰 |

#### #8+#9 설계 방향 메모
- `joinFamily` 흐름이 `families` 컬렉션을 inviteCode로 where 쿼리해야 하므로, families read를 멤버 전용으로 바꾸려면 초대 흐름 자체를 재설계해야 함
- 권장: `inviteCodes/{code}` 별도 컬렉션 (`familyId`, `expiresAt` 포함) → families는 멤버만 읽기 허용

---

### 🟡 2순위 — 기능 (채원 합류 이후 필요한 것 우선)

| 이슈 | 제목 | 비고 |
|------|------|------|
| [#31](https://github.com/dltkddns833/householdbudget/issues/31) | 가족 정보 화면 — 멤버 목록 및 초대 코드 통합 | 더보기 > 가족 정보를 전용 화면으로 확장. #29·#9·#3 연계 허브 역할 |
| [#29](https://github.com/dltkddns833/householdbudget/issues/29) | 가족 탈퇴 기능 | #12 해결의 전제. #31 화면 내 탈퇴 버튼으로 진입 |
| [#30](https://github.com/dltkddns833/householdbudget/issues/30) | 회원 탈퇴 기능 | App Store·Google Play 필수 정책. Google 재인증 후 계정 삭제 |
| [#3](https://github.com/dltkddns833/householdbudget/issues/3) | 가족 멤버별 지출 분리 | 채원 iOS 설치로 재오픈. 두 명 모두 입력하므로 지금 당장 필요 |
| [#25](https://github.com/dltkddns833/householdbudget/issues/25) | 소비 캘린더 뷰 | 구현 난이도 낮고 일상 사용성 향상 |
| [#27](https://github.com/dltkddns833/householdbudget/issues/27) | 자산 변동 추이 상세 | 기존 financialStatus 데이터 재활용, 자산 관리 핵심 |
| [#26](https://github.com/dltkddns833/householdbudget/issues/26) | 월간 결산 리포트 | 월말 루틴으로 활용도 높음, react-native-view-shot 의존성 추가 필요 |
| [#28](https://github.com/dltkddns833/householdbudget/issues/28) | 홈 화면 위젯 | 네이티브(iOS WidgetKit + Android AppWidget) 작업 많아 난이도 높음 |

---

### 🔵 3순위 — 보안 (운영 개선)

| 이슈 | 제목 | 심각도 |
|------|------|--------|
| [#15](https://github.com/dltkddns833/householdbudget/issues/15) | joinFamily TOCTOU Race Condition | medium |
| [#16](https://github.com/dltkddns833/householdbudget/issues/16) | 가족 구성원 수 제한 없음 | medium |
| [#18](https://github.com/dltkddns833/householdbudget/issues/18) | console.error 프로덕션 노출 | low |
| [#19](https://github.com/dltkddns833/householdbudget/issues/19) | serviceAccountKey.json 커밋 방지 | low |

---

## 배경 메모

- **채원 합류 (2026-03-07)**: iOS 기기에 직접 설치하여 사용 시작. 이로 인해 #3 멤버별 지출 분리가 다시 필요해짐.
- **1순위 코드 검토 (2026-03-08)**: 전체 5개 이슈 중 `users` 읽기 규칙만 수정됨. 나머지 4개 + `families` 읽기는 미수정 확인. #9+#8은 구조적으로 연결되어 있어 묶음 설계 필요.
- **드롭된 이슈**: 없음 (기존에 드롭했던 #3 재오픈)
