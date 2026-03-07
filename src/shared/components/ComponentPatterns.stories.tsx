import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useTheme } from '../theme';

const meta: Meta = {
  title: 'Design System/Component Patterns',
};
export default meta;

// ─── 공통 헬퍼 ────────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <h3
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: colors.textTertiary,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        margin: '32px 0 16px',
        paddingBottom: 8,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </h3>
  );
};

const DemoCard: React.FC<{ children: React.ReactNode; title: string; description?: string }> = ({
  children,
  title,
  description,
}) => {
  const { colors } = useTheme();
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{title}</p>
      {description && (
        <p style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 16 }}>{description}</p>
      )}
      {children}
    </div>
  );
};

// ─── SegmentControl ───────────────────────────────────────────────────────────

const SegmentControlDemo: React.FC = () => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(0);
  const tabs = ['월간', '연간'];

  return (
    <DemoCard
      title="SegmentControl"
      description="탭 전환 — 통계 화면의 월간/연간 전환에 사용 (issue #5)"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Default (2-tab) */}
        <div>
          <p style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }}>기본 (2탭)</p>
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 10,
              padding: 3,
              gap: 2,
            }}
          >
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setSelected(i)}
                style={{
                  padding: '7px 24px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: selected === i ? 700 : 500,
                  backgroundColor: selected === i ? colors.surface : 'transparent',
                  color: selected === i ? colors.primary : colors.textSecondary,
                  boxShadow: selected === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Full-width variant */}
        <div>
          <p style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }}>Full-width</p>
          <div
            style={{
              display: 'flex',
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 10,
              padding: 3,
              gap: 2,
              maxWidth: 320,
            }}
          >
            {tabs.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setSelected(i)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: selected === i ? 700 : 500,
                  backgroundColor: selected === i ? colors.surface : 'transparent',
                  color: selected === i ? colors.primary : colors.textSecondary,
                  boxShadow: selected === i ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spec */}
      <div
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 8,
          fontSize: 12,
          color: colors.textSecondary,
          fontFamily: 'monospace',
        }}
      >
        backgroundColor: surfaceSecondary | selectedBg: surface | borderRadius: 10 / 8 | padding: 3
      </div>
    </DemoCard>
  );
};

// ─── GaugeBar ─────────────────────────────────────────────────────────────────

const GaugeBarDemo: React.FC = () => {
  const { colors } = useTheme();

  const gauges = [
    { label: '식비 예산', value: 43, color: colors.primary },
    { label: '교통비 예산', value: 78, color: colors.warning },
    { label: '쇼핑 예산', value: 92, color: colors.danger },
    { label: '문화/여가', value: 110, color: colors.danger, clamped: true },
    { label: '저축률 목표', value: 65, color: colors.success },
  ];

  return (
    <DemoCard
      title="GaugeBar"
      description="예산 진행률 / 저축률 목표 표시. 100% 초과는 Math.min(value, 100)으로 클램프"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 400 }}>
        {gauges.map(({ label, value, color, clamped }) => {
          const displayPct = Math.min(value, 100);
          return (
            <div key={label}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 5,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>{label}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: value >= 100 ? colors.danger : value >= 80 ? colors.warning : colors.text,
                  }}
                >
                  {value}%{clamped && ' (클램프)'}
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  backgroundColor: colors.surfaceSecondary,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${displayPct}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: 4,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Color rules */}
      <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
        {[
          { range: '0–79%', color: colors.primary, label: 'primary' },
          { range: '80–99%', color: colors.warning, label: 'warning' },
          { range: '100%+', color: colors.danger, label: 'danger' },
        ].map(({ range, color, label }) => (
          <div key={range} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color }} />
            <span style={{ fontSize: 11, color: colors.textSecondary }}>
              {range} — {label}
            </span>
          </div>
        ))}
      </div>
    </DemoCard>
  );
};

// ─── WarningBanner ────────────────────────────────────────────────────────────

const WarningBannerDemo: React.FC = () => {
  const { colors } = useTheme();

  const banners = [
    {
      type: 'warning',
      bg: '#FEF3C7',
      border: '#F59E0B',
      icon: '⚠',
      iconColor: '#F59E0B',
      text: '이번 달 납부할 고정비가 3건 있어요',
      actionText: '확인하기',
    },
    {
      type: 'info',
      bg: '#DBEAFE',
      border: '#3B82F6',
      icon: 'ℹ',
      iconColor: '#3B82F6',
      text: '예산을 아직 설정하지 않았어요',
      actionText: '설정하기',
    },
    {
      type: 'danger',
      bg: '#FEE2E2',
      border: '#EF4444',
      icon: '!',
      iconColor: '#EF4444',
      text: '식비 예산의 92%를 사용했어요',
      actionText: '자세히',
    },
  ];

  return (
    <DemoCard
      title="WarningBanner"
      description="홈 화면 상단 고정비 납부 예정 알림 배너 (issue #2). 타입별 색상 변형 포함"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
        {banners.map(({ type, bg, border, icon, iconColor, text, actionText }) => (
          <div
            key={type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              backgroundColor: bg,
              borderRadius: 10,
              borderLeft: `3px solid ${border}`,
            }}
          >
            <span style={{ fontSize: 16, color: iconColor, flexShrink: 0, fontWeight: 700 }}>
              {icon}
            </span>
            <span style={{ flex: 1, fontSize: 13, color: '#1e293b' }}>{text}</span>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                color: iconColor,
                flexShrink: 0,
              }}
            >
              {actionText}
            </button>
          </div>
        ))}
      </div>
    </DemoCard>
  );
};

// ─── MemberChip ───────────────────────────────────────────────────────────────

const MEMBER_COLORS = ['#0D9488', '#7C5CFC', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

const MemberChipDemo: React.FC = () => {
  const { colors } = useTheme();
  const members = ['나', '배우자', '자녀1', '자녀2'];
  const [selected, setSelected] = useState<string[]>(['나']);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  };

  return (
    <DemoCard
      title="MemberChip"
      description="거래 추가 시 지출자 멤버 선택 칩 (issue #3). MEMBER_COLORS[index % length] 방식 순환 할당"
    >
      {/* Selection chips */}
      <div>
        <p style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }}>선택형 (거래 추가)</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {members.map((name, i) => {
            const memberColor = MEMBER_COLORS[i % MEMBER_COLORS.length];
            const isSelected = selected.includes(name);
            return (
              <button
                key={name}
                onClick={() => toggle(name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px 6px 8px',
                  borderRadius: 9999,
                  border: `1.5px solid ${isSelected ? memberColor : colors.border}`,
                  backgroundColor: isSelected ? memberColor + '22' : colors.surface,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: memberColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#fff', fontWeight: 700 }}>
                    {name[0]}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? memberColor : colors.text,
                  }}
                >
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Display-only (stats breakdown) */}
      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }}>표시용 (통계 멤버별 분석)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
          {members.map((name, i) => {
            const memberColor = MEMBER_COLORS[i % MEMBER_COLORS.length];
            const pct = [52, 30, 12, 6][i];
            const amount = [624000, 360000, 144000, 72000][i];
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: memberColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{name[0]}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, width: 44 }}>
                  {name}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    backgroundColor: colors.surfaceSecondary,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: memberColor,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, color: colors.textSecondary, width: 72, textAlign: 'right' }}>
                  {amount.toLocaleString()}원
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DemoCard>
  );
};

// ─── SearchBar ────────────────────────────────────────────────────────────────

const SearchBarDemo: React.FC = () => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <DemoCard
      title="SearchBar"
      description="거래 내역 검색 (issue #7). 포커스 시 테두리 primary 색상 전환"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
        {/* Active with text */}
        <div>
          <p style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }}>입력 중</p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 12,
              border: `1.5px solid ${focused ? colors.primary : 'transparent'}`,
            }}
          >
            <span style={{ fontSize: 16, color: colors.textTertiary }}>🔍</span>
            <input
              value={query}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="거래 내역 검색"
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: 15,
                color: colors.text,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: colors.textTertiary,
                    color: colors.surface,
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  ✕
                </span>
              </button>
            )}
          </div>
        </div>

        {/* With filter chip */}
        <div>
          <p style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }}>필터 칩 (FilterPanel 닫힌 후)</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['식비', '지출만', '이번 달'].map((chip) => (
              <div
                key={chip}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 9999,
                  backgroundColor: colors.primaryLight + '33',
                  border: `1px solid ${colors.primary}`,
                }}
              >
                <span style={{ fontSize: 12, color: colors.primary, fontWeight: 600 }}>{chip}</span>
                <span style={{ fontSize: 10, color: colors.primary, fontWeight: 700 }}>✕</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlighted result */}
        <div>
          <p style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }}>검색 결과 하이라이트</p>
          {[
            { title: '편의점 GS25', keyword: 'GS' },
            { title: '스타벅스', keyword: '스타' },
          ].map(({ title, keyword }) => {
            const idx = title.indexOf(keyword);
            return (
              <div
                key={title}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}
              >
                <span style={{ fontSize: 14, color: colors.text }}>
                  {title.slice(0, idx)}
                  <mark
                    style={{
                      backgroundColor: colors.primaryLight + '66',
                      color: colors.primary,
                      fontWeight: 700,
                      borderRadius: 3,
                      padding: '0 2px',
                    }}
                  >
                    {keyword}
                  </mark>
                  {title.slice(idx + keyword.length)}
                </span>
                <span style={{ fontSize: 13, color: colors.expense, fontWeight: 600 }}>-3,200원</span>
              </div>
            );
          })}
        </div>
      </div>
    </DemoCard>
  );
};

// ─── ActionSheet ──────────────────────────────────────────────────────────────

const ActionSheetDemo: React.FC = () => {
  const { colors } = useTheme();

  return (
    <DemoCard
      title="ActionSheet"
      description="바텀 시트 스타일 옵션 선택 (issue #11 — 영수증 첨부). react-native-action-sheet 기반"
    >
      {/* Simulated bottom sheet */}
      <div style={{ maxWidth: 360, position: 'relative' }}>
        {/* Backdrop */}
        <div
          style={{
            height: 120,
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        />

        {/* Sheet */}
        <div
          style={{
            backgroundColor: colors.surface,
            borderRadius: '16px 16px 0 0',
            padding: '8px 0 0',
            border: `1px solid ${colors.border}`,
          }}
        >
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
            <div
              style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }}
            />
          </div>

          {/* Title */}
          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: colors.textTertiary,
              padding: '4px 0 8px',
              borderBottom: `1px solid ${colors.borderLight}`,
            }}
          >
            영수증 첨부
          </p>

          {/* Options */}
          {[
            { icon: '📷', label: '카메라 촬영' },
            { icon: '🖼', label: '갤러리에서 선택' },
          ].map(({ icon, label }) => (
            <button
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '15px 20px',
                background: 'none',
                border: 'none',
                borderBottom: `1px solid ${colors.borderLight}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 16, color: colors.text, fontWeight: 500 }}>{label}</span>
            </button>
          ))}

          {/* Cancel */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '15px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 16, color: colors.danger, fontWeight: 600 }}>취소</span>
          </button>
        </div>
      </div>

      {/* Spec */}
      <div
        style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: colors.surfaceSecondary,
          borderRadius: 8,
          fontSize: 12,
          color: colors.textSecondary,
          fontFamily: 'monospace',
        }}
      >
        handleColor: border | borderRadius: 16 (top) | itemHeight: ~52px | cancelColor: danger
      </div>
    </DemoCard>
  );
};

// ─── 전체 스토리 ──────────────────────────────────────────────────────────────

const AllPatterns: React.FC = () => (
  <div>
    <SegmentControlDemo />
    <GaugeBarDemo />
    <WarningBannerDemo />
    <MemberChipDemo />
    <SearchBarDemo />
    <ActionSheetDemo />
  </div>
);

export const Overview: StoryObj = {
  name: '전체 패턴 모음',
  render: () => <AllPatterns />,
};

export const SegmentControl: StoryObj = {
  name: 'SegmentControl',
  render: () => <SegmentControlDemo />,
};

export const GaugeBar: StoryObj = {
  name: 'GaugeBar',
  render: () => <GaugeBarDemo />,
};

export const WarningBanner: StoryObj = {
  name: 'WarningBanner',
  render: () => <WarningBannerDemo />,
};

export const MemberChip: StoryObj = {
  name: 'MemberChip',
  render: () => <MemberChipDemo />,
};

export const SearchBar: StoryObj = {
  name: 'SearchBar',
  render: () => <SearchBarDemo />,
};

export const ActionSheet: StoryObj = {
  name: 'ActionSheet',
  render: () => <ActionSheetDemo />,
};
