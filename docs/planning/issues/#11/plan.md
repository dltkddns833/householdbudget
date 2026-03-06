# #11 거래 사진 첨부 (영수증)

> GitHub Issue: https://github.com/dltkddns833/householdbudget/issues/11

## 개요

거래에 영수증 사진을 첨부하여 지출 근거를 남긴다.
카메라 촬영 또는 갤러리 선택 후 Firebase Storage에 저장하고, 거래 상세 화면에서 확인할 수 있다.

---

## Firestore 데이터 모델 변경

```
families/{familyId}/transactions/{id}
  - receiptUrl?: string  // Firebase Storage 이미지 URL (추가)
```

### Firebase Storage 경로

```
receipts/{familyId}/{transactionId}.jpg
```

---

## 신규 타입 (`src/shared/types/index.ts`)

```typescript
// Transaction 인터페이스에 필드 추가
export interface Transaction {
  // ... 기존 필드
  receiptUrl?: string;
}
```

---

## 구현 파일 목록

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/features/transactions/services/storageService.ts` | Firebase Storage 업로드/삭제 |
| `src/features/transactions/components/ReceiptPicker.tsx` | 사진 선택 UI 컴포넌트 |
| `src/features/transactions/components/ReceiptViewer.tsx` | 첨부 사진 확인 컴포넌트 |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/shared/types/index.ts` | Transaction에 receiptUrl 필드 추가 |
| `src/features/transactions/screens/TransactionAddModal.tsx` | ReceiptPicker 추가 |
| `src/features/transactions/screens/TransactionEditScreen.tsx` | ReceiptPicker 추가 |
| `src/features/transactions/screens/TransactionDetailScreen.tsx` | ReceiptViewer 추가 |
| `src/features/transactions/services/transactionService.ts` | receiptUrl 저장, 거래 삭제 시 Storage 이미지 삭제 연동 |

---

## 의존성 추가

```bash
# 이미지 선택 라이브러리 (React Native Image Picker)
pnpm add react-native-image-picker
cd ios && pod install

# Firebase Storage
pnpm add @react-native-firebase/storage
```

---

## 서비스 (`storageService.ts`)

```typescript
uploadReceipt(familyId: string, transactionId: string, localUri: string): Promise<string>
  // 1. localUri → Firebase Storage 업로드
  // 2. 다운로드 URL 반환

deleteReceipt(familyId: string, transactionId: string): Promise<void>
  // Storage에서 파일 삭제
```

---

## 화면 구성 / UX

### ReceiptPicker (TransactionAddModal / TransactionEditScreen)

거래 폼 하단 사진 첨부 영역:

```
[📷 영수증 첨부]

  ┌─────────┐
  │  사진   │  [삭제 ✕]   ← 첨부 후
  └─────────┘
```

- 탭 시 "카메라로 촬영" / "갤러리에서 선택" 액션 시트
- 이미지 압축: 최대 1MB, 1080px 이내로 리사이즈
- 업로드 중 스피너 표시

### ReceiptViewer (TransactionDetailScreen)

거래 상세 화면 하단:

```
[영수증]
┌─────────────────┐
│      사진       │  (탭하면 전체 화면 모달)
└─────────────────┘
```

- 사진 없으면 섹션 숨김

### 업로드 흐름

1. 사진 선택 → 로컬 URI 확보
2. 거래 저장 시 동시에 Storage 업로드
3. 업로드 완료 후 `receiptUrl` Firestore에 저장
4. 거래 삭제 시 Storage 이미지도 함께 삭제

---

## 검증 항목

- [ ] 카메라 촬영으로 사진 첨부 동작 (iOS/Android 권한 확인 포함)
- [ ] 갤러리 선택으로 사진 첨부 동작
- [ ] Firebase Storage 업로드 확인
- [ ] Firestore `receiptUrl` 저장 확인
- [ ] TransactionDetailScreen에서 첨부 사진 표시
- [ ] 사진 탭 시 전체 화면 모달 표시
- [ ] 거래 삭제 시 Storage 이미지 함께 삭제 확인
- [ ] 사진 없는 거래는 영수증 섹션 숨김
- [ ] 업로드 중 로딩 상태 표시
