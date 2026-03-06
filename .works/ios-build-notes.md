# iOS 빌드 이슈 해결 과정 및 현재 상태

## 현재 상태: 빌드 성공 (2026-03-06 새 컴퓨터 셋업 완료)

---

## 새 컴퓨터 셋업 절차 (완료)

### 1. Node v22 설치
```bash
source ~/.nvm/nvm.sh && nvm install 22 && nvm alias default 22
```

### 2. pnpm 설치 + 의존성 설치
```bash
npm install -g pnpm
cd householdbudget && pnpm install
```

### 3. Ruby 3.3.7 설치 (CocoaPods용)
시스템 Ruby 2.6은 너무 오래됨. rbenv + libyaml 수동 빌드 필요.

```bash
# rbenv 설치
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash

# libyaml 소스 빌드 (절대경로 중요 - $HOME이 빈값일 수 있음)
cd /tmp && curl -fsSL https://pyyaml.org/download/libyaml/yaml-0.2.5.tar.gz | tar xz
cd yaml-0.2.5 && ./configure --prefix=/Users/isang-un/.libyaml && make -j8 && make install

# Ruby 3.3.7 설치 (libyaml 경로 + rdoc 제외)
export PATH="/Users/isang-un/.rbenv/bin:$PATH" && eval "$(rbenv init - zsh)"
HOME=/Users/isang-un RUBY_CONFIGURE_OPTS="--with-libyaml-dir=/Users/isang-un/.libyaml --disable-install-rdoc" rbenv install 3.3.7
rbenv global 3.3.7
```

> 주의: rbenv install 중 $HOME이 빈값이 됨. RUBY_CONFIGURE_OPTS의 경로를 절대경로로 지정해야 함.
> psych.bundle이 `/.libyaml/...`로 링크되면 안 됨 → `otool -L psych.bundle | grep yaml`로 확인

### 4. CocoaPods 설치
```bash
export PATH="/Users/isang-un/.rbenv/versions/3.3.7/bin:$PATH"
HOME=/Users/isang-un gem install cocoapods --no-document
```

### 5. iOS 플랫폼 컴포넌트 다운로드
Xcode에 iOS SDK는 있지만 플랫폼 컴포넌트가 없으면 빌드 불가.
```bash
xcodebuild -downloadPlatform iOS   # ~8.4 GB
```

### 6. pod install
```bash
export PATH="/Users/isang-un/.rbenv/versions/3.3.7/bin:/Users/isang-un/.nvm/versions/node/v22.22.1/bin:$PATH"
HOME=/Users/isang-un
cd ios && pod install
```

### 7. gRPC symlink 수동 생성 (pod install 후 매번 필요)
```bash
cd ios
mkdir -p Pods/Headers/Private/grpc
ln -sf "$(pwd)/Pods/Target Support Files/gRPC-Core/gRPC-Core.modulemap" Pods/Headers/Private/grpc/gRPC-Core.modulemap
```

### 8. 2-pass 빌드

**1차 빌드** (FirebaseAuth-Swift.h 생성 목적, 실패해도 됨):
```bash
xcodebuild -workspace HouseholdBudget.xcworkspace -configuration Debug \
  -scheme HouseholdBudget -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates build || true
```

**생성된 헤더 복사**:
```bash
SWIFT_H=$(find ~/Library/Developer/Xcode/DerivedData -name "FirebaseAuth-Swift.h" -path "*/DerivedSources/*" | head -1)
cp "$SWIFT_H" ios/Pods/Headers/Private/FirebaseAuth/FirebaseAuth-Swift.h
cp "$SWIFT_H" ios/Pods/Headers/Public/FirebaseAuth/FirebaseAuth-Swift.h
```

**FirebaseFirestoreInternal weak_framework 제거**:
```bash
for f in "ios/Pods/Target Support Files/Pods-HouseholdBudget/Pods-HouseholdBudget.debug.xcconfig" \
         "ios/Pods/Target Support Files/Pods-HouseholdBudget/Pods-HouseholdBudget.release.xcconfig"; do
  sed -i '' 's/ -weak_framework "FirebaseFirestoreInternal"//g' "$f"
  sed -i '' 's/ -weak_framework FirebaseFirestoreInternal//g' "$f"
done
```

**2차 빌드** (실제 빌드):
```bash
xcodebuild -workspace HouseholdBudget.xcworkspace -configuration Debug \
  -scheme HouseholdBudget -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates build
```

---

## 프로젝트 설정 변경 사항

### Bundle Identifier 변경
- 기존: `org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)` (충돌)
- 변경: `com.isangun.householdbudget`
- 파일: `ios/HouseholdBudget.xcodeproj/project.pbxproj`

### Signing
- 프로젝트 파일의 DEVELOPMENT_TEAM: `7NQUS55473`
- Xcode > Settings > Accounts에 Apple ID 등록 필요
- `-allowProvisioningUpdates` 플래그로 자동 프로비저닝

---

## 근본 원인 (변경 없음)

Firebase iOS SDK 11.x+에서 `FIRAuth`, `FIRAuthErrorCode` 등이 Obj-C → Swift로 이전됨.
`use_modular_headers!` 환경에서 `FirebaseAuth-Swift.h` 가 빌드 시점에 생성되지만,
다른 Pod(RNFBApp, RNFBAuth)이 컴파일될 때 해당 헤더를 찾을 수 없는 문제.

## 근본적 해결 방안 (추천)
- Firebase를 Supabase로 마이그레이션하면 이 모든 CocoaPods 호환성 문제가 해결됨
- Supabase는 REST 기반 가벼운 SDK, gRPC/BoringSSL/abseil 의존성 없음

---

## Android 빌드
- **성공**: `ANDROID_HOME=/Users/isang-un/Library/Android/sdk npx react-native run-android`
- 기기: SM-S931N (R3CXC0GV04Z)
- CLAUDE.md 참고: Gradle 9 + nvm node 풀패스 설정 필요
