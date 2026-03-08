# #30 회원 탈퇴 기능

## 개요

앱 내 계정 삭제 기능이 없다.

**Apple App Store 정책 (2022년 6월~):** 계정 생성 기능이 있는 앱은 반드시 앱 내에서 계정 삭제 기능을 제공해야 함.
Google Play도 동일 정책 적용. 위반 시 스토어 심사 거절 사유가 됨.

---

## 처리 로직

Firebase Auth의 `user.delete()`는 **최근 로그인한 사용자만** 호출 가능하다.
시간이 지난 세션에서 호출하면 `auth/requires-recent-login` 에러가 발생하므로,
탈퇴 전 Google 재인증(reauthenticate)이 필요하다.

```
1. 확인 다이얼로그 (1차)
2. 재확인 다이얼로그 (2차, "이 작업은 되돌릴 수 없습니다")
3. Google 재인증 (GoogleSignin.signIn() → credential → reauthenticateWithCredential)
4. Firestore 처리:
   a. 가족 탈퇴 (#29 leaveFamily 로직 동일)
   b. users/{uid} 문서 삭제
5. Firebase Auth 계정 삭제 (user.delete())
6. authStore.reset()
7. LoginScreen으로 이동
```

### 데이터 보존 정책

| 데이터 | 처리 |
|--------|------|
| `users/{uid}` | 삭제 |
| Firebase Auth 계정 | 삭제 |
| `families/{id}.members` 내 uid | 제거 (leaveFamily) |
| `families/{id}.memberNames.{uid}` | 제거 |
| `families/.../transactions` (내가 입력한 것) | **유지** — 가족 공유 데이터이므로 보존 |
| `families/.../financialStatus` | **유지** |
| FCM 토큰, 알림 설정 | `users/{uid}` 삭제로 함께 제거 |

거래 데이터는 `createdBy` 필드로 작성자가 기록되지만, 탈퇴 후에는 uid만 남음.
UI에서 탈퇴한 멤버의 이름을 표시할 때 fallback 처리 필요 (ex. "알 수 없음").

---

## Firestore 데이터 모델

변경 없음.

### Firestore Rules 추가

```
match /users/{userId} {
  allow delete: if isAuth() && request.auth.uid == userId;
}
```

---

## 신규 타입

없음.

---

## 구현 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/features/auth/services/authService.ts` | 수정 | `deleteAccount(uid, familyId)` 함수 추가 — 재인증, leaveFamily, users 삭제, Auth 삭제 순서 |
| `src/features/settings/screens/MoreMenuScreen.tsx` | 수정 | 회원 탈퇴 메뉴 항목 추가 (가족 탈퇴 아래, 로그아웃 아래) |
| `firestore.rules` | 수정 | `users/{userId}` delete 허용 추가 |

---

## 화면 구성

### 더보기 > 회원 탈퇴 메뉴

- 위치: 로그아웃 아래 (맨 하단)
- 아이콘: `person-remove`
- 색상: `colors.textTertiary` (로그아웃보다 덜 강조)

### 탈퇴 플로우

**1차 확인 다이얼로그**
```
제목: 회원 탈퇴
내용: 탈퇴하면 계정 정보가 삭제됩니다.
      입력한 거래 내역은 가족 데이터로 유지됩니다.
버튼: [취소] [계속]
```

**2차 확인 다이얼로그 (재확인)**
```
제목: 정말 탈퇴하시겠습니까?
내용: 이 작업은 되돌릴 수 없습니다.
      Google 계정 인증 후 탈퇴가 진행됩니다.
버튼: [취소] [탈퇴하기]
```

**재인증 → Google 로그인 UI 표시 → 성공 시 탈퇴 처리 진행**

**탈퇴 완료 → LoginScreen**

### 에러 처리

| 에러 | 처리 |
|------|------|
| Google 재인증 취소 | 탈퇴 중단, 기존 화면 유지 |
| `auth/requires-recent-login` | 재인증 안내 후 재시도 |
| 네트워크 오류 | Alert "잠시 후 다시 시도해주세요" |

---

## 검증 항목

- [ ] 탈퇴 후 Firebase Auth 콘솔에서 계정 삭제 확인
- [ ] 탈퇴 후 `users/{uid}` 문서 삭제 확인
- [ ] 탈퇴 후 `families/{id}.members`에서 uid 제거 확인
- [ ] 탈퇴 후 기존 거래 데이터(`createdBy: uid`) 는 가족 문서에 유지 확인
- [ ] 재인증 취소 시 탈퇴 중단 확인
- [ ] 세션이 오래된 경우 재인증 UI 정상 표시
- [ ] 탈퇴 완료 후 LoginScreen 이동
- [ ] 탈퇴한 계정으로 재로그인 시도 → 새 계정으로 가입 처리됨 확인
- [ ] Apple App Store 심사 기준 — 앱 내에서 계정 삭제 접근 가능 여부 확인
