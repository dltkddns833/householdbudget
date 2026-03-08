# #29 가족 탈퇴 기능

## 개요

더보기 화면에 가족에서 나가는 방법이 없다.
잘못된 초대 코드로 합류했거나 다른 가족으로 옮기려는 경우에 수동 DB 수정이 필요한 상황.

또한 #12(joinFamily 중복 참여 방지)에서 "기존 가족 탈퇴 없이 중복 참여 불가" 처리를 하려면,
탈퇴 기능이 먼저 있어야 사용자가 직접 해결할 수 있다.

---

## 처리 로직

```
1. 확인 다이얼로그 표시
2. Firestore 트랜잭션:
   a. families/{familyId}.members 에서 uid 제거 (arrayRemove)
   b. families/{familyId}.memberNames.{uid} 필드 삭제
   c. users/{uid}.familyId = null
3. authStore.reset() → FamilySetupScreen으로 이동
```

### 마지막 멤버가 탈퇴하는 경우

가족의 마지막 구성원이 탈퇴하면 가족 문서가 고아(orphan)가 된다.
→ 마지막 멤버 탈퇴 시 `families/{familyId}` 문서 전체 삭제.
(거래·summary 등 하위 컬렉션은 Firestore 자동 삭제 안 됨 → Cloud Functions로 정리하거나 스크립트로 별도 처리. 우선은 무시하고 부모 문서만 삭제.)

---

## Firestore 데이터 모델

변경 없음. 기존 필드 값만 수정.

### Firestore Rules 추가 필요

현재 family update 규칙이 `isFamilyMember` 전용이라 자기 자신을 members에서 제거하는 것도 허용해야 한다:

```
allow update: if isFamilyMember(familyId) ||
  // 신규 멤버 추가 (joinFamily)
  (...) ||
  // 탈퇴: 본인 uid만 members에서 제거
  (isAuth() &&
   resource.data.members.hasAll(request.resource.data.members) &&
   !(request.auth.uid in request.resource.data.members) &&
   request.resource.data.members.size() == resource.data.members.size() - 1);
```

---

## 신규 타입

없음.

---

## 구현 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/features/auth/services/authService.ts` | 수정 | `leaveFamily(uid, familyId)` 함수 추가 |
| `src/features/settings/screens/MoreMenuScreen.tsx` | 수정 | 가족 탈퇴 메뉴 항목 추가 |
| `firestore.rules` | 수정 | family update에 탈퇴(self-remove) 허용 조건 추가 |

---

## 화면 구성

### 더보기 > 가족 탈퇴 메뉴

- 위치: 로그아웃 바로 위
- 아이콘: `group-remove`
- 색상: `colors.danger`

### 탈퇴 확인 다이얼로그

```
제목: 가족 탈퇴
내용: 가족에서 탈퇴하면 데이터를 함께 볼 수 없게 됩니다.
      탈퇴하시겠습니까?
버튼: [취소] [탈퇴]
```

탈퇴 완료 후 → `FamilySetupScreen` (새 가족 만들기 or 초대 코드 입력)

---

## 검증 항목

- [ ] 가족 탈퇴 후 `families/{id}.members`에서 uid 제거 확인
- [ ] 가족 탈퇴 후 `families/{id}.memberNames.{uid}` 필드 삭제 확인
- [ ] 가족 탈퇴 후 `users/{uid}.familyId == null` 확인
- [ ] 탈퇴 후 FamilySetupScreen으로 정상 이동
- [ ] 마지막 멤버 탈퇴 시 `families/{id}` 문서 삭제 확인
- [ ] 탈퇴 후 재진입 시 다른 가족 초대 코드로 합류 가능
- [ ] Firestore Rules — 본인 uid 제거만 허용, 타인 uid 제거 시 거부
