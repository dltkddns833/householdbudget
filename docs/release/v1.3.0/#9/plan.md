# #9 초대 코드 — 암호학적으로 취약하고 영구 유효

## 개요

현재 초대 코드는 `Math.random().toString(36).substring(2, 8).toUpperCase()` 로 생성된다.
- `Math.random()` — 암호학적으로 안전하지 않음 (예측 가능)
- 6자리 알파뉴메릭 → 약 2.2억 경우의 수 → 브루트포스 가능
- 만료 없음 — 한 번 발급되면 영구 유효
- `families/{familyId}.inviteCode` 에 저장 → families 컬렉션을 인증된 모든 사용자에게 공개해야 해서 #8 해결의 걸림돌

이 이슈는 #8(Firestore Rules)과 **묶어서** 해결한다.
`inviteCodes` 별도 컬렉션 도입으로 두 문제를 동시에 해결.

---

## 해결 설계

### 핵심 전략: `inviteCodes/{code}` 별도 컬렉션 도입

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 저장 위치 | `families/{id}.inviteCode` | `inviteCodes/{code}` (최상위 컬렉션) |
| 코드 생성 | `Math.random()` 6자리 | `uuid()` 앞 8자리 대문자 |
| 만료 | 영구 | 생성 후 7일 (`expiresAt`) |
| 조회 방식 | families where inviteCode == code | `inviteCodes/{code}` 직접 get |
| 재생성 | 불가 | "코드 재생성" 버튼 → 기존 코드 삭제 + 새 코드 생성 |

### 코드 생성 방식

```ts
import { v4 as uuidv4 } from 'uuid';
// react-native-get-random-values 폴리필 필요
const code = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
// 예: "3F8A2C1B"
```

### 만료 처리

- 유효 기간: 7일
- `joinFamily` 시 `expiresAt > now` 체크
- 만료된 코드 → 에러 반환
- 만료된 코드는 별도 정리 없이 조회 시 거부 (Cloud Functions 배치 정리는 추후 고려)

---

## Firestore 데이터 모델

### 신규: `inviteCodes/{code}`

```
inviteCodes/{code}          // code 자체가 문서 ID
  ├─ familyId: string
  ├─ createdAt: Timestamp
  ├─ expiresAt: Timestamp   // createdAt + 7일
  └─ createdBy: string      // uid
```

### 변경: `families/{familyId}`

```
families/{familyId}
  ├─ members: string[]
  ├─ memberNames: Record<uid, string>
  └─ (inviteCode 필드 제거)  // 기존 문서는 필드가 남아있어도 무시
```

---

## 신규 타입

`src/shared/types/index.ts` 추가:

```ts
export interface InviteCode {
  code: string;      // 문서 ID와 동일
  familyId: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  expiresAt: FirebaseFirestoreTypes.Timestamp;
  createdBy: string;
}
```

`Family` 타입에서 `inviteCode` 필드 제거.

---

## 구현 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/features/auth/services/authService.ts` | 수정 | `createFamily` — inviteCode 필드 제거. `joinFamily` — inviteCodes 컬렉션 조회 + expiresAt 체크. `createInviteCode`, `getActiveInviteCode` 신규 함수 추가 |
| `src/features/more/screens/MoreMenuScreen.tsx` | 수정 | 초대 코드 UI — 코드 + 만료일 표시, "코드 재생성" 버튼 |
| `src/shared/types/index.ts` | 수정 | `InviteCode` 타입 추가, `Family.inviteCode` 제거 |
| `firestore.rules` | 수정 | `inviteCodes` 컬렉션 규칙 추가 (#8과 함께 작업) |
| `package.json` | 수정 | `uuid`, `react-native-get-random-values` 의존성 추가 |

---

## 화면 구성

### 더보기 > 초대 코드 섹션 (MoreMenuScreen)

**현재:**
- 코드 텍스트 + 복사 버튼

**변경 후:**
- 코드 텍스트 (예: `3F8A2C1B`) + 복사 버튼
- 만료일 표시 (예: "3월 15일까지 유효")
- "코드 재생성" 버튼 → 확인 다이얼로그 → 기존 코드 삭제 + 새 코드 생성
- 코드가 없으면 → "초대 코드 생성" 버튼

### FamilySetupScreen — 초대 코드 입력

- 만료된 코드 입력 시 에러: "초대 코드가 만료되었습니다. 새 코드를 발급받으세요."

---

## 검증 항목

- [ ] `uuid` + `react-native-get-random-values` 설치 및 폴리필 적용
- [ ] 코드 생성 시 8자리 대문자 알파뉴메릭 확인
- [ ] 유효한 코드로 joinFamily 성공
- [ ] 만료된 코드로 joinFamily → 에러 반환
- [ ] 존재하지 않는 코드 → 에러 반환
- [ ] "코드 재생성" → 기존 코드 삭제 후 신규 코드 생성
- [ ] 만료일 UI 정상 표시
- [ ] Firestore Rules — inviteCodes 읽기: 인증 사용자 전체 허용 / 쓰기: 해당 가족 멤버만
