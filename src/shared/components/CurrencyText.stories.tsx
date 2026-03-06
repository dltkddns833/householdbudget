import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CurrencyText } from './CurrencyText';

const meta: Meta<typeof CurrencyText> = {
  title: 'Shared/CurrencyText',
  component: CurrencyText,
  argTypes: {
    amount: { control: 'number' },
    short: { control: 'boolean' },
    showSign: { control: 'boolean' },
    colorize: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof CurrencyText>;

export const Income: Story = {
  name: '수입 (양수)',
  args: { amount: 3500000, colorize: true, showSign: true },
};

export const Expense: Story = {
  name: '지출 (음수)',
  args: { amount: -125000, colorize: true },
};

export const Zero: Story = {
  name: '0원',
  args: { amount: 0, colorize: true },
};

export const NoColor: Story = {
  name: '색상 없음',
  args: { amount: 85000, colorize: false, style: { fontSize: 20, fontWeight: '700', color: '#0F172A' } },
};

export const Short: Story = {
  name: '축약 표시',
  args: { amount: 12500000, short: true, style: { fontSize: 18, color: '#0F172A' } },
};
