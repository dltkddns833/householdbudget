# 우리집 가계부 디자인 시스템

> Storybook: `pnpm storybook` → `http://localhost:6006`

---

## 1. 색상 토큰

정의 파일: `src/shared/constants/colors.ts`

### 1.1 브랜드 컬러

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `primary` | `#0D9488` Teal-600 | `#2DD4BF` Teal-400 | 버튼, FAB, 탭 active, 강조 |
| `primaryLight` | `#2DD4BF` Teal-400 | `#5EEAD4` Teal-300 | 배지, 하이라이트 배경 |
| `primaryDark` | `#0F766E` Teal-700 | `#0F766E` Teal-700 | 눌린 상태, 테두리 |
| `secondary` | `#F59E0B` Amber-500 | `#FBBF24` Amber-400 | 보조 액션, 경고 배지 |
| `secondaryLight` | `#FCD34D` Amber-300 | `#FDE68A` Amber-200 | 보조 강조 배경 |

### 1.2 시맨틱 컬러

| 토큰 | 라이트 | 다크 | 용도 |
|------|--------|------|------|
| `expense` | `#3B82F6` Blue-500 | `#60A5FA` Blue-400 | 지출 금액 |
| `expenseLight` | `#DBEAFE` | `#1E3A5F` | 지출 배경 칩 |
| `income` | `#EF4444` Red-500 | `#F87171` Red-400 | 수입 금액 |
| `incomeLight` | `#FEE2E2` | `#5F1E1E` | 수입 배경 칩 |
| `danger` | `#EF4444` | `#F87171` | 삭제, 오류 |
| `warning` | `#F59E0B` | `#FBBF24` | 경고 |
| `success` | `#22C55E` | `#4ADE80` | 성공, 달성 |
| `info` | `#3B82F6` | `#60A5FA` | 정보 |

### 1.3 서피스 & 텍스트

| 토큰 | 라이트 | 다크 |
|------|--------|------|
| `background` | `#F8FAFC` | `#0F172A` |
| `surface` | `#FFFFFF` | `#1E293B` |
| `surfaceSecondary` | `#F1F5F9` | `#334155` |
| `text` | `#0F172A` | `#F1F5F9` |
| `textSecondary` | `#64748B` | `#94A3B8` |
| `textTertiary` | `#94A3B8` | `#64748B` |
| `border` | `#E2E8F0` | `#334155` |
| `borderLight` | `#F1F5F9` | `#1E293B` |

### 1.4 차트 색상 팔레트

```
#FF6B6B  #4ECDC4  #7C5CFC  #FFD93D  #6C9BCF
#C68B59  #95AABB  #FF8FAB  #45B7D1  #96CEB4  #A0A0A0
```

---

## 2. 타이포그래피 스케일

React Native `fontSize` + `fontWeight` 조합 기준.

| 역할 | fontSize | fontWeight | 색상 토큰 | 사용 예 |
|------|----------|------------|----------|---------|
| Display | 32 | `800` | `text` | 대시보드 총액 |
| Heading 1 | 24 | `700` | `text` | 화면 제목 |
| Heading 2 | 20 | `700` | `text` | 섹션 헤더 |
| Heading 3 | 18 | `700` | `text` | 카드 제목, MonthSelector |
| Body Large | 16 | `400` / `600` | `text` | 거래 항목 이름 |
| Body | 14 | `400` | `text` | 일반 본문 |
| Caption | 12 | `400` | `textSecondary` | 날짜, 보조 레이블 |
| Micro | 11 | `500` | `textTertiary` | 배지, 태그 |

---

## 3. 스페이싱 시스템

4px 그리드 기반.

| 토큰 | 값 | 주 용도 |
|------|-----|---------|
| `xs` | 4px | 아이콘-텍스트 간격 |
| `sm` | 8px | 버튼 내부 패딩, 작은 간격 |
| `md` | 12px | 리스트 아이템 패딩 |
| `base` | 16px | 카드 패딩, 화면 수평 여백 |
| `lg` | 20px | 섹션 간격 |
| `xl` | 24px | 큰 섹션 패딩 |
| `2xl` | 32px | 빈 상태 수평 패딩 |
| `3xl` | 48px | 화면 상단 여백 |
| `4xl` | 64px | 빈 상태 수직 패딩 |

---

## 4. Border Radius

| 단계 | 값 | 사용처 |
|------|-----|--------|
| `sm` | 4px | 배지, 태그 |
| `md` | 8px | 입력 필드, 작은 버튼 |
| `lg` | 12px | 드롭다운, 시트 상단 |
| `xl` | 16px | 카드 (`Card` 컴포넌트 기본값) |
| `2xl` | 24px | 모달, 바텀 시트 |
| `full` | 9999px | 둥근 버튼, FAB, 칩 |

---

## 5. 그림자 (Shadow)

| 단계 | shadowOpacity | shadowRadius | elevation | 사용처 |
|------|---------------|--------------|-----------|--------|
| `flat` | 0 | 0 | 0 | 배경에 붙는 요소 |
| `sm` | 0.05 | 4 | 2 | `Card` 기본값 |
| `md` | 0.10 | 8 | 4 | 떠 있는 카드 |
| `lg` | 0.15 | 12 | 8 | 모달, FAB |

모든 그림자의 `shadowColor`는 `#000000`, `shadowOffset`은 `{ width: 0, height: 1 }`.

---

## 6. 공통 컴포넌트 가이드

경로: `src/shared/components/`
Storybook: `http://localhost:6006` → Shared 카테고리

### Card

```tsx
import { Card } from '@/shared/components';

<Card>
  <Text>내용</Text>
</Card>

// 그림자 커스텀
<Card style={{ shadowOpacity: 0.15, elevation: 8 }}>...</Card>
```

### CurrencyText

```tsx
import { CurrencyText } from '@/shared/components';

// 수입 (빨간색 + 부호)
<CurrencyText amount={350000} colorize showSign />

// 지출 (파란색)
<CurrencyText amount={-125000} colorize />

// 축약 표시 (만/억)
<CurrencyText amount={12500000} short />
```

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `amount` | `number` | — | 금액 (원 단위 정수) |
| `short` | `boolean` | `false` | 만/억 단위 축약 |
| `showSign` | `boolean` | `false` | 양수 앞에 `+` 표시 |
| `colorize` | `boolean` | `false` | 수입/지출 색상 자동 적용 |
| `style` | `TextStyle` | — | 추가 스타일 |

### MonthSelector

```tsx
import { MonthSelector } from '@/shared/components';
import { useUIStore } from '@/store/uiStore';

const yearMonth = useUIStore((s) => s.selectedYearMonth);
const setYearMonth = useUIStore((s) => s.setSelectedYearMonth);

<MonthSelector yearMonth={yearMonth} onChangeMonth={setYearMonth} />
```

현재 달(today) 이후는 자동으로 비활성화됨.

### EmptyState

```tsx
import { EmptyState } from '@/shared/components';

<EmptyState
  icon="receipt-long"
  title="거래 내역이 없습니다"
  subtitle="+ 버튼을 눌러 추가하세요"
/>
```

### LoadingSpinner

```tsx
import { LoadingSpinner } from '@/shared/components';

if (isLoading) return <LoadingSpinner />;
```

전체 화면(`flex: 1`)을 차지하며 중앙에 `ActivityIndicator`를 표시.

---

## 7. 사용 컨벤션

- 색상은 항상 `useTheme().colors.*` 토큰을 사용. 하드코딩 금지.
- 스타일은 `useMemo(() => createStyles(colors), [colors])` 패턴으로 생성.
- 아이콘은 `react-native-vector-icons/MaterialIcons` 사용.
- 통화 포맷은 `src/shared/utils/currency.ts`의 `formatCurrency` / `formatCurrencyShort` 사용.
- 날짜는 `src/shared/utils/date.ts`의 dayjs 유틸 사용.
