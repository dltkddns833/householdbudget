# #8 Firestore Rules — families 컬렉션을 인증된 모든 사용자가 읽기 가능

## 개요

현재 `firestore.rules`:

```
match /families/{familyId} {
  allow read: if isAuth();   // ← 인증된 모든 유저가 전체 가족 데이터 읽기 가능
  ...
}
```

이는 초대 코드 입력 시 `families` 컬렉션을 where 쿼리해야 했기 때문에 열어둔 것이다.
결과적으로 타인의 가족 멤버 목록, memberNames, savingRateGoal 등이 전부 노출된다.

`users` 읽기는 이미 `request.auth.uid == userId` 로 수정 완료됨.

### #9와의 관계

`inviteCode`를 `families` 문서에 저장하는 한, join 흐름에서 families를 읽어야 한다.
#9에서 `inviteCodes` 별도 컬렉션으로 분리하면, families read를 멤버 전용으로 제한할 수 있다.

**#9 완료 이후에 이 이슈를 처리한다.**

---

## 해결 설계

#9의 `inviteCodes/{code}` 컬렉션 도입을 전제로:

### Firestore Rules 전면 정비

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    function isFamilyMember(familyId) {
      return isAuth() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.familyId == familyId;
    }

    // 사용자 본인만 읽기/쓰기
    match /users/{userId} {
      allow read, write: if isAuth() && request.auth.uid == userId;
    }

    // 초대 코드 — 읽기: 인증 사용자 전체(join 조회 필요), 쓰기: 해당 가족 멤버만
    match /inviteCodes/{code} {
      allow read: if isAuth();
      allow create: if isAuth() &&
        isFamilyMember(request.resource.data.familyId);
      allow delete: if isAuth() &&
        isFamilyMember(resource.data.familyId);
    }

    // 가족 — 읽기: 멤버 전용 (families 전체 노출 차단)
    match /families/{familyId} {
      allow read: if isFamilyMember(familyId);
      allow create: if isAuth();
      allow update: if isFamilyMember(familyId) ||
        // 신규 멤버 자신 추가 허용 (joinFamily 트랜잭션)
        (isAuth() &&
         request.resource.data.members.hasAll(resource.data.members) &&
         request.auth.uid in request.resource.data.members &&
         !(request.auth.uid in resource.data.members));

      // 하위 컬렉션 — 멤버 전용
      match /transactions/{txId} {
        allow read, create, update, delete: if isFamilyMember(familyId);
      }
      match /recurringTransactions/{recurringId} {
        allow read, create, update, delete: if isFamilyMember(familyId);
      }
      match /monthlySummaries/{yearMonth} {
        allow read: if isFamilyMember(familyId);
        allow write: if false; // #10 해결 후 Cloud Functions 전용
      }
      match /overview/{yearMonth} {
        allow read, write: if isFamilyMember(familyId);
      }
      match /goals/{goalId} {
        allow read, create, update, delete: if isFamilyMember(familyId);
      }
      match /financialStatus/{yearMonth} {
        allow read, write: if isFamilyMember(familyId);
        match /accounts/{accountId} {
          allow read, write: if isFamilyMember(familyId);
        }
      }
    }
  }
}
```

> `monthlySummaries` write를 `false`로 막는 것은 #10(Cloud Functions 마이그레이션) 완료 후 적용.
> #10 전에는 기존대로 `isFamilyMember` 유지.

---

## Firestore 데이터 모델

신규 컬렉션: `inviteCodes/{code}` (#9 참고)

`families/{familyId}` 에서 `inviteCode` 필드 제거 (마이그레이션 스크립트 필요).

---

## 신규 타입

없음 (#9에서 처리).

---

## 구현 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `firestore.rules` | 수정 | families read 멤버 전용으로 변경, inviteCodes 컬렉션 규칙 추가 |
| `scripts/removeFamilyInviteCode.ts` | 신규 | 기존 families 문서에서 inviteCode 필드 제거 마이그레이션 |

---

## 화면 구성

변경 없음. Rules 레벨 변경만.

---

## 검증 항목

- [ ] #9 완료 여부 확인 (inviteCodes 컬렉션 도입)
- [ ] 로그인한 타인 계정으로 내 가족 문서 직접 get → 거부 확인
- [ ] `isFamilyMember` get() 호출 — 청구 증가 여부 모니터링 (읽기 1회/요청)
- [ ] `joinFamily` 흐름 — inviteCode 조회 → family members 추가 정상 동작
- [ ] 가족 멤버 본인은 가족 문서 읽기 정상
- [ ] 하위 컬렉션 (transactions, financialStatus 등) 멤버 전용 접근 유지
- [ ] 기존 families 문서 inviteCode 필드 마이그레이션 완료
