# 보안 검토 보고서

- 검토일: 2026-03-06
- 대상: 우리집 가계부 (React Native + Firebase)

---

## 요약

| 심각도 | 건수 |
|--------|------|
| Critical | 2 |
| High | 3 |
| Medium | 2 |
| Low | 2 |

---

## Critical

### 1. Firestore Rules — 인증된 모든 사용자가 전체 users/families 읽기 가능

**파일:** `firestore.rules:17, 24-25`

```
allow read: if isAuth();  // users 컬렉션 전체
allow read: if isAuth();  // families 컬렉션 전체
```

인증된 사용자라면 누구든 모든 유저 문서(`email`, `familyId`, `photoURL`)와 모든 가족 문서(`inviteCode`, `members`)를 읽을 수 있습니다. 다른 가족의 초대 코드가 사실상 공개 상태입니다.

**수정 방향:**

```
// users: 본인 문서만 읽기
match /users/{userId} {
  allow read: if isAuth() && request.auth.uid == userId;
  ...
}

// families: 해당 가족 구성원만 읽기
match /families/{familyId} {
  allow read: if isFamilyMember(familyId);
  ...
}
```

단, `isFamilyMember()`가 내부적으로 `get(/users/...)` 읽기를 수행하므로 rules 배포 전에 순환 참조 여부를 확인해야 합니다.

---

### 2. 초대 코드 — 암호학적으로 취약하고 영구 유효

**파일:** `src/features/auth/services/authService.ts:55`

```ts
const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
```

- `Math.random()`은 CSPRNG(암호학적 난수 생성기)가 아니어서 예측 가능합니다.
- 6자리 alphanumeric 코드는 약 2.17억 가지 조합입니다.
- Firestore rules에 rate limiting이 없어 brute-force 시도가 가능합니다.
- 초대 코드는 **만료되지 않고 취소할 수 없습니다.** 코드가 유출되면 영구적으로 가족 데이터에 접근할 수 있습니다.

**수정 방향:**

- `crypto.getRandomValues()` 또는 Node.js `crypto.randomBytes()`로 교체
- 코드에 만료 시각(`expiresAt`) 필드 추가
- 가족 참여 후 코드 재생성 옵션 제공

---

## High

### 3. monthlySummary를 클라이언트가 직접 계산/쓰기

**파일:** `src/features/transactions/services/transactionService.ts:88-113`

거래 추가/수정/삭제 후 `recalculateMonthlySummary()`가 클라이언트에서 실행되어 `monthlySummaries` 컬렉션에 직접 씁니다. Firestore rules도 가족 구성원이면 `write`를 허용하므로, 클라이언트가 임의의 요약 데이터를 삽입할 수 있습니다.

**수정 방향:**

- Cloud Functions의 Firestore 트리거(`onDocumentWritten`)로 서버 측에서 재집계
- `monthlySummaries`의 write를 rules에서 차단 (`allow write: if false;`)

---

### 4. joinFamily — 기존 가족 탈퇴 없이 중복 참여 허용

**파일:** `src/features/auth/services/authService.ts:71-97`

이미 가족에 속한 사용자가 다른 초대 코드로 `joinFamily`를 호출하면:

- 기존 가족의 `members` 배열에 UID가 그대로 남음 (고아 멤버 발생)
- `users/{uid}.familyId`만 새로운 값으로 덮어씌워짐
- 이후 `isFamilyMember` 체크는 새 가족 기준으로 통과되어 기존 가족 데이터 접근 불가

**수정 방향:**

- `joinFamily` 진입 시 기존 `familyId` 확인, 이미 가족이 있으면 에러 반환
- Firestore rules에서 이미 `familyId`가 있는 사용자의 가족 참여를 차단

---

### 5. 서버측 입력값 검증 없음

**파일:** `src/features/transactions/services/transactionService.ts:12-34`

서비스 레이어에서 입력 데이터를 그대로 Firestore에 씁니다.

- `amount`에 음수 허용 → 총합/잔액 조작 가능
- `category`를 정의된 카테고리 목록과 대조하지 않음 → 임의 문자열 주입 가능
- `yearMonth` 형식(`YYYY-MM`) 검증 없음 → 예상치 못한 문서 키 생성 가능

**수정 방향:**

- 서비스 계층에 validation 추가 (`amount > 0`, `category in VALID_CATEGORIES`, `yearMonth` 정규식 검증)
- 또는 Cloud Functions에서 서버 측 검증

---

## Medium

### 6. joinFamily TOCTOU Race Condition

**파일:** `src/features/auth/services/authService.ts:72-89`

`inviteCode` 조회 쿼리가 트랜잭션 외부에서 실행됩니다. 쿼리와 트랜잭션 사이에 해당 코드가 변경되거나 삭제되는 경우 일관성이 깨질 수 있습니다.

**수정 방향:**

- Firestore 트랜잭션 내에서 문서 조회와 업데이트를 모두 처리하도록 리팩터링 (단, Firestore 트랜잭션은 `where` 쿼리를 지원하지 않으므로 inviteCode → familyId 역방향 인덱스 문서를 별도 컬렉션에 두는 구조가 필요)

---

### 7. 가족 구성원 수 제한 없음

**파일:** `src/features/auth/services/authService.ts:85`

`arrayUnion`으로 구성원을 추가할 때 상한선이 없습니다. 초대 코드가 유출되면 무제한으로 가입이 가능합니다.

**수정 방향:**

- Firestore rules에서 구성원 수 제한 (`resource.data.members.size() < 10`)
- 또는 `joinFamily` 로직에서 현재 구성원 수 확인 후 초과 시 에러 반환

---

## Low

### 8. console.error 프로덕션 노출

**파일:** `src/features/transactions/hooks/useTransactions.ts:34`

```ts
console.error('Transaction listener error:', error);
```

프로덕션 빌드에서 콘솔 로그가 제거되지 않으면 내부 에러 정보가 노출될 수 있습니다. Sentry 등 에러 추적 서비스로 교체하는 것이 좋습니다.

---

### 9. serviceAccountKey.json 관리

**파일:** `scripts/migrate-csv.ts:30`, `.gitignore:53`

`.gitignore`에 정상적으로 포함되어 있습니다. 실수로 커밋되지 않도록 주의하고, 정기적으로 git log와 `git secret scan`으로 확인하는 것을 권장합니다.

---

## 우선순위 요약

| 순위 | 항목 | 심각도 | 비고 |
|------|------|--------|------|
| 1 | Firestore Rules 읽기 권한 제한 | Critical | 배포만으로 즉시 적용 가능 |
| 2 | 초대 코드 CSPRNG 전환 + 만료 | Critical | 코드 변경 필요 |
| 3 | monthlySummary 서버측 집계 | High | Cloud Functions 도입 필요 |
| 4 | joinFamily 중복 참여 방지 | High | 검증 로직 추가 |
| 5 | 입력값 서버측 검증 | High | 서비스 레이어에 추가 |
| 6 | joinFamily race condition | Medium | 구조 변경 필요 |
| 7 | 가족 구성원 수 제한 | Medium | Rules 또는 로직 추가 |
