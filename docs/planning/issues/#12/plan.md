# #12 joinFamily — 기존 가족 탈퇴 없이 중복 참여 허용

## 개요

`joinFamily`를 호출할 때 유저가 이미 다른 가족에 속해있는지 확인하지 않는다.
초대 코드를 입력하면 `users/{uid}.familyId`만 새 가족으로 교체되고,
기존 가족의 `members` 배열에는 uid가 그대로 남아 유령 멤버가 생긴다.

채원이 합류한 현재, 실수로 잘못된 초대 코드를 입력하면 데이터가 꼬이는 현실적인 위험이 있다.

---

## 현재 동작 (문제)

```
1. 유저 A → 가족 X 소속 (familyId = X)
2. 유저 A가 초대 코드 입력 → joinFamily 호출
3. users/A.familyId = Y 로 덮어쓰기
4. families/X.members 에는 A가 그대로 남음
   → 가족 X는 유령 멤버 보유, 가족 Y에는 A가 중복 진입
```

---

## 수정 설계

### 처리 방침
기존 가족이 있으면 즉시 오류를 반환한다.
(자동 탈퇴 후 재가입은 데이터 손실 위험이 있으므로 채택하지 않음)

### joinFamily 수정 로직

```
1. users/{uid} 읽기
2. data.familyId 가 null 이 아니면 → throw '이미 가족에 속해있습니다.'
3. 기존 로직 수행 (초대 코드로 family 조회 → transaction으로 members 추가)
```

Firestore Rules 레벨에서도 이중 가드:
- family update 규칙에서 "uid가 이미 members에 없는 경우에만 추가 허용" 조건 추가

---

## Firestore 데이터 모델

변경 없음.

---

## 신규 타입

없음.

---

## 구현 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/features/auth/services/authService.ts` | 수정 | `joinFamily` — 사전에 `users/{uid}` 읽어 `familyId` 체크 |
| `firestore.rules` | 수정 | family update 시 uid가 이미 members에 없는 경우에만 arrayUnion 허용 |
| `src/features/auth/screens/FamilySetupScreen.tsx` | 수정 | 에러 메시지 "이미 가족에 속해있습니다" UI 처리 |

---

## 화면 구성

변경 없음. 에러 핸들링만 추가.

- `FamilySetupScreen` 초대 코드 입력 후 join 시도 → 이미 가족 소속이면 Alert 표시
  - 메시지: "이미 가족에 속해있습니다. 기존 가족에서 탈퇴 후 다시 시도해주세요."

---

## 검증 항목

- [ ] 가족이 없는 신규 유저 → 초대 코드 입력 → 정상 참여
- [ ] 이미 가족 X 소속 유저 → 초대 코드 입력 → 에러 반환, 기존 가족 유지
- [ ] Firestore Rules 단에서도 중복 추가 차단 확인
- [ ] 에러 메시지 Alert 정상 표시
