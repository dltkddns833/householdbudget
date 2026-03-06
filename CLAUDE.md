# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"우리집 가계부" (Household Budget) — a React Native mobile app for family-based income/expense tracking and asset management. Korean-language UI. Uses Firebase (Auth + Firestore) as backend, Google Sign-In for authentication.

## Common Commands

```bash
pnpm install              # Install dependencies
pnpm start                # Start Metro bundler
pnpm run ios              # Run on iOS simulator
pnpm run android          # Run on Android emulator
pnpm test                 # Run Jest tests
pnpm run lint             # ESLint

# iOS pod install (required after adding native dependencies)
cd ios && pod install && cd ..
```

## Architecture

### Data Flow Pattern

Each feature follows: **Screen → Hook → Service → Firestore**

- **Services** (`features/*/services/`) — direct Firestore CRUD operations
- **Hooks** (`features/*/hooks/`) — React Query + Firestore real-time listeners, wrapping services
- **Screens** (`features/*/screens/`) — UI components consuming hooks

### State Management

- **Zustand** for client-side state:
  - `authStore` — user & family auth state (no persistence)
  - `uiStore` — selected month, add-modal visibility, theme preference (persisted via MMKV)
- **React Query** — server-state caching for Firestore data (5-min stale time)
- **Firestore onSnapshot** — real-time listeners for transactions (in `useTransactions`)

### Firestore Data Model

All data is scoped under `families/{familyId}/`:
- `families/{familyId}` root document: `members: string[]`, `memberNames: Record<uid, string>`, `inviteCode: string`
- `transactions` — individual income/expense records, partitioned by `yearMonth` field ("YYYY-MM")
- `monthlySummaries/{yearMonth}` — pre-aggregated monthly totals (`totalExpense`, `totalIncome`, `remaining`, `categoryBreakdown`, `dailyTotals`), recalculated on every transaction write
- `financialStatus/{yearMonth}` — monthly financial snapshots; has `accounts/{accountId}` subcollection for per-account asset data

### Navigation Structure

`RootNavigator` (conditional auth flow):
- Not logged in → `LoginScreen`
- No family → `FamilySetupScreen`
- Authenticated → `MainTabNavigator` with 5 tabs: Home, Transactions, Add (FAB modal), Stats, More

The "Add" tab intercepts press to show `TransactionAddModal` (global modal in App.tsx) via `uiStore`.

### Path Aliases

TypeScript path alias `@/*` maps to `src/*` (configured in `tsconfig.json`).

### Key Conventions

- Currency is in Korean Won (원), stored as integers
- Dates use `dayjs` utility functions in `shared/utils/date.ts`
- Icons use `react-native-vector-icons/MaterialIcons`
- Theme system supports light/dark/system via `ThemeProvider` + `useTheme()` hook
- Categories are defined in `shared/constants/categories.ts` (expense: 11 categories, income: 5)
- Forms use `react-hook-form` + `zod` for validation
- Charts use `react-native-chart-kit` + `react-native-svg`
- Date picker uses `react-native-date-picker`

### Planning Docs

Feature planning and design decisions are in `docs/planning/`:
- `docs/planning/README.md` — app overview, current features, Firestore model, UX principles
- `docs/planning/features.md` — upcoming features with priority and data model changes

### Scripts Directory

`scripts/` contains standalone Node.js/ts-node scripts for data migration and maintenance (CSV import, duplicate checking, cleanup). These use `firebase-admin` and have their own `tsconfig.json`.

## Android Build & Gradle Sync

### 환경
- Node v22 (nvm) — 프로젝트 전용. `.nvmrc` 참고. 다른 프로젝트는 v18.
- Gradle 9.0.0 + AGP 8.11.0 (pinned) + React Native 0.84

### Gradle 9 + nvm: `Cannot run program "node"` 해결

Gradle 9의 네이티브 프로세스 런처가 bare command(`node`, `npx`)의 PATH를 검색하지 않음. 해결을 위해 3개 파일에서 nvm node 풀패스를 사용:

1. **`android/settings.gradle`** — autolink 커맨드에 풀패스 node + CLI 스크립트 직접 호출
2. **`android/build.gradle`** — `REACT_NATIVE_NODE_MODULES_DIR`, `REACT_NATIVE_WORKLETS_NODE_MODULES_DIR` ext 프로퍼티로 gesture-handler/reanimated/screens의 node 호출 우회
3. **`android/app/build.gradle`** — `nodeExecutableAndArgs`에 풀패스 node 설정

### AGP 버전 호환성

RN Gradle Plugin이 AGP 8.12.0을 번들함. Android Studio 호환성을 위해 `build.gradle`에서 `resolutionStrategy.force`로 8.11.0 고정. Android Studio 업데이트 후 제거 가능.

### reanimated/worklets validation 태스크

`assertMinimalReactNativeVersionTask`, `assertWorkletsVersionTask`가 bare `node`를 호출하여 빌드 실패. `build.gradle`에서 `gradle.taskGraph.whenReady`로 비활성화. (`afterEvaluate`는 Gradle 9에서 동작하지 않음)

### 주의: 전역 node 심링크 사용 금지
과거에 `/usr/local/bin/node` 심링크를 만들어 다른 프로젝트의 node 버전(v18)을 덮어쓴 적이 있음. 이 프로젝트는 Gradle 설정에서 nvm 경로를 직접 참조하므로 전역 심링크가 불필요. 만약 존재한다면 `sudo rm /usr/local/bin/node`로 제거할 것.

### Node 버전 변경 시 수정 필요 파일
- `android/settings.gradle` (autolink 커맨드 내 node 경로)
- `android/app/build.gradle` (`nodeExecutableAndArgs` 내 node 경로)
- `android/gradlew` (`NVM_NODE_DIR` 경로)

### 빌드 명령어
```bash
cd android && ./gradlew assembleDebug     # Debug APK
cd android && ./gradlew assembleRelease   # Release APK
pnpm run distribute:android               # Firebase App Distribution 배포

# APK 위치
# Debug:   android/app/build/outputs/apk/debug/app-debug.apk
# Release: android/app/build/outputs/apk/release/app-release.apk
```
