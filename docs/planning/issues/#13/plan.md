# #13 서버측 입력값 검증 없음 — amount 음수·임의 category 주입 가능

## 개요

거래 저장 시 클라이언트에서 `react-hook-form + zod`로 검증하지만,
Firestore Rules에 필드 검증이 없어 클라이언트를 우회하면 임의 값을 Firestore에 직접 쓸 수 있다.

**현재 문제:**
- `amount` 음수, 0, 소수점, 수십억 이상 값 저장 가능
- `category` — categories.ts에 없는 임의 문자열 저장 가능 → 통계 화면 깨짐
- `type` — `'expense' | 'income'` 외 값 저장 가능
- `name`, `memo` — 무제한 길이 문자열 가능

---

## 해결 설계

Firestore Rules에 필드 검증 함수를 추가한다.
클라이언트 zod 검증과 동일한 기준을 Rules에도 적용하여 이중 방어.

### 검증 규칙 (Rules 함수)

```
function isValidTransaction(data) {
  return
    // type
    data.type in ['expense', 'income'] &&
    // amount: 양의 정수, 최대 10억
    data.amount is int &&
    data.amount > 0 &&
    data.amount <= 1000000000 &&
    // category: 허용 목록
    data.category in [
      '식비', '카페', '쇼핑', '구독', '간식',
      '교통', '관리비', '기타', '건강', '통신비', '취미',
      '급여', '환급', '용돈', '청약', '기타수입'
    ] &&
    // name: 1~100자
    data.name is string &&
    data.name.size() >= 1 &&
    data.name.size() <= 100 &&
    // yearMonth: "YYYY-MM" 형식 (7자)
    data.yearMonth is string &&
    data.yearMonth.size() == 7 &&
    // memo: 0~200자
    data.memo is string &&
    data.memo.size() <= 200 &&
    // createdBy: 요청자 uid와 일치
    data.createdBy == request.auth.uid;
}
```

### 적용 위치

```
match /transactions/{txId} {
  allow create: if isFamilyMember(familyId) && isValidTransaction(request.resource.data);
  allow update: if isFamilyMember(familyId) && isValidTransaction(request.resource.data);
  allow read, delete: if isFamilyMember(familyId);
}
```

> `receiptUrl` 필드는 선택적이므로 검증 함수에 포함하지 않음 (있으면 string 이기만 하면 됨).

### 카테고리 리스트 유지 전략

Rules의 카테고리 목록과 `src/shared/constants/categories.ts`가 이중 관리된다.
카테고리 변경 시 **두 파일 모두 업데이트** 필요 — `features.md` 또는 CLAUDE.md에 주의사항으로 기록.

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
| `firestore.rules` | 수정 | `isValidTransaction()` 함수 추가, transactions create/update에 적용 |

---

## 화면 구성

변경 없음. Rules 레벨 변경만.

---

## 검증 항목

- [ ] `amount: -1000` → create 거부
- [ ] `amount: 0` → create 거부
- [ ] `amount: 1000000001` → create 거부
- [ ] `amount: 1000.5` (소수) → create 거부
- [ ] `category: '해킹'` (허용 목록 외) → create 거부
- [ ] `type: 'hack'` → create 거부
- [ ] `name: ''` (빈 문자열) → create 거부
- [ ] `name: 101자 문자열` → create 거부
- [ ] `createdBy: '타인uid'` → create 거부
- [ ] 정상 데이터 → create 허용
- [ ] update 시에도 동일 검증 적용 확인
- [ ] 카테고리 추가 시 Rules + categories.ts 동시 업데이트 체크
