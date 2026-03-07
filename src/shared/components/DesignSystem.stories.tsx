import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useTheme } from '../theme';
import { lightColors, darkColors } from '../constants/colors';

// ─── 헬퍼 컴포넌트 ────────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, display: 'block', ...style }}>{children}</span>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <h2
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
    </h2>
  );
};

// ─── Color Palette ────────────────────────────────────────────────────────────

const ColorPaletteStory: React.FC = () => {
  const { colors, isDark } = useTheme();

  const groups = [
    {
      name: '브랜드',
      tokens: [
        { name: 'primary', value: colors.primary },
        { name: 'primaryLight', value: colors.primaryLight },
        { name: 'primaryDark', value: colors.primaryDark },
        { name: 'secondary', value: colors.secondary },
        { name: 'secondaryLight', value: colors.secondaryLight },
      ],
    },
    {
      name: '거래',
      tokens: [
        { name: 'income', value: colors.income },
        { name: 'incomeLight', value: colors.incomeLight },
        { name: 'expense', value: colors.expense },
        { name: 'expenseLight', value: colors.expenseLight },
      ],
    },
    {
      name: '시맨틱',
      tokens: [
        { name: 'success', value: colors.success },
        { name: 'warning', value: colors.warning },
        { name: 'danger', value: colors.danger },
        { name: 'info', value: colors.info },
      ],
    },
    {
      name: '서피스',
      tokens: [
        { name: 'background', value: colors.background },
        { name: 'surface', value: colors.surface },
        { name: 'surfaceSecondary', value: colors.surfaceSecondary },
      ],
    },
    {
      name: '텍스트',
      tokens: [
        { name: 'text', value: colors.text },
        { name: 'textSecondary', value: colors.textSecondary },
        { name: 'textTertiary', value: colors.textTertiary },
      ],
    },
    {
      name: '테두리',
      tokens: [
        { name: 'border', value: colors.border },
        { name: 'borderLight', value: colors.borderLight },
      ],
    },
    {
      name: 'InsightCard 타입',
      tokens: [
        { name: 'warning (bg)', value: '#FEF3C7' },
        { name: 'warning (icon)', value: '#F59E0B' },
        { name: 'achievement (bg)', value: '#DCFCE7' },
        { name: 'achievement (icon)', value: '#22C55E' },
        { name: 'saving (bg)', value: '#CCFBF1' },
        { name: 'saving (icon)', value: '#0D9488' },
        { name: 'info (bg)', value: '#DBEAFE' },
        { name: 'info (icon)', value: '#3B82F6' },
      ],
    },
    {
      name: '멤버 아바타',
      tokens: [
        { name: 'member-0', value: '#0D9488' },
        { name: 'member-1', value: '#7C5CFC' },
        { name: 'member-2', value: '#F59E0B' },
        { name: 'member-3', value: '#EF4444' },
        { name: 'member-4', value: '#3B82F6' },
        { name: 'member-5', value: '#EC4899' },
        { name: 'member-6', value: '#22C55E' },
        { name: 'member-7', value: '#64748B' },
      ],
    },
  ];

  return (
    <div style={{ color: colors.text }}>
      <p style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
        현재 테마: <strong>{isDark ? '다크' : '라이트'}</strong> — 우측 상단 Theme 툴바로 전환 가능
      </p>

      {groups.map((group) => (
        <div key={group.name}>
          <SectionTitle>{group.name}</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {group.tokens.map((token) => {
              const isLight = isLightColor(token.value);
              return (
                <div key={token.name} style={{ width: 120 }}>
                  <div
                    style={{
                      width: 120,
                      height: 64,
                      borderRadius: 10,
                      backgroundColor: token.value,
                      border: `1px solid ${colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: 10, color: isLight ? '#334155' : '#f1f5f9', fontWeight: 600 }}>
                      {token.value}
                    </span>
                  </div>
                  <Label>{token.name}</Label>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <SectionTitle>차트 팔레트</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {colors.chartColors.map((c, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: c,
                border: `1px solid ${colors.border}`,
              }}
            />
            <Label style={{ fontSize: 10 }}>{c}</Label>
          </div>
        ))}
      </div>

      <SectionTitle>라이트 vs 다크 비교</SectionTitle>
      <div style={{ display: 'flex', gap: 24 }}>
        {[
          { label: 'Light', scheme: lightColors },
          { label: 'Dark', scheme: darkColors },
        ].map(({ label, scheme }) => (
          <div
            key={label}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: 16,
              backgroundColor: scheme.surface,
              border: `1px solid ${scheme.border}`,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 700, color: scheme.text, marginBottom: 12 }}>{label}</p>
            <div
              style={{
                height: 40,
                borderRadius: 8,
                backgroundColor: scheme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Primary {scheme.primary}</span>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, height: 32, borderRadius: 6, backgroundColor: scheme.income }} />
              <div style={{ flex: 1, height: 32, borderRadius: 6, backgroundColor: scheme.expense }} />
              <div style={{ flex: 1, height: 32, borderRadius: 6, backgroundColor: scheme.secondary }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Typography ───────────────────────────────────────────────────────────────

const TypographyStory: React.FC = () => {
  const { colors } = useTheme();

  const scale = [
    { role: 'Display', size: 32, weight: 800, sample: '₩1,250,000' },
    { role: 'Heading 1', size: 24, weight: 700, sample: '이번 달 지출 요약' },
    { role: 'Heading 2', size: 20, weight: 700, sample: '카테고리별 분석' },
    { role: 'Heading 3', size: 18, weight: 700, sample: '2026년 3월' },
    { role: 'Body Large (semibold)', size: 16, weight: 600, sample: '편의점 · 식비' },
    { role: 'Body Large', size: 16, weight: 400, sample: '3월 한 달간 총 지출액입니다.' },
    { role: 'Body', size: 14, weight: 400, sample: '카드 결제 · 2026-03-05' },
    { role: 'Caption', size: 12, weight: 400, sample: '어제 오후 3:45' },
    { role: 'Micro', size: 11, weight: 500, sample: '식비 · 교통' },
  ];

  return (
    <div style={{ color: colors.text }}>
      {scale.map(({ role, size, weight, sample }) => (
        <div
          key={role}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 24,
            padding: '12px 0',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ width: 180, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: colors.textSecondary }}>{role}</span>
            <br />
            <span style={{ fontSize: 11, color: colors.textTertiary }}>
              {size}px / {weight}
            </span>
          </div>
          <span style={{ fontSize: size, fontWeight: weight, lineHeight: 1.3 }}>{sample}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

const SpacingStory: React.FC = () => {
  const { colors } = useTheme();

  const tokens = [
    { name: 'xs', value: 4 },
    { name: 'sm', value: 8 },
    { name: 'md', value: 12 },
    { name: 'base', value: 16 },
    { name: 'lg', value: 20 },
    { name: 'xl', value: 24 },
    { name: '2xl', value: 32 },
    { name: '3xl', value: 48 },
    { name: '4xl', value: 64 },
  ];

  return (
    <div style={{ color: colors.text }}>
      {tokens.map(({ name, value }) => (
        <div
          key={name}
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}
        >
          <span style={{ width: 40, fontSize: 12, color: colors.textSecondary, fontWeight: 600 }}>{name}</span>
          <span style={{ width: 40, fontSize: 12, color: colors.textTertiary }}>{value}px</span>
          <div
            style={{
              height: 20,
              width: value * 2,
              backgroundColor: colors.primary,
              borderRadius: 4,
              opacity: 0.8,
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ─── Border Radius ────────────────────────────────────────────────────────────

const BorderRadiusStory: React.FC = () => {
  const { colors } = useTheme();

  const tokens = [
    { name: 'sm', value: 4, label: '배지, 태그' },
    { name: 'md', value: 8, label: '입력 필드, 작은 버튼' },
    { name: 'lg', value: 12, label: '드롭다운' },
    { name: 'xl', value: 16, label: 'Card 기본값' },
    { name: '2xl', value: 24, label: '모달, 바텀 시트' },
    { name: 'full', value: 9999, label: 'FAB, 칩' },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {tokens.map(({ name, value, label }) => (
        <div key={name} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: value,
              backgroundColor: colors.primaryLight,
              border: `2px solid ${colors.primary}`,
            }}
          />
          <Label style={{ color: colors.text, fontWeight: 600 }}>{name}</Label>
          <Label>{value === 9999 ? '9999px' : `${value}px`}</Label>
          <Label>{label}</Label>
        </div>
      ))}
    </div>
  );
};

// ─── Shadow ───────────────────────────────────────────────────────────────────

const ShadowStory: React.FC = () => {
  const { colors } = useTheme();

  const tokens = [
    { name: 'flat', css: 'none', label: '배경에 붙는 요소' },
    { name: 'sm', css: '0 1px 4px rgba(0,0,0,0.05)', label: 'Card 기본값' },
    { name: 'md', css: '0 1px 8px rgba(0,0,0,0.10)', label: '떠 있는 카드' },
    { name: 'lg', css: '0 1px 12px rgba(0,0,0,0.15)', label: '모달, FAB' },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
      {tokens.map(({ name, css, label }) => (
        <div key={name}>
          <div
            style={{
              width: 120,
              height: 80,
              borderRadius: 12,
              backgroundColor: colors.surface,
              boxShadow: css,
              border: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 12, color: colors.textSecondary }}>{name}</span>
          </div>
          <Label style={{ color: colors.text }}>{label}</Label>
        </div>
      ))}
    </div>
  );
};

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length < 6) return true;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ─── Meta & Stories ───────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System',
};
export default meta;

export const Colors: StoryObj = {
  name: '색상 팔레트',
  render: () => <ColorPaletteStory />,
};

export const Typography: StoryObj = {
  name: '타이포그래피',
  render: () => <TypographyStory />,
};

export const Spacing: StoryObj = {
  name: '스페이싱',
  render: () => <SpacingStory />,
};

export const BorderRadius: StoryObj = {
  name: 'Border Radius',
  render: () => <BorderRadiusStory />,
};

export const Shadows: StoryObj = {
  name: '그림자',
  render: () => <ShadowStory />,
};
