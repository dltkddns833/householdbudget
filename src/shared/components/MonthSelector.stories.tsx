import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MonthSelector } from './MonthSelector';

const meta: Meta<typeof MonthSelector> = {
  title: 'Shared/MonthSelector',
  component: MonthSelector,
};

export default meta;
type Story = StoryObj<typeof MonthSelector>;

export const Default: Story = {
  name: '현재 달 (다음 달 비활성)',
  args: { yearMonth: '2026-03', onChangeMonth: () => {} },
};

export const PastMonth: Story = {
  name: '과거 달',
  args: { yearMonth: '2025-11', onChangeMonth: () => {} },
};

export const Interactive: Story = {
  name: '인터랙티브',
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [yearMonth, setYearMonth] = useState('2025-12');
    return <MonthSelector yearMonth={yearMonth} onChangeMonth={setYearMonth} />;
  },
};
