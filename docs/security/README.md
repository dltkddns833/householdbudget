# 보안 문서 안내

우리집 가계부 프로젝트의 보안 관련 문서를 관리하는 폴더입니다.

## 문서 목록

| 파일 | 설명 | 최종 검토일 |
|------|------|-------------|
| [security-review.md](./security-review.md) | 전체 보안 검토 보고서 (취약점 목록 및 수정 방향) | 2026-03-06 |

## 현황 요약

`security-review.md` 기준 미해결 취약점:

| 심각도 | 건수 |
|--------|------|
| Critical | 2 |
| High | 3 |
| Medium | 2 |
| Low | 2 |

## 우선순위 체크리스트

아래 항목을 순서대로 처리하는 것을 권장합니다.

- [ ] **[Critical]** Firestore Rules — `users` / `families` 읽기 권한을 본인 및 가족 구성원으로 제한
- [ ] **[Critical]** 초대 코드 — `crypto.getRandomValues()` 전환 + 만료(`expiresAt`) 필드 추가
- [ ] **[High]** `monthlySummary` 집계를 Cloud Functions 서버 측으로 이전
- [ ] **[High]** `joinFamily` — 이미 가족이 있는 사용자의 중복 참여 차단
- [ ] **[High]** 서비스 레이어 입력값 검증 (`amount > 0`, 카테고리 목록 대조, `yearMonth` 형식)
- [ ] **[Medium]** `joinFamily` TOCTOU race condition 해소 (역방향 인덱스 문서 활용)
- [ ] **[Medium]** Firestore Rules 또는 로직에서 가족 구성원 수 상한 설정

## 보안 문서 작성 규칙

- 보안 이슈 발견 시 `security-review.md`에 항목을 추가하고, 심각도(Critical / High / Medium / Low)와 대상 파일 경로·라인 번호를 명시합니다.
- 이슈가 해결되면 해당 항목에 **[해결됨]** 표시와 수정 커밋 해시를 기록합니다.
- 민감한 정보(키, 토큰, 실제 사용자 데이터)는 이 폴더의 어떤 파일에도 포함하지 않습니다.
- 이 폴더의 모든 파일은 `git` 히스토리에 남으므로 위 규칙을 커밋 전에 반드시 확인합니다.
