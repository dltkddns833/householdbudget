import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useTheme } from '../theme';
import iconSrc from '../../../ios/HouseholdBudget/Images.xcassets/AppIcon.appiconset/icon-1024x1024.png';

const meta: Meta = {
  title: 'Design System/App Icon',
};
export default meta;

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '32px 0 16px 0' }}>
      {children}
    </h3>
  );
};

// iOS 아이콘 border-radius: 아이콘 크기의 22.37%
const iosRadius = (size: number) => `${(size * 0.2237).toFixed(1)}px`;

// ─── 아이콘 크기 스펙 ─────────────────────────────────────────────────────────

const AllSizesStory: React.FC = () => {
  const { colors } = useTheme();

  const iosSizes = [
    { label: 'App Store\n1024pt', display: 120, actual: 1024 },
    { label: 'Home Screen\n60pt @3x', display: 87, actual: 180 },
    { label: 'Home Screen\n60pt @2x', display: 60, actual: 120 },
    { label: 'Spotlight\n40pt @2x', display: 40, actual: 80 },
    { label: 'Settings\n29pt @2x', display: 29, actual: 58 },
    { label: 'Notification\n20pt @2x', display: 20, actual: 40 },
  ];

  const androidSizes = [
    { label: 'xxxhdpi\n192px', display: 96, actual: 192 },
    { label: 'xxhdpi\n144px', display: 72, actual: 144 },
    { label: 'xhdpi\n96px', display: 48, actual: 96 },
    { label: 'hdpi\n72px', display: 36, actual: 72 },
    { label: 'mdpi\n48px', display: 24, actual: 48 },
  ];

  return (
    <div style={{ color: colors.text }}>
      <SectionTitle>iOS 아이콘 크기</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        {iosSizes.map(({ label, display, actual }) => (
          <div key={actual} style={{ textAlign: 'center' }}>
            <img
              src={iconSrc}
              width={display}
              height={display}
              style={{ borderRadius: iosRadius(display), display: 'block' }}
            />
            <div style={{ fontSize: 10, color: colors.textTertiary, marginTop: 6, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Android 아이콘 크기</SectionTitle>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
        {androidSizes.map(({ label, display, actual }) => (
          <div key={actual} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {/* Square */}
            <img src={iconSrc} width={display} height={display} style={{ borderRadius: 4, display: 'block' }} />
            {/* Round */}
            <img src={iconSrc} width={display} height={display} style={{ borderRadius: '50%', display: 'block' }} />
            <div style={{ fontSize: 10, color: colors.textTertiary, whiteSpace: 'pre-line', lineHeight: 1.4, textAlign: 'center' }}>
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── iOS 홈 화면 목업 ─────────────────────────────────────────────────────────

const IOSHomeScreenStory: React.FC = () => {
  const { colors } = useTheme();

  // 같은 크기 자리채움용 더미 앱들
  const dummyApps = [
    { name: '설정', bg: '#8E8E93' },
    { name: '메시지', bg: '#34C759' },
    { name: '카메라', bg: '#1C1C1E' },
    { name: '지도', bg: '#30B0C7' },
    { name: '날씨', bg: '#4A90D9' },
    { name: '캘린더', bg: '#FF3B30' },
    { name: '시계', bg: '#1C1C1E' },
    { name: '앱스토어', bg: '#0A84FF' },
  ];

  const ICON = 60;
  const radius = iosRadius(ICON);

  return (
    <div>
      <SectionTitle>iOS 홈 화면 미리보기</SectionTitle>
      <div
        style={{
          width: 320,
          background: 'linear-gradient(160deg, #1a6b5a 0%, #0f4c3a 100%)',
          borderRadius: 40,
          padding: '48px 24px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* 상태바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, padding: '0 8px' }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>9:41</span>
          <span style={{ color: 'white', fontSize: 11 }}>●●● 📶 🔋</span>
        </div>

        {/* 앱 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
          {/* 우리집 가계부 하이라이트 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <img
              src={iconSrc}
              width={ICON}
              height={ICON}
              style={{
                borderRadius: radius,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                outline: '2px solid rgba(255,255,255,0.4)',
                outlineOffset: 2,
              }}
            />
            <span style={{ color: 'white', fontSize: 10, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>가계부</span>
          </div>

          {/* 더미 앱들 */}
          {dummyApps.map((app) => (
            <div key={app.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: ICON,
                  height: ICON,
                  borderRadius: radius,
                  backgroundColor: app.bg,
                  opacity: 0.6,
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>{app.name}</span>
            </div>
          ))}
        </div>

        {/* 독 */}
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 8,
          }}
        >
          {['전화', '사파리', '메일'].map((name) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: ICON, height: ICON, borderRadius: radius, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Android 홈 화면 목업 ─────────────────────────────────────────────────────

const AndroidHomeScreenStory: React.FC = () => {
  const ICON = 56;

  const dummyApps = [
    { name: 'Gmail', bg: '#EA4335' },
    { name: 'Maps', bg: '#34A853' },
    { name: 'Drive', bg: '#FBBC04' },
    { name: 'Photos', bg: '#4285F4' },
    { name: 'YouTube', bg: '#FF0000' },
    { name: 'Meet', bg: '#00897B' },
    { name: 'Calendar', bg: '#1976D2' },
    { name: 'Chrome', bg: '#4285F4' },
  ];

  return (
    <div>
      <SectionTitle>Android 홈 화면 미리보기</SectionTitle>
      <div
        style={{
          width: 320,
          background: 'linear-gradient(160deg, #0a3d2e 0%, #062620 100%)',
          borderRadius: 32,
          padding: '40px 20px 28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* 상태바 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, padding: '0 8px' }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>9:41</span>
          <span style={{ color: 'white', fontSize: 11 }}>📶 🔋</span>
        </div>

        {/* 앱 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
          {/* 우리집 가계부 — 원형 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <img
              src={iconSrc}
              width={ICON}
              height={ICON}
              style={{
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                outline: '2px solid rgba(255,255,255,0.4)',
                outlineOffset: 2,
              }}
            />
            <span style={{ color: 'white', fontSize: 10 }}>가계부</span>
          </div>

          {dummyApps.map((app) => (
            <div key={app.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: ICON,
                  height: ICON,
                  borderRadius: '50%',
                  backgroundColor: app.bg,
                  opacity: 0.5,
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{app.name}</span>
            </div>
          ))}
        </div>

        {/* 하단 독 */}
        <div
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-around',
          }}
        >
          {['전화', '연락처', '문자'].map((name) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: ICON, height: ICON, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── 색상 스펙 ────────────────────────────────────────────────────────────────

const IconSpecStory: React.FC = () => {
  const { colors } = useTheme();

  const specs = [
    { label: '배경 그라데이션 시작', color: '#0D9488', token: 'primary' },
    { label: '배경 그라데이션 끝', color: '#0F766E', token: 'primaryDark' },
    { label: '카드 슬롯', color: '#14B8A6', token: 'Teal-400' },
    { label: '지갑 아이콘', color: '#FFFFFF', token: 'white' },
  ];

  return (
    <div style={{ color: colors.text }}>
      <SectionTitle>아이콘 색상 스펙</SectionTitle>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <img src={iconSrc} width={160} height={160} style={{ borderRadius: iosRadius(160), flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 240 }}>
          {specs.map(({ label, color, token }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: `1px solid ${colors.borderLight}`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: color,
                  border: `1px solid ${colors.border}`,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{label}</div>
                <div style={{ fontSize: 11, color: colors.textTertiary, fontFamily: 'monospace' }}>
                  {color} · {token}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>전체 사이즈 목록</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
            {['플랫폼', '용도', '파일명', '크기'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: colors.textSecondary, fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['iOS', 'App Store', 'icon-1024x1024.png', '1024×1024'],
            ['iOS', 'Home (60pt @3x)', 'icon-180x180.png', '180×180'],
            ['iOS', 'Home (60pt @2x)', 'icon-120x120.png', '120×120'],
            ['iOS', 'Spotlight (40pt @2x)', 'icon-80x80.png', '80×80'],
            ['iOS', 'Settings (29pt @3x)', 'icon-87x87.png', '87×87'],
            ['iOS', 'Settings (29pt @2x)', 'icon-58x58.png', '58×58'],
            ['iOS', 'Notification (20pt @3x)', 'icon-60x60.png', '60×60'],
            ['iOS', 'Notification (20pt @2x)', 'icon-40x40.png', '40×40'],
            ['Android', 'xxxhdpi', 'ic_launcher.png', '192×192'],
            ['Android', 'xxhdpi', 'ic_launcher.png', '144×144'],
            ['Android', 'xhdpi', 'ic_launcher.png', '96×96'],
            ['Android', 'hdpi', 'ic_launcher.png', '72×72'],
            ['Android', 'mdpi', 'ic_launcher.png', '48×48'],
          ].map(([platform, usage, file, size]) => (
            <tr key={`${platform}-${usage}`} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
              <td style={{ padding: '8px 10px', color: colors.text }}>{platform}</td>
              <td style={{ padding: '8px 10px', color: colors.textSecondary }}>{usage}</td>
              <td style={{ padding: '8px 10px', color: colors.textTertiary, fontFamily: 'monospace' }}>{file}</td>
              <td style={{ padding: '8px 10px', color: colors.textSecondary }}>{size}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Sizes: StoryObj = {
  name: '크기별 미리보기',
  render: () => <AllSizesStory />,
};

export const IOSHomeScreen: StoryObj = {
  name: 'iOS 홈 화면 목업',
  render: () => <IOSHomeScreenStory />,
};

export const AndroidHomeScreen: StoryObj = {
  name: 'Android 홈 화면 목업',
  render: () => <AndroidHomeScreenStory />,
};

export const Spec: StoryObj = {
  name: '색상 스펙 & 사이즈 목록',
  render: () => <IconSpecStory />,
};
