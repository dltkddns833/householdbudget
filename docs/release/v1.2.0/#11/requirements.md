# #11 거래 사진 첨부 (영수증) — 상세 요구사항 & TODO

> 이 문서는 고수준 설계를 담은 `plan.md`를 보완하는 구현 참고 문서다.
> 소스코드(TransactionAddModal, TransactionEditScreen, TransactionDetailScreen, transactionService) 분석 결과를 반영한다.

---

## 1. 사용자 스토리

- 영수증 사진을 거래에 첨부하여 나중에 어떤 지출이었는지 확인한다
- 카메라로 즉시 촬영하거나 갤러리에서 기존 사진을 선택할 수 있다
- 거래 상세 화면에서 첨부된 영수증을 탭하면 전체 화면으로 확인한다

---

## 2. 기능 요구사항

### 사진 첨부

- 거래 추가/수정 폼에 "영수증 첨부" 버튼 추가
- 탭 시 액션 시트: "카메라로 촬영" / "갤러리에서 선택"
- 이미지 압축: 최대 1MB, 최대 1080px로 리사이즈

### 업로드 흐름

1. 사진 선택 → 로컬 URI 확보
2. 거래 저장 시 Firebase Storage 업로드 실행
3. 업로드 완료 후 `receiptUrl` Firestore에 저장
4. 거래 삭제 시 Storage 이미지도 함께 삭제

### 사진 확인

- TransactionDetailScreen 하단에 영수증 섹션 추가
- 사진 없으면 섹션 숨김
- 사진 탭 시 전체 화면 모달로 확대

---

## 3. Firestore 데이터 모델 변경

```
families/{familyId}/transactions/{id}
  + receiptUrl?: string   // Firebase Storage 다운로드 URL
```

### Firebase Storage 경로

```
receipts/{familyId}/{transactionId}.jpg
```

- 거래 ID를 파일명으로 사용하여 중복 방지
- 수정 시 기존 파일 덮어쓰기

---

## 4. 신규 타입 (src/shared/types/index.ts)

```ts
// 기존 Transaction 인터페이스 확장
export interface Transaction {
  // ... 기존 필드
  receiptUrl?: string;   // Firebase Storage URL, 없으면 미첨부
}
```

---

## 5. 파일별 TODO

### [신규] src/features/transactions/services/storageService.ts

- [ ] `uploadReceipt(familyId: string, transactionId: string, localUri: string): Promise<string>`
  - react-native-image-picker로 가져온 localUri를 Storage에 업로드
  - 경로: `receipts/{familyId}/{transactionId}.jpg`
  - 업로드 완료 후 다운로드 URL 반환
- [ ] `deleteReceipt(familyId: string, transactionId: string): Promise<void>`
  - Storage에서 파일 삭제 (파일 없을 경우 에러 무시)

### [신규] src/features/transactions/components/ReceiptPicker.tsx

- [ ] "영수증 첨부" 버튼 렌더링 (첨부 전)
- [ ] 첨부 후: 썸네일 이미지 + [삭제 X] 버튼
- [ ] 버튼 탭 시 ActionSheet 표시: "카메라로 촬영" / "갤러리에서 선택" / "취소"
- [ ] react-native-image-picker `launchCamera` / `launchImageLibrary` 호출
  - options: `{ mediaType: 'photo', quality: 0.8, maxWidth: 1080, maxHeight: 1080 }`
- [ ] `onImageSelected(localUri: string): void` 콜백 props
- [ ] `onImageRemoved(): void` 콜백 props
- [ ] 업로드 중 스피너 표시 (외부에서 `isUploading` props 주입)

### [신규] src/features/transactions/components/ReceiptViewer.tsx

- [ ] `receiptUrl?: string` props 수신
- [ ] receiptUrl 없으면 null 반환 (섹션 숨김)
- [ ] 썸네일 이미지 렌더링 (탭 가능)
- [ ] 탭 시 전체 화면 Modal로 원본 이미지 표시
  - Modal 내부: 핀치 줌 (react-native-gesture-handler ScrollView) 또는 단순 전체화면 표시
  - [닫기 X] 버튼

### [수정] src/features/transactions/screens/TransactionAddModal.tsx

- [ ] `<ReceiptPicker>` 컴포넌트 추가 (폼 하단)
- [ ] `localReceiptUri` 로컬 상태 관리
- [ ] 저장 시 흐름:
  1. `createTransaction` 호출 → transactionId 획득
  2. `localReceiptUri` 있으면 `uploadReceipt(familyId, transactionId, localUri)` 호출
  3. 업로드 완료 후 `updateTransaction(transactionId, { receiptUrl })` 호출
- [ ] 업로드 중 저장 버튼 비활성화 + 로딩 표시

### [수정] src/features/transactions/screens/TransactionEditScreen.tsx

- [ ] `<ReceiptPicker>` 컴포넌트 추가
- [ ] 기존 `receiptUrl` 있으면 ReceiptPicker에 초기 이미지로 표시
- [ ] 저장 시 흐름:
  - 새 사진 선택됨: `uploadReceipt` → `updateTransaction({ receiptUrl })`
  - 사진 삭제됨: `deleteReceipt` → `updateTransaction({ receiptUrl: null })`
  - 변경 없음: 그대로 `updateTransaction`

### [수정] src/features/transactions/screens/TransactionDetailScreen.tsx

- [ ] 하단에 `<ReceiptViewer receiptUrl={transaction.receiptUrl} />` 추가

### [수정] src/features/transactions/services/transactionService.ts

- [ ] `createTransaction` 반환값에 생성된 transactionId 포함 (이미 있으면 유지)
- [ ] `deleteTransaction` 시 `deleteReceipt` 호출 추가 (receiptUrl 있는 경우)

---

## 6. 의존성 추가

```bash
# 이미지 선택
pnpm add react-native-image-picker
cd ios && pod install

# Firebase Storage (미설치 시)
pnpm add @react-native-firebase/storage
cd ios && pod install
```

iOS `Info.plist` 권한 추가:
- `NSCameraUsageDescription` — 영수증 촬영을 위해 카메라에 접근합니다
- `NSPhotoLibraryUsageDescription` — 영수증 사진 선택을 위해 갤러리에 접근합니다

Android `AndroidManifest.xml`:
- `CAMERA` 권한
- `READ_EXTERNAL_STORAGE` 권한 (API 32 이하)

---

## 7. 엣지 케이스

| 케이스 | 처리 방법 |
|--------|-----------|
| 카메라/갤러리 권한 거부 | 에러 토스트 + 설정 이동 안내 |
| 업로드 중 네트워크 오류 | 에러 토스트, receiptUrl 저장 안 함 (거래는 이미 생성된 상태) |
| 이미지 선택 취소 | 기존 상태 유지 |
| Storage 삭제 실패 (거래 삭제 시) | 에러 무시, Firestore 거래는 정상 삭제 |
| 기존 거래 수정 시 사진 교체 | 기존 Storage 파일 덮어쓰기 (동일 경로 사용) |

---

## 8. 검증 항목

- [ ] 카메라 촬영으로 사진 첨부 동작 (iOS/Android 권한 팝업 포함)
- [ ] 갤러리 선택으로 사진 첨부 동작
- [ ] Firebase Storage 업로드 확인 (`receipts/{familyId}/{transactionId}.jpg`)
- [ ] Firestore `receiptUrl` 저장 확인
- [ ] TransactionDetailScreen 영수증 섹션 표시
- [ ] 사진 탭 시 전체 화면 모달 표시
- [ ] 거래 삭제 시 Storage 이미지 함께 삭제 확인
- [ ] 사진 없는 거래 → 영수증 섹션 숨김 확인
- [ ] 업로드 중 로딩 상태 및 저장 버튼 비활성화 확인
- [ ] 이미지 압축 적용 확인 (1080px, 0.8 quality)
