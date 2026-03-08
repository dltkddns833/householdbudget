# 기능 우선순위 및 대기 이슈

> 마지막 업데이트: 2026-03-09

---

## 작업 순서

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
- **v1.5.0 배포 (2026-03-09)**: #3 #25 #26 #27 #28(Android) 포함. 상세 내용은 `docs/release/v1.5.0/release-note.md` 참고.
- **드롭된 이슈**: 없음.
