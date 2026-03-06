# iOS 빌드 이슈 해결 과정 및 현재 상태

## 현재 상태: 컴파일 성공, 링커 에러 1개 남음

### 남은 에러
```
ld: framework 'FirebaseFirestoreInternal' not found
```
- `FirebaseFirestoreInternal`이 정적 라이브러리(`.a`)로 빌드되는데, 링커가 `-weak_framework`로 찾으려 함
- Pods-HouseholdBudget xcconfig 파일에서 `weak_framework "FirebaseFirestoreInternal"` 제거 필요

---

## 근본 원인
Firebase iOS SDK 11.x에서 `FIRAuth`, `FIRAuthErrorCode` 등이 Obj-C → Swift로 이전됨.
`use_modular_headers!` 환경에서 `FirebaseAuth-Swift.h` (Swift→ObjC 브릿징 헤더)가 빌드 시점에 생성되지만,
다른 Pod(RNFBApp, RNFBAuth)이 컴파일될 때 해당 헤더를 찾을 수 없는 문제.

## 해결한 이슈들

### 1. gRPC-Core modulemap 경로 불일치
- **에러**: `module map file 'Pods/Headers/Private/grpc/gRPC-Core.modulemap' not found`
- **해결**: 심볼릭 링크 생성 (Podfile post_install에 포함되어 있으나 동작 안 함, 수동 생성 필요)
```bash
mkdir -p Pods/Headers/Private/grpc
ln -sf "/absolute/path/to/ios/Pods/Target Support Files/gRPC-Core/gRPC-Core.modulemap" Pods/Headers/Private/grpc/gRPC-Core.modulemap
```

### 2. FirebaseAuth-Swift.h not found
- **에러**: `'FirebaseAuth/FirebaseAuth-Swift.h' file not found` (in target RNFBApp)
- **해결**: 2-pass 빌드
  1. 첫 번째 빌드: FirebaseAuth가 컴파일되면서 `-Swift.h`가 DerivedData에 생성됨 (RNFBAuth는 실패)
  2. 생성된 헤더를 `Pods/Headers/Private/FirebaseAuth/` 및 `Public/`에 복사
  3. 두 번째 빌드: RNFBApp, RNFBAuth 모두 컴파일 성공
- **생성 경로**: `DerivedData/HouseholdBudget-xxx/Build/Intermediates.noindex/Pods.build/Debug-iphoneos/FirebaseAuth.build/DerivedSources/FirebaseAuth-Swift.h`

### 3. Signing
- **에러**: `Signing for "HouseholdBudget" requires a development team`
- **해결**: pbxproj에 `DEVELOPMENT_TEAM = 4Z98X673NJ` 추가 (또는 빌드 시 `DEVELOPMENT_TEAM=4Z98X673NJ` 전달)
- **인증서**: "Apple Development: 상운 이 (6Q5FM276J3)", Team: 4Z98X673NJ

### 4. ANDROID_HOME 경로
- 올바른 경로: `/Users/isang-un/Library/Android/sdk`
- 환경변수가 `/Users/paroma/Library/Android/sdk`로 잘못 설정되어 있음

---

## 현재 Podfile 상태
- `use_modular_headers!` 사용 (Firebase Swift pod 필수)
- post_install에 다음 포함:
  - gRPC modulemap 심볼릭 링크 (동작 안 함, 수동 필요)
  - `weak_framework FirebaseFirestoreInternal` 제거 시도 (미완성)
  - `FirebaseAuth-Swift.h` 호환 헤더 생성 (stub, 실제로는 2-pass 빌드의 실제 헤더가 필요)

## 다른 컴퓨터에서 이어서 할 작업

### 빌드 방법 (2-pass)
```bash
cd ios

# 1. Pod 설치
pod install

# 2. gRPC symlink 생성
mkdir -p Pods/Headers/Private/grpc
ln -sf "$(pwd)/Pods/Target Support Files/gRPC-Core/gRPC-Core.modulemap" Pods/Headers/Private/grpc/gRPC-Core.modulemap

# 3. 첫 번째 빌드 (RNFBAuth 실패 예상, FirebaseAuth-Swift.h 생성 목적)
xcodebuild -workspace HouseholdBudget.xcworkspace -configuration Debug -scheme HouseholdBudget -destination 'generic/platform=iOS' -allowProvisioningUpdates DEVELOPMENT_TEAM=YOUR_TEAM_ID build || true

# 4. 생성된 Swift 헤더 복사
SWIFT_H=$(find ~/Library/Developer/Xcode/DerivedData -name "FirebaseAuth-Swift.h" -path "*/DerivedSources/*" | head -1)
cp "$SWIFT_H" Pods/Headers/Private/FirebaseAuth/FirebaseAuth-Swift.h
cp "$SWIFT_H" Pods/Headers/Public/FirebaseAuth/FirebaseAuth-Swift.h

# 5. FirebaseFirestoreInternal weak_framework 제거
# Pods/Target Support Files/Pods-HouseholdBudget/*.xcconfig 에서
# "-weak_framework "FirebaseFirestoreInternal"" 문자열 제거

# 6. 두 번째 빌드
xcodebuild -workspace HouseholdBudget.xcworkspace -configuration Debug -scheme HouseholdBudget -destination 'id=DEVICE_ID' -allowProvisioningUpdates DEVELOPMENT_TEAM=YOUR_TEAM_ID build
```

### 근본적 해결 방안 (추천)
- Firebase를 Supabase로 마이그레이션하면 이 모든 CocoaPods 호환성 문제가 해결됨
- Supabase는 REST 기반 가벼운 SDK, gRPC/BoringSSL/abseil 의존성 없음
- 빌드 시간 대폭 단축

---

## Android 빌드
- **성공**: `ANDROID_HOME=/Users/isang-un/Library/Android/sdk npx react-native run-android`
- 기기: SM-S931N (R3CXC0GV04Z)
- 스플래시, 아이콘, 앱 이름 모두 정상 동작 확인
