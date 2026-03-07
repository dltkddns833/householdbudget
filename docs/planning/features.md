# 기능 우선순위 및 대기 이슈

> 마지막 업데이트: 2026-03-07

---

## 작업 순서

### 🔴 1순위 — 보안 (즉시 처리)

| 이슈 | 제목 | 심각도 |
|------|------|--------|
| [#8](https://github.com/dltkddns833/householdbudget/issues/8) | Firestore Rules — 인증된 모든 사용자가 전체 users/families 읽기 가능 | critical |
| [#9](https://github.com/dltkddns833/householdbudget/issues/9) | 초대 코드 — 암호학적으로 취약하고 영구 유효 | critical |
| [#12](https://github.com/dltkddns833/householdbudget/issues/12) | joinFamily — 기존 가족 탈퇴 없이 중복 참여 허용 | high |
| [#13](https://github.com/dltkddns833/householdbudget/issues/13) | 서버측 입력값 검증 없음 — amount 음수·임의 category 주입 가능 | high |
| [#10](https://github.com/dltkddns833/householdbudget/issues/10) | monthlySummary를 클라이언트가 직접 계산/쓰기 — 임의 데이터 삽입 가능 | high |

> 채원 합류로 실사용자가 2명이 됨. Firestore Rules 등 보안 이슈를 먼저 처리하지 않으면
> 데이터 노출 위험이 커짐.

---

### 🟡 2순위 — 기능 (채원 합류 이후 필요한 것 우선)

| 이슈 | 제목 | 비고 |
|------|------|------|
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
- **드롭된 이슈**: 없음 (기존에 드롭했던 #3 재오픈)
