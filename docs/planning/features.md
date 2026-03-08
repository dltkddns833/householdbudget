# 기능 우선순위 및 대기 이슈

> 마지막 업데이트: 2026-03-09

---

## 작업 순서

### 🟡 2순위 — 기능

| 이슈 | 제목 | 비고 |
|------|------|------|
| [#3](https://github.com/dltkddns833/householdbudget/issues/3) | 가족 멤버별 지출 분리 | 채원 합류로 재오픈. 두 명 모두 입력하므로 필요 |
| [#25](https://github.com/dltkddns833/householdbudget/issues/25) | 소비 캘린더 뷰 | 구현 난이도 낮고 일상 사용성 향상 |
| [#27](https://github.com/dltkddns833/householdbudget/issues/27) | 자산 변동 추이 상세 | 기존 financialStatus 데이터 재활용, 자산 관리 핵심 |
| [#26](https://github.com/dltkddns833/householdbudget/issues/26) | 월간 결산 리포트 | 월말 루틴으로 활용도 높음, react-native-view-shot 의존성 추가 필요 |
| [#28](https://github.com/dltkddns833/householdbudget/issues/28) | 홈 화면 위젯 | 네이티브(iOS WidgetKit + Android AppWidget), 난이도 높음 |

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

- **채원 합류 (2026-03-07)**: iOS 기기에 직접 설치하여 사용 시작. #3 멤버별 지출 분리 재오픈.
- **v1.3.0 배포 (2026-03-08)**: 1순위 보안 5종 (#8 #9 #10 #12 #13) + #29 #31 #34 포함. 상세 내용은 `docs/release/v1.3.0/release-note.md` 참고.
- **v1.4.0 배포 (2026-03-09)**: #22 #30 #32 #33 포함. 상세 내용은 `docs/release/v1.4.0/release-note.md` 참고.
- **드롭된 이슈**: 없음.
