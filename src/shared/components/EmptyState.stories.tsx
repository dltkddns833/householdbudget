import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: 'receipt-long',
    title: '거래 내역이 없습니다',
    subtitle: '+ 버튼을 눌러 첫 거래를 추가해보세요',
  },
};

export const WithCustomIcon: Story = {
  name: '다른 아이콘',
  args: {
    icon: 'account-balance-wallet',
    title: '자산 정보가 없습니다',
    subtitle: '재무 상태 탭에서 자산을 등록하세요',
  },
};

export const NoSubtitle: Story = {
  name: '부제목 없음',
  args: { icon: 'search-off', title: '검색 결과가 없습니다' },
};
