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

### 1.5 InsightCard 타입별 색상

| type | 배경 (라이트) | 테두리 | 텍스트 | 용도 |
|------|--------------|--------|--------|------|
| `warning` | `#FEF3C7` | `#FDE68A` | `#92400E` | 지출 증가, 카테고리 급증, 지출>수입 |
| `saving` | `#D1FAE5` | `#A7F3D0` | `#065F46` | 지출 감소, 절약 달성 |
| `achievement` | `#DBEAFE` | `#BFDBFE` | `#1E40AF` | 저축률 목표 달성, 카테고리 0원 |
| `info` | `surfaceSecondary` | `border` | `textSecondary` | 단순 사실, 전월 데이터 없을 때 |

### 1.6 멤버 아바타 컬러 팔레트

가족 멤버별 고정 색상 (uid 순서 기준 할당).

```
#0D9488  #8B5CF6  #F59E0B  #EF4444  #3B82F6  #22C55E
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

### SegmentControl

수입/지출 유형 전환 등 2-option 선택에 사용하는 세그먼트 토글.

| 속성 | 값 |
|------|-----|
| 컨테이너 배경 | `surfaceSecondary`, radius `md` (8px), padding 3px |
| 선택 항목 | `surface`, shadow `sm`, radius 6px |
| 선택 텍스트 | Body (14/700), 지출=`expense` / 수입=`income` |
| 미선택 텍스트 | Body (14/400) `textSecondary` |
| 높이 | 44px |

```tsx
// 사용 패턴 (react-hook-form 연동)
const [type, setType] = useState<'expense' | 'income'>('expense');

<View style={styles.segment}>
  <Pressable style={[styles.segBtn, type === 'expense' && styles.segActive]}
    onPress={() => setType('expense')}>
    <Text style={type === 'expense' ? styles.segTextExpense : styles.segTextInactive}>지출</Text>
  </Pressable>
  <Pressable style={[styles.segBtn, type === 'income' && styles.segActive]}
    onPress={() => setType('income')}>
    <Text style={type === 'income' ? styles.segTextIncome : styles.segTextInactive}>수입</Text>
  </Pressable>
</View>
```

### GaugeBar

예산 달성률, 저축률, 자산 목표 진행률에 공통 사용하는 진행 바.

| 속성 | 값 |
|------|-----|
| 높이 | 8px (기본) / 10px (강조) |
| 배경 | `surfaceSecondary` |
| 진행색 | 기본: `primary` / 달성: `success` / 초과/음수: `danger` |
| border radius | 4px (기본) / 5px (강조) |
| 최대 너비 | 100% 클램프 (초과 달성 시 시각적으로 꽉 참) |

```tsx
// 사용 패턴
<View style={styles.gaugeBg}>
  <View style={[styles.gaugeFill, {
    width: `${Math.min(percentage, 100)}%`,
    backgroundColor: isAchieved ? colors.success : colors.primary,
  }]} />
</View>
```

### WarningBanner

미반영 고정비, 알림 권한 해제 등 주의 사항을 화면 내 인라인으로 표시.

| 속성 | 값 |
|------|-----|
| 배경 (라이트) | `#FFFBEB` (Amber-50) |
| 배경 (다크) | `#451A03` |
| 테두리 | 1px `#FDE68A` |
| 좌측 아이콘 | MaterialIcons `error-outline` 또는 `notifications-active` 18px `warning` |
| 본문 텍스트 | Body (14/400) `#92400E` / 다크 `#FDE68A` |
| border radius | 12px |
| 외부 margin | 수평 16px |

```tsx
// 홈 화면 고정비 배너 예시
{pendingCount > 0 && (
  <Pressable style={styles.warningBanner} onPress={() => navigate('RecurringList')}>
    <MaterialIcons name="notifications-active" size={18} color={colors.warning} />
    <Text style={styles.bannerText}>
      {`${firstTitle} 등 ${pendingCount}건의 고정비가 반영 안 됐어요`}
    </Text>
    <Text style={styles.bannerCta}>확인하기</Text>
  </Pressable>
)}
```

### MemberChip

거래 추가 시 지출 멤버를 선택하는 수평 스크롤 칩 목록 (가족 2인 이상에서만 노출).

| 속성 | 값 |
|------|-----|
| 칩 높이 | 34px, radius `full` |
| 선택 상태 | 배경 `primaryLight` opacity 0.1, 테두리 `primary`, 텍스트 `primary` |
| 미선택 상태 | 배경 `surfaceSecondary`, 텍스트 `textSecondary` |
| 아바타 | 22×22 원형, 섹션 1.6의 멤버 색상 |
| "공동" 칩 | 아바타 배경 `textTertiary` |
| 가족 1인 시 | 숨김 (`family.members.length < 2`) |

### SearchBar

거래 목록 상단 검색 + 필터 진입점.

| 속성 | 값 |
|------|-----|
| 입력 필드 | 높이 40px, radius `full`, 배경 `surfaceSecondary` |
| 좌측 아이콘 | `search` 16px `textTertiary` |
| 우측 클리어 | 검색어 있을 때만 노출, `close` 아이콘 |
| 필터 버튼 | 높이 40px, radius `full`, 활성: 배경 `primaryLight`+테두리 `primary` |
| 필터 배지 | 활성 필터 수, `primary` 배경 원형, Micro(10/700) 흰색 |
| 검색 활성 시 | `MonthSelector` 숨김 |

### ActionSheet

카메라/갤러리 선택, 삭제 확인 등 OS 스타일 액션 시트.

| 속성 | 값 |
|------|-----|
| 배경 | 반투명 오버레이 `rgba(0,0,0,0.45)` |
| 시트 | `surface`, radius 16px, margin 수평 14px |
| 타이틀 행 | Caption (13/400) `textTertiary`, border-bottom |
| 액션 버튼 | Body Large (16/500) `text`, 패딩 수직 15px, border-bottom |
| 강조 액션 | `primary` 색상, fontWeight 600 |
| 취소 버튼 | 별도 카드, margin-top 8px, Body Large (16/600) `text` |

---

## 7. 신규 피처 컴포넌트

이슈별로 추가된 기능 전용 컴포넌트. 공통 컴포넌트(6절)의 토큰/패턴을 기반으로 구성.

### InsightCard — `#4 전월 비교 인사이트`

경로: `src/features/stats/components/InsightCard.tsx`

- `messages: InsightMessage[]` prop 수신, 빈 배열이면 `null` 반환
- 각 행: 타입별 아이콘 + 배경색(1.5절) + 텍스트
- 최대 3개 표시, 우선순위: `warning > achievement > saving > info`

```tsx
<InsightCard messages={insights} />
```

### SavingRateCard — `#6 저축률 트래킹`

경로: `src/features/home/components/SavingRateCard.tsx`

- `SavingRateSummary` props 수신
- 저축률 색상: `positive` → `success`, `negative` → `danger`, `zero` → `textSecondary`
- 목표 미설정 시 GaugeBar 숨김
- 달성 시: `success` GaugeBar + "목표 달성!" 텍스트
- `totalIncome === 0`인 달은 카드 전체 숨김

### AssetGoalCard — `#14 자산 목표 설정`

경로: `src/features/home/components/AssetGoalCard.tsx`

- `AssetGoalProgress` props 수신
- 달성 시: 다크 그린 그라데이션 배경 + 초록 GaugeBar + `success` 텍스트
- 달성 미만: `primary` GaugeBar, "목표까지 N원 남음"
- 카드 탭 → `GoalSettingScreen` 이동
- `goalProgress === null` 시 카드 미렌더링

### ReceiptPicker — `#11 영수증 첨부`

경로: `src/features/transactions/components/ReceiptPicker.tsx`

- **첨부 전**: 점선 테두리 버튼, `camera` 아이콘 + "영수증 첨부" 텍스트
- **첨부 후**: 썸네일 이미지 + 우상단 삭제(✕) 버튼 + 하단 파일명/변경 버튼
- **업로드 중**: 썸네일 위 반투명 오버레이 + `ActivityIndicator`
- ActionSheet로 "카메라 촬영 / 갤러리 선택 / 취소" 제공

---

## 8. 사용 컨벤션

- 색상은 항상 `useTheme().colors.*` 토큰을 사용. 하드코딩 금지.
- 스타일은 `useMemo(() => createStyles(colors), [colors])` 패턴으로 생성.
- 아이콘은 `react-native-vector-icons/MaterialIcons` 사용.
- 통화 포맷은 `src/shared/utils/currency.ts`의 `formatCurrency` / `formatCurrencyShort` 사용.
- 날짜는 `src/shared/utils/date.ts`의 dayjs 유틸 사용.
- GaugeBar 진행률은 항상 `Math.min(value, 100)`으로 클램프한 뒤 렌더링.
- 멤버 아바타 색상은 `MEMBER_COLORS[index % MEMBER_COLORS.length]` 방식으로 순환 할당.
- InsightCard 타입 우선순위: `warning > achievement > saving > info` (최대 3개 표시).
