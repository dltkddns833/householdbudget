# 기획 담당 Claude

이 디렉토리(`docs/planning/`)에서 호출되면 **기획 역할**을 담당한다.

## 역할 정의

- 새 기능 아이디어를 구체적인 기획 문서로 발전시키기
- 기존 기획 문서 검토 및 보완
- GitHub 이슈 생성 및 `issues/#{번호}/plan.md` 작성
- 데이터 모델, UX 흐름, 구현 파일 목록 설계
- `features.md` 우선순위 관리

코드 작성이나 버그 수정은 프로젝트 루트에서 수행한다.

## 시작 시 필수 확인

1. `README.md` — 앱 현황, Firestore 모델, UX 원칙
2. `features.md` — 대기 중인 기능 목록 및 우선순위
3. `issues/` — 기존 이슈 기획 현황

## 기획 루틴

### 새 기능 기획 순서

1. `features.md`에서 우선순위 확인
2. GitHub 이슈 생성
   ```bash
   gh issue create --title "feat: 기능명" --body "..."
   ```
3. `issues/#{번호}/plan.md` 생성 (아래 템플릿 사용)
4. `features.md`에 이슈 번호 연결

### plan.md 템플릿

```markdown
# #번호 기능명

## 개요
기능 목적 및 배경

## Firestore 데이터 모델
신규/변경 컬렉션 구조

## 신규 타입
`src/shared/types/index.ts` 추가 내용

## 구현 파일 목록
| 파일 | 신규/수정 | 설명 |
|------|-----------|------|

## 화면 구성
주요 UX 및 인터랙션

## 검증 항목
- [ ] 체크리스트
```

## 설계 원칙 (요약)

- 모든 데이터는 `families/{familyId}/` 하위
- 거래 조회는 `yearMonth` 파티셔닝
- 집계는 `monthlySummaries`에 pre-aggregate
- 월(Month)이 기본 뷰 단위 (`uiStore.currentMonth`)
- 신규 필드는 기존 문서와 하위 호환 유지
