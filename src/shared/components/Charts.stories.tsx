import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useTheme } from '../theme';

const meta: Meta = {
  title: 'Design System/Charts',
};
export default meta;

// ─── 샘플 데이터 ──────────────────────────────────────────────────────────────

const MONTHS = ['10월', '11월', '12월', '1월', '2월', '3월'];
const ASSET_DATA = [28400, 29100, 31200, 30500, 32800, 34600]; // 만원
const EXPENSE_DATA = [185, 210, 240, 195, 220, 178];           // 만원
const DAILY_DATA = Array.from({ length: 31 }, (_, i) =>
  Math.max(0, Math.round(Math.random() * 15 + (i % 7 === 0 ? 20 : 5)))
);

const CATEGORIES = [
  { key: '식비', amount: 320000, color: '#FF6B6B' },
  { key: '교통', amount: 85000, color: '#4ECDC4' },
  { key: '쇼핑', amount: 210000, color: '#7C5CFC' },
  { key: '문화', amount: 65000, color: '#FFD93D' },
  { key: '의료', amount: 40000, color: '#6C9BCF' },
  { key: '기타', amount: 30000, color: '#A0A0A0' },
];

// ─── 공통 유틸 ────────────────────────────────────────────────────────────────

const normalize = (data: number[]) => {
  const max = Math.max(...data);
  return data.map((v) => v / max);
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 16px' }}>
      {children}
    </h3>
  );
};

const ChartCard: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { colors } = useTheme();
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: `1px solid ${colors.border}`,
      }}
    >
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
};

// ─── Line Chart (실자산 추이) ─────────────────────────────────────────────────

const LineChartDemo: React.FC = () => {
  const { colors } = useTheme();
  const W = 600, H = 180, PAD = { t: 16, r: 16, b: 32, l: 48 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const min = Math.min(...ASSET_DATA) - 1000;
  const max = Math.max(...ASSET_DATA) + 1000;
  const xStep = innerW / (ASSET_DATA.length - 1);
  const yScale = (v: number) => innerH - ((v - min) / (max - min)) * innerH;

  const points = ASSET_DATA.map((v, i) => ({ x: PAD.l + i * xStep, y: PAD.t + yScale(v) }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD.t + innerH} L ${PAD.l} ${PAD.t + innerH} Z`;

  const yTicks = 4;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = min + ((max - min) * i) / yTicks;
    const y = PAD.t + yScale(val);
    return { y, label: Math.round(val / 100) * 100 };
  });

  const fmtY = (v: number) => v.toLocaleString('ko-KR');

  return (
    <ChartCard title="실자산 추이 (만원)">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.primary} stopOpacity={0.2} />
            <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* 가로 그리드 */}
        {gridLines.map(({ y, label }) => (
          <g key={label}>
            <line
              x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
              stroke={colors.borderLight} strokeWidth={1} strokeDasharray="4,4"
            />
            <text x={PAD.l - 6} y={y + 4} fontSize={10} fill={colors.textTertiary} textAnchor="end">
              {fmtY(label)}
            </text>
          </g>
        ))}

        {/* Area */}
        <path d={areaPath} fill="url(#lineGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill={colors.surface} stroke={colors.primary} strokeWidth={2} />
            <text x={PAD.l + i * xStep} y={H - 8} fontSize={10} fill={colors.textTertiary} textAnchor="middle">
              {MONTHS[i]}
            </text>
          </g>
        ))}

        {/* 최신값 말풍선 */}
        {(() => {
          const last = points[points.length - 1];
          const val = ASSET_DATA[ASSET_DATA.length - 1];
          return (
            <g>
              <rect x={last.x - 28} y={last.y - 28} width={56} height={20} rx={6} fill={colors.primary} />
              <text x={last.x} y={last.y - 14} fontSize={10} fill="#fff" textAnchor="middle" fontWeight="700">
                {fmtY(val)}
              </text>
            </g>
          );
        })()}
      </svg>
    </ChartCard>
  );
};

// ─── Bar Chart (월별 지출) ────────────────────────────────────────────────────

const BarChartDemo: React.FC = () => {
  const { colors } = useTheme();
  const W = 600, H = 180, PAD = { t: 16, r: 16, b: 32, l: 48 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const barW = (innerW / EXPENSE_DATA.length) * 0.55;
  const xStep = innerW / EXPENSE_DATA.length;
  const maxVal = Math.max(...EXPENSE_DATA) * 1.15;

  const yTicks = 4;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = (maxVal * i) / yTicks;
    const y = PAD.t + innerH - (val / maxVal) * innerH;
    return { y, label: Math.round(val) };
  });

  return (
    <ChartCard title="월별 소비 추이 (만원)">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* 그리드 */}
        {gridLines.map(({ y, label }) => (
          <g key={label}>
            <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
              stroke={colors.borderLight} strokeWidth={1} strokeDasharray="4,4" />
            <text x={PAD.l - 6} y={y + 4} fontSize={10} fill={colors.textTertiary} textAnchor="end">
              {label}
            </text>
          </g>
        ))}

        {/* Bars */}
        {EXPENSE_DATA.map((v, i) => {
          const barH = (v / maxVal) * innerH;
          const x = PAD.l + i * xStep + xStep / 2 - barW / 2;
          const y = PAD.t + innerH - barH;
          const isLast = i === EXPENSE_DATA.length - 1;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={barH} rx={4}
                fill={isLast ? colors.primary : colors.primaryLight}
                opacity={isLast ? 1 : 0.7}
              />
              {isLast && (
                <text x={x + barW / 2} y={y - 6} fontSize={10} fill={colors.primary} textAnchor="middle" fontWeight="700">
                  {v}
                </text>
              )}
              <text x={x + barW / 2} y={H - 8} fontSize={10} fill={colors.textTertiary} textAnchor="middle">
                {MONTHS[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
};

// ─── Daily Bar Chart ──────────────────────────────────────────────────────────

const DailyBarChart: React.FC = () => {
  const { colors } = useTheme();
  const W = 640, H = 140, PAD = { t: 12, r: 8, b: 28, l: 36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const barW = Math.max(2, (innerW / DAILY_DATA.length) * 0.65);
  const xStep = innerW / DAILY_DATA.length;
  const maxVal = Math.max(...DAILY_DATA) * 1.2 || 1;

  return (
    <ChartCard title="일별 지출 (만원)">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {[0, 0.5, 1].map((t) => {
          const y = PAD.t + innerH - t * innerH;
          return (
            <g key={t}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                stroke={colors.borderLight} strokeWidth={1} strokeDasharray="4,4" />
              <text x={PAD.l - 4} y={y + 4} fontSize={9} fill={colors.textTertiary} textAnchor="end">
                {Math.round(maxVal * t)}
              </text>
            </g>
          );
        })}

        {DAILY_DATA.map((v, i) => {
          const barH = (v / maxVal) * innerH;
          const x = PAD.l + i * xStep + xStep / 2 - barW / 2;
          const y = PAD.t + innerH - barH;
          const showLabel = (i + 1) % 5 === 1 || i === 30;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={barW} height={Math.max(barH, 1)} rx={2}
                fill={colors.income} opacity={0.75}
              />
              {showLabel && (
                <text x={x + barW / 2} y={H - 8} fontSize={9} fill={colors.textTertiary} textAnchor="middle">
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </ChartCard>
  );
};

// ─── Stacked Bar (카테고리 분포) ──────────────────────────────────────────────

const StackedBarDemo: React.FC = () => {
  const { colors } = useTheme();
  const total = CATEGORIES.reduce((s, c) => s + c.amount, 0);

  return (
    <ChartCard title="카테고리별 지출 분포">
      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 20 }}>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            style={{
              flex: cat.amount,
              backgroundColor: cat.color,
            }}
          />
        ))}
      </div>

      {/* Ranking list */}
      {CATEGORIES.map((cat) => {
        const pct = (cat.amount / total) * 100;
        return (
          <div
            key={cat.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingBottom: 10,
              marginBottom: 10,
              borderBottom: `1px solid ${colors.borderLight}`,
            }}
          >
            {/* 카테고리명 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 60 }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{cat.key}</span>
            </div>

            {/* Progress bar */}
            <div style={{
              flex: 1,
              height: 8,
              backgroundColor: colors.surfaceSecondary,
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: cat.color, borderRadius: 4 }} />
            </div>

            {/* 금액 */}
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.text, width: 88, textAlign: 'right' }}>
              {cat.amount.toLocaleString()}원
            </span>

            {/* % */}
            <span style={{ fontSize: 12, color: colors.textTertiary, width: 40, textAlign: 'right' }}>
              {pct.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </ChartCard>
  );
};

// ─── Chart Color Showcase ─────────────────────────────────────────────────────

const ChartColorShowcase: React.FC = () => {
  const { colors } = useTheme();
  const normalized = normalize(EXPENSE_DATA);

  return (
    <ChartCard title="차트 색상 팔레트 적용 예시">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {colors.chartColors.map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {/* Mini bar */}
            <div style={{
              width: 32,
              height: Math.max(20, normalized[i % normalized.length] * 80),
              backgroundColor: c,
              borderRadius: '4px 4px 0 0',
            }} />
            <span style={{ fontSize: 10, color: colors.textTertiary }}>{c}</span>
          </div>
        ))}
      </div>

      {/* Donut-style legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
        {CATEGORIES.map((cat) => (
          <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: cat.color }} />
            <span style={{ fontSize: 12, color: colors.textSecondary }}>{cat.key}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
};

// ─── chartConfig 토큰 ─────────────────────────────────────────────────────────

const ChartConfigReference: React.FC = () => {
  const { colors } = useTheme();
  const rows = [
    { key: 'backgroundColor', value: 'colors.surface', desc: '차트 배경' },
    { key: 'backgroundGradientFrom', value: 'colors.surface', desc: '그라데이션 시작' },
    { key: 'backgroundGradientTo', value: 'colors.surface', desc: '그라데이션 끝' },
    { key: 'color (primary)', value: `rgba(${hexToRgb(colors.primary)}, opacity)`, desc: '주요 데이터 선/바' },
    { key: 'color (income)', value: `rgba(${hexToRgb(colors.income)}, opacity)`, desc: '수입/일별 지출 바' },
    { key: 'labelColor', value: 'colors.textTertiary', desc: 'X·Y축 레이블' },
    { key: 'propsForBackgroundLines.stroke', value: 'colors.borderLight', desc: '배경 그리드 선' },
    { key: 'propsForDots.stroke', value: 'colors.primary', desc: '라인차트 점 테두리' },
  ];

  return (
    <ChartCard title="chartConfig 색상 토큰 참조">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
            {['속성', '값', '적용 색상', '용도'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: colors.textSecondary, fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, value, desc }) => {
            const swatch = resolveColor(key, colors);
            return (
              <tr key={key} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                <td style={{ padding: '8px', color: colors.text, fontFamily: 'monospace' }}>{key}</td>
                <td style={{ padding: '8px', color: colors.textSecondary, fontFamily: 'monospace', fontSize: 11 }}>{value}</td>
                <td style={{ padding: '8px' }}>
                  {swatch && (
                    <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: swatch, border: `1px solid ${colors.border}` }} />
                  )}
                </td>
                <td style={{ padding: '8px', color: colors.textTertiary }}>{desc}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ChartCard>
  );
};

function hexToRgb(hex: string): string {
  const c = hex.replace('#', '');
  return `${parseInt(c.slice(0, 2), 16)}, ${parseInt(c.slice(2, 4), 16)}, ${parseInt(c.slice(4, 6), 16)}`;
}

function resolveColor(key: string, colors: ReturnType<typeof useTheme>['colors']): string | null {
  if (key.includes('Background') || key === 'backgroundColor') return colors.surface;
  if (key.includes('primary') || key.includes('Dots')) return colors.primary;
  if (key.includes('income')) return colors.income;
  if (key.includes('label')) return colors.textTertiary;
  if (key.includes('Lines')) return colors.borderLight;
  return null;
}

// ─── Stories ──────────────────────────────────────────────────────────────────

const AllCharts: React.FC = () => (
  <div>
    <LineChartDemo />
    <BarChartDemo />
    <DailyBarChart />
    <StackedBarDemo />
    <ChartColorShowcase />
    <ChartConfigReference />
  </div>
);

export const Overview: StoryObj = {
  name: '전체 차트 모음',
  render: () => <AllCharts />,
};

export const LineChartStory: StoryObj = {
  name: '라인 차트 (실자산 추이)',
  render: () => <LineChartDemo />,
};

export const BarChartStory: StoryObj = {
  name: '바 차트 (월별 소비)',
  render: () => <BarChartDemo />,
};

export const DailyBarStory: StoryObj = {
  name: '바 차트 (일별 지출)',
  render: () => <DailyBarChart />,
};

export const StackedBarStory: StoryObj = {
  name: '카테고리 분포',
  render: () => <StackedBarDemo />,
};

export const ChartColors: StoryObj = {
  name: '차트 색상 & chartConfig',
  render: () => (
    <div>
      <ChartColorShowcase />
      <ChartConfigReference />
    </div>
  ),
};
