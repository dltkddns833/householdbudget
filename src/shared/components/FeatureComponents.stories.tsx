import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useTheme } from '../theme';

const meta: Meta = {
  title: 'Design System/Feature Components',
};
export default meta;

// ─── 공통 헬퍼 ────────────────────────────────────────────────────────────────

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
        <p style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 20 }}>{description}</p>
      )}
      {children}
    </div>
  );
};

// ─── InsightCard ──────────────────────────────────────────────────────────────

type InsightType = 'warning' | 'achievement' | 'saving' | 'info';

const INSIGHT_CONFIG: Record<InsightType, { bg: string; border: string; icon: string; iconColor: string }> = {
  warning:     { bg: '#FEF3C7', border: '#F59E0B', icon: '⚠',  iconColor: '#F59E0B' },
  achievement: { bg: '#DCFCE7', border: '#22C55E', icon: '🏆', iconColor: '#22C55E' },
  saving:      { bg: '#CCFBF1', border: '#0D9488', icon: '💰', iconColor: '#0D9488' },
  info:        { bg: '#DBEAFE', border: '#3B82F6', icon: 'ℹ',  iconColor: '#3B82F6' },
};

const InsightCardItem: React.FC<{
  type: InsightType;
  title: string;
  description: string;
}> = ({ type, title, description }) => {
  const cfg = INSIGHT_CONFIG[type];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: cfg.bg,
        borderRadius: 12,
        borderLeft: `3px solid ${cfg.border}`,
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{cfg.icon}</span>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', margin: '0 0 2px' }}>{title}</p>
        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{description}</p>
      </div>
    </div>
  );
};

const InsightCardDemo: React.FC = () => {
  return (
    <DemoCard
      title="InsightCard"
      description="통계 화면 하단 인사이트 카드 (issue #4). 타입 우선순위: warning > achievement > saving > info. 최대 3개 표시"
    >
      {/* All variants */}
      <InsightCardItem
        type="warning"
        title="식비 예산 초과 위험"
        description="이번 달 식비 예산의 89%를 사용했어요. 남은 기간 지출에 주의하세요."
      />
      <InsightCardItem
        type="achievement"
        title="저축 목표 달성!"
        description="이번 달 목표 저축률 20%를 달성했어요. 훌륭해요!"
      />
      <InsightCardItem
        type="saving"
        title="이번 달 절약 성공"
        description="지난달 대비 교통비를 15,000원 절약했어요."
      />
      <InsightCardItem
        type="info"
        title="첫 번째 가계부 기록"
        description="아직 데이터가 적어 분석이 제한적이에요. 계속 기록해보세요!"
      />

      {/* Type legend */}
      <div
        style={{
          marginTop: 12,
          padding: 12,
          backgroundColor: '#f8fafc',
          borderRadius: 8,
          fontSize: 12,
          color: '#64748b',
        }}
      >
        <strong>우선순위:</strong> warning → achievement → saving → info (최대 3개)
      </div>
    </DemoCard>
  );
};

// ─── SavingRateCard ───────────────────────────────────────────────────────────

const SavingRateCardDemo: React.FC = () => {
  const { colors } = useTheme();

  const cases = [
    { label: '목표 달성', rate: 24, goal: 20, achieved: true },
    { label: '목표 미달', rate: 12, goal: 20, achieved: false },
    { label: '마이너스 저축률', rate: -8, goal: 20, achieved: false },
  ];

  return (
    <DemoCard
      title="SavingRateCard"
      description="홈 화면 저축률 카드 (issue #6). 달성 시 초록 그라데이션, 미달 시 경고 표시, 음수 시 빨간 텍스트"
    >
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {cases.map(({ label, rate, goal, achieved }) => {
          const gaugeValue = Math.min(Math.max(rate, 0), 100);
          const gaugeMax = Math.max(goal, rate > 0 ? rate : 0) * 1.2 || 20;
          const gaugePct = (gaugeValue / gaugeMax) * 100;
          const goalPct = (goal / gaugeMax) * 100;

          return (
            <div
              key={label}
              style={{
                width: 200,
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* Header gradient */}
              <div
                style={{
                  padding: '16px 16px 20px',
                  background: achieved
                    ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)'
                    : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                }}
              >
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>
                  이번 달 저축률
                </p>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: rate < 0 ? '#F87171' : achieved ? '#34D399' : '#F1F5F9',
                    margin: '0 0 2px',
                  }}
                >
                  {rate}%
                </p>
                {achieved && (
                  <p style={{ fontSize: 11, color: '#6EE7B7', margin: 0 }}>목표 달성!</p>
                )}
              </div>

              {/* Gauge + goal */}
              <div
                style={{
                  padding: 16,
                  backgroundColor: colors.surface,
                }}
              >
                {/* Gauge */}
                <div
                  style={{
                    height: 8,
                    backgroundColor: colors.surfaceSecondary,
                    borderRadius: 4,
                    position: 'relative',
                    overflow: 'visible',
                    marginBottom: 8,
                  }}
                >
                  {/* Fill */}
                  {gaugeValue > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: `${gaugePct}%`,
                        height: '100%',
                        backgroundColor: achieved ? colors.success : colors.warning,
                        borderRadius: 4,
                      }}
                    />
                  )}
                  {/* Goal marker */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${goalPct}%`,
                      top: -3,
                      width: 2,
                      height: 14,
                      backgroundColor: colors.primary,
                      borderRadius: 1,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: colors.textTertiary }}>{label}</span>
                  <span style={{ fontSize: 11, color: colors.primary }}>목표 {goal}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DemoCard>
  );
};

// ─── AssetGoalCard ────────────────────────────────────────────────────────────

const AssetGoalCardDemo: React.FC = () => {
  const { colors } = useTheme();

  const cases = [
    { label: '진행 중', current: 23400000, goal: 50000000, achieved: false },
    { label: '달성', current: 52000000, goal: 50000000, achieved: true },
  ];

  const fmt = (n: number) => (n / 10000).toFixed(0) + '만원';

  return (
    <DemoCard
      title="AssetGoalCard"
      description="홈 화면 자산 목표 카드 (issue #14). 달성 시 초록 그라데이션 + 트로피 아이콘"
    >
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {cases.map(({ label, current, goal, achieved }) => {
          const pct = Math.min((current / goal) * 100, 100);
          return (
            <div
              key={label}
              style={{
                width: 220,
                borderRadius: 16,
                overflow: 'hidden',
                border: `1px solid ${achieved ? '#16a34a' : colors.border}`,
                boxShadow: achieved ? '0 0 0 2px #bbf7d0' : 'none',
              }}
            >
              <div
                style={{
                  padding: '16px 16px 20px',
                  background: achieved
                    ? 'linear-gradient(135deg, #14532D 0%, #166534 100%)'
                    : `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', margin: '0 0 4px' }}>
                      자산 목표
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>
                      {fmt(current)}
                    </p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                      / {fmt(goal)}
                    </p>
                  </div>
                  {achieved && (
                    <span style={{ fontSize: 28 }}>🏆</span>
                  )}
                </div>
              </div>

              <div style={{ padding: 16, backgroundColor: colors.surface }}>
                <div style={{ marginBottom: 8 }}>
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
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: achieved ? '#22c55e' : colors.primary,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: colors.textTertiary }}>{label}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: achieved ? colors.success : colors.primary,
                    }}
                  >
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DemoCard>
  );
};

// ─── NotificationSettingsRow ──────────────────────────────────────────────────

const NotificationSettingsDemo: React.FC = () => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState({
    budgetAlert: true,
    recurringAlert: true,
    monthlySetup: false,
  });

  const rows = [
    {
      key: 'budgetAlert' as const,
      title: '예산 초과 알림',
      description: '카테고리 예산의 80% 이상 사용 시',
      icon: '📊',
    },
    {
      key: 'recurringAlert' as const,
      title: '고정비 납부일 알림',
      description: '납부일 당일 오전 9시',
      icon: '🔄',
    },
    {
      key: 'monthlySetup' as const,
      title: '월 초 예산 설정 안내',
      description: '매월 1일 오전 8시',
      icon: '📅',
    },
  ];

  return (
    <DemoCard
      title="NotificationSettingsRow"
      description="알림 설정 화면 토글 행 (issue #17). 각 알림 종류를 개별적으로 켜고 끌 수 있음"
    >
      {/* Permission warning */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#FEF3C7',
          borderRadius: 10,
          borderLeft: '3px solid #F59E0B',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 16 }}>⚠</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, color: '#92400E', fontWeight: 600, margin: '0 0 2px' }}>
            알림 권한이 꺼져 있어요
          </p>
          <p style={{ fontSize: 12, color: '#B45309', margin: 0 }}>
            시스템 설정에서 알림을 허용해야 받을 수 있어요
          </p>
        </div>
        <button
          style={{
            background: 'none',
            border: 'none',
            fontSize: 12,
            color: '#D97706',
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          설정 열기
        </button>
      </div>

      {/* Toggle rows */}
      <div
        style={{
          borderRadius: 12,
          border: `1px solid ${colors.border}`,
          overflow: 'hidden',
        }}
      >
        {rows.map(({ key, title, description, icon }, i) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              borderBottom: i < rows.length - 1 ? `1px solid ${colors.borderLight}` : 'none',
              backgroundColor: colors.surface,
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: '0 0 2px' }}>
                {title}
              </p>
              <p style={{ fontSize: 12, color: colors.textSecondary, margin: 0 }}>{description}</p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: settings[key] ? colors.primary : colors.border,
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  left: settings[key] ? 23 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Deeplink table */}
      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 8 }}>
          알림 탭 → 딥링크
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              {['알림 type', '이동 화면'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '6px 8px',
                    color: colors.textSecondary,
                    fontWeight: 600,
                    borderBottom: `1px solid ${colors.border}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { type: "type: 'budget'", screen: 'StatsScreen' },
              { type: "type: 'recurring'", screen: 'RecurringListScreen' },
              { type: "type: 'monthly_setup'", screen: 'BudgetSettingScreen' },
            ].map(({ type, screen }) => (
              <tr key={type} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                <td style={{ padding: '8px', color: colors.text, fontFamily: 'monospace' }}>{type}</td>
                <td style={{ padding: '8px', color: colors.primary, fontWeight: 600 }}>{screen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoCard>
  );
};

// ─── 전체 스토리 ──────────────────────────────────────────────────────────────

const AllFeatureComponents: React.FC = () => (
  <div>
    <InsightCardDemo />
    <SavingRateCardDemo />
    <AssetGoalCardDemo />
    <NotificationSettingsDemo />
  </div>
);

export const Overview: StoryObj = {
  name: '전체 피처 컴포넌트 모음',
  render: () => <AllFeatureComponents />,
};

export const InsightCard: StoryObj = {
  name: 'InsightCard',
  render: () => <InsightCardDemo />,
};

export const SavingRateCard: StoryObj = {
  name: 'SavingRateCard',
  render: () => <SavingRateCardDemo />,
};

export const AssetGoalCard: StoryObj = {
  name: 'AssetGoalCard',
  render: () => <AssetGoalCardDemo />,
};

export const NotificationSettings: StoryObj = {
  name: 'NotificationSettingsRow',
  render: () => <NotificationSettingsDemo />,
};
