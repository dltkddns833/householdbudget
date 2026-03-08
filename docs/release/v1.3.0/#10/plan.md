# #10 monthlySummary를 클라이언트가 직접 계산/쓰기 — 임의 데이터 삽입 가능

## 개요

현재 `transactionService.recalculateMonthlySummary()`:
1. 클라이언트가 해당 월 거래 전체를 읽어 합산
2. `monthlySummaries/{yearMonth}` 에 직접 `set()`

Firestore Rules가 `allow write: if isFamilyMember(familyId)` 이므로,
가족 멤버라면 누구든 monthlySummaries에 임의 값(`totalExpense: 0`, `remaining: 99999999`)을
직접 쓸 수 있다.

또한 클라이언트 계산 타이밍 문제(네트워크 지연, 앱 강제 종료 등)로
summary와 실제 트랜잭션이 불일치할 수 있다.

**해결책: Cloud Functions로 summary 계산을 서버로 이전**

---

## 해결 설계

### 아키텍처 변경

```
현재: Client → Firestore(transaction write) → Client(recalculate) → Firestore(summary write)

변경: Client → Firestore(transaction write)
                      ↓ trigger
             Cloud Function(onTransactionWrite) → Firestore(summary write)
```

### Cloud Function 설계

**트리거:** `families/{familyId}/transactions/{txId}` — onCreate, onUpdate, onDelete

**처리 로직:**
1. 변경된 트랜잭션의 `yearMonth` 파악 (update 시 이전/이후 yearMonth 모두 처리)
2. 해당 `familyId` + `yearMonth` 거래 전체 조회
3. totalExpense, totalIncome, remaining, categoryBreakdown, dailyTotals 계산
4. `monthlySummaries/{yearMonth}` set()

**함수명:** `onTransactionWrite`

```ts
// functions/src/index.ts
export const onTransactionWrite = functions
  .region('asia-northeast3')  // 서울 리전
  .firestore
  .document('families/{familyId}/transactions/{txId}')
  .onWrite(async (change, context) => { ... });
```

### Firestore Rules 변경

Cloud Functions 완료 후:
```
match /monthlySummaries/{yearMonth} {
  allow read: if isFamilyMember(familyId);
  allow write: if false;  // Cloud Functions Admin SDK만 쓰기 가능
}
```

### 클라이언트 변경

`transactionService.ts` 에서 `recalculateMonthlySummary()` 호출 제거:
- `addTransaction` — 마지막 `await this.recalculateMonthlySummary(...)` 삭제
- `updateTransaction` — 동일
- `deleteTransaction` — 동일
- `recalculateMonthlySummary` 메서드 자체 삭제

---

## Firestore 데이터 모델

`monthlySummaries/{yearMonth}` 구조 변경 없음. 쓰기 주체만 Cloud Functions으로 이전.

---

## 신규 타입

없음.

---

## 구현 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `functions/` | 신규 디렉토리 | Firebase Functions 프로젝트 루트 |
| `functions/package.json` | 신규 | `firebase-functions`, `firebase-admin` 의존성 |
| `functions/tsconfig.json` | 신규 | TypeScript 설정 |
| `functions/src/index.ts` | 신규 | `onTransactionWrite` Cloud Function |
| `functions/src/recalculateSummary.ts` | 신규 | 집계 계산 로직 (순수 함수) |
| `firebase.json` | 수정 | functions 배포 설정 추가 |
| `src/features/transactions/services/transactionService.ts` | 수정 | `recalculateMonthlySummary` 제거, addTransaction/updateTransaction/deleteTransaction 단순화 |
| `firestore.rules` | 수정 | `monthlySummaries` write `false` 처리 (Cloud Functions 배포 후 적용) |

---

## 화면 구성

변경 없음. 기능 동작은 동일하며 summary 계산이 서버로 이전될 뿐.

### UX 고려사항

- Cloud Function 실행에 약간의 지연(~1초) 발생 가능
- 클라이언트는 Firestore `onSnapshot`으로 monthlySummaries를 구독 중 → 함수 완료 시 자동 업데이트됨
- 별도 로딩 처리 불필요 (리얼타임 반영)

---

## 배포 절차

1. `firebase.json`에 functions 설정 추가
2. `functions/` 디렉토리 구성 및 코드 작성
3. `firebase deploy --only functions` 로 함수 배포
4. 클라이언트 코드에서 `recalculateMonthlySummary` 제거
5. 테스트 완료 후 Rules에서 `monthlySummaries write: false` 적용
6. `firebase deploy --only firestore:rules`

---

## 검증 항목

- [ ] Cloud Function 배포 성공 (`asia-northeast3` 리전)
- [ ] 거래 추가 → 약 1초 내 monthlySummary 업데이트 확인
- [ ] 거래 수정 (다른 월로 날짜 변경) → 이전 월 + 새 월 summary 모두 갱신
- [ ] 거래 삭제 → summary 정확히 차감
- [ ] 클라이언트에서 `recalculateMonthlySummary` 호출 코드 없음 확인
- [ ] Firestore Rules — `monthlySummaries` 직접 write 시도 → 거부 확인
- [ ] 홈 화면, 통계 화면 summary 데이터 정상 표시
- [ ] Cloud Functions 오류 시 Firestore summary 미변경 상태 유지 (원자성)
