# #11 거래 사진 첨부 (영수증) — 구현 계획

## Context

거래 추가/수정 폼에 영수증 사진 첨부 기능을 추가한다.
카메라 촬영 또는 갤러리 선택 → Firebase Storage 업로드 → Firestore `receiptUrl` 저장.
수정 화면에서 기존 영수증 확인 및 교체/삭제 가능. 탭 시 전체 화면 모달로 확대.

---

## 기획 문서 대비 실제 코드 구조 차이

| 기획 문서 | 실제 코드 | 조정 |
|-----------|-----------|------|
| `TransactionAddModal.tsx` | `TransactionAddScreen.tsx` | 동일 파일에서 처리 |
| `TransactionEditScreen.tsx` | 없음 (EditMode는 AddScreen의 isEdit 분기) | AddScreen에 통합 |
| `TransactionDetailScreen.tsx` | 없음 (목록 탭 → 수정 화면 이동) | AddScreen 수정 모드에 ReceiptViewer 포함 |

---

## 주의사항

- 기존 패턴 따르기: useState + Alert.alert
- `addTransaction`은 이미 `txId` 반환 → 2단계 업로드 흐름 그대로 사용 가능
- `deleteTransaction`의 Storage 삭제: 경로가 deterministic(`receipts/{familyId}/{txId}.jpg`)이므로 항상 시도 후 에러 무시
- 이미지 선택/촬영 옵션: `{ mediaType: 'photo', quality: 0.8, maxWidth: 1080, maxHeight: 1080 }`
- 업로드 중 저장 버튼 비활성화 (`isLoading || isUploading`)

---

## 구현 순서

### 0단계: 의존성 설치

```bash
pnpm add @react-native-firebase/storage react-native-image-picker
cd ios && pod install
```

iOS `Info.plist` 추가:
- `NSCameraUsageDescription` — 영수증 촬영을 위해 카메라에 접근합니다
- `NSPhotoLibraryUsageDescription` — 영수증 사진 선택을 위해 갤러리에 접근합니다

Android `AndroidManifest.xml` 추가:
- `<uses-permission android:name="android.permission.CAMERA" />`
- `<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />`

### 1단계: 타입 추가

**수정 파일:** `src/shared/types/index.ts`

```ts
export interface Transaction {
  // ... 기존 필드
  receiptUrl?: string;  // Firebase Storage URL, 없으면 미첨부
}
```

### 2단계: storageService 신규 생성

**신규 파일:** `src/features/transactions/services/storageService.ts`

```ts
uploadReceipt(familyId, txId, localUri): Promise<string>
  // storage().ref(`receipts/${familyId}/${txId}.jpg`).putFile(localUri)
  // 완료 후 getDownloadURL() 반환

deleteReceipt(familyId, txId): Promise<void>
  // storage().ref(`receipts/${familyId}/${txId}.jpg`).delete()
  // 파일 없을 경우 에러 무시
```

### 3단계: transactionService 수정

**수정 파일:** `src/features/transactions/services/transactionService.ts`

- `updateReceiptUrl(familyId, txId, url: string | null): Promise<void>` 추가
  - `url === null` → `FieldValue.delete()` 사용
- `deleteTransaction` 수정: Firestore 삭제 전 `storageService.deleteReceipt` 시도 (에러 무시)

### 4단계: ReceiptPicker 컴포넌트 신규 생성

**신규 파일:** `src/features/transactions/components/ReceiptPicker.tsx`

Props:
```ts
interface Props {
  uri?: string;              // 현재 선택된 로컬 URI (또는 기존 URL)
  onSelected: (uri: string) => void;
  onRemoved: () => void;
}
```

- 첨부 전: `[카메라 영수증 첨부]` 버튼 (icon: `camera-alt`)
- 첨부 후: 썸네일 이미지(80x80) + [X] 삭제 버튼
- 탭 시 Alert: "카메라로 촬영" / "갤러리에서 선택" / "취소"
- `launchCamera` / `launchImageLibrary` 호출

### 5단계: ReceiptViewer 컴포넌트 신규 생성

**신규 파일:** `src/features/transactions/components/ReceiptViewer.tsx`

Props: `receiptUrl?: string`
- `receiptUrl` 없으면 null 반환 (섹션 숨김)
- 썸네일 탭 시 전체 화면 Modal로 원본 이미지 표시
- Modal 내 반투명 배경 + [닫기 X] 버튼

### 6단계: TransactionAddScreen 수정

**수정 파일:** `src/features/transactions/screens/TransactionAddScreen.tsx`

상태 추가:
```ts
const [localReceiptUri, setLocalReceiptUri] = useState<string | null>(null);
const [receiptRemoved, setReceiptRemoved] = useState(false);
const [isUploading, setIsUploading] = useState(false);
```

초기값: 수정 모드(`isEdit`)이고 `editTx.receiptUrl` 있으면 → 기존 URL로 표시

**비고 섹션 아래에 삽입:**
- `<ReceiptPicker uri={...} onSelected={...} onRemoved={...} />`

**저장 흐름 (추가)**:
1. `addMutation.mutateAsync(input)` → `txId`
2. `localReceiptUri` 있으면:
   - `setIsUploading(true)`
   - `storageService.uploadReceipt(familyId, txId, localReceiptUri)` → `receiptUrl`
   - `transactionService.updateReceiptUrl(familyId, txId, receiptUrl)`
   - `setIsUploading(false)`

**저장 흐름 (수정)**:
- `localReceiptUri`가 새 이미지: `uploadReceipt` → `updateReceiptUrl(url)`
- `receiptRemoved`: `deleteReceipt` → `updateReceiptUrl(null)`
- 변경 없음: 그대로

버튼 비활성화: `isLoading || isUploading`

---

## 수정/신규 파일 목록

| 파일 | 작업 |
|------|------|
| `src/shared/types/index.ts` | `Transaction.receiptUrl?: string` 추가 |
| `src/features/transactions/services/storageService.ts` | **신규** |
| `src/features/transactions/services/transactionService.ts` | `updateReceiptUrl` 추가, `deleteTransaction` 수정 |
| `src/features/transactions/components/ReceiptPicker.tsx` | **신규** |
| `src/features/transactions/components/ReceiptViewer.tsx` | **신규** |
| `src/features/transactions/screens/TransactionAddScreen.tsx` | ReceiptPicker/Viewer 통합, 저장 흐름 수정 |
| `ios/Podfile` / `ios/Info.plist` | 의존성 및 권한 추가 |
| `android/app/src/main/AndroidManifest.xml` | 권한 추가 |

---

## 엣지 케이스 처리

| 케이스 | 처리 |
|--------|------|
| 이미지 선택 취소 | 기존 상태 유지 |
| 업로드 중 네트워크 오류 | Alert 표시, receiptUrl 저장 안 함 (거래는 이미 생성됨) |
| 거래 삭제 시 Storage 파일 없음 | 에러 무시, Firestore 삭제는 정상 진행 |
| 수정 시 이미지 교체 | 동일 경로로 덮어쓰기 (`putFile` 재업로드) |

---

## 검증 방법

1. 거래 추가 폼 → "영수증 첨부" 버튼 표시 확인
2. 카메라/갤러리 선택 → 썸네일 미리보기 확인
3. 저장 → Firebase Storage `receipts/{familyId}/{txId}.jpg` 업로드 확인
4. Firestore `receiptUrl` 저장 확인
5. 거래 수정 화면 → 기존 영수증 표시, 탭 시 전체 화면 모달
6. 수정 화면에서 영수증 삭제 → Storage 파일 삭제 + receiptUrl null 확인
7. 거래 삭제 → Storage 파일 함께 삭제 확인
8. 영수증 없는 거래 → 영수증 영역 숨김 확인
