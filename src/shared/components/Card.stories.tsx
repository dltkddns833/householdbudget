import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Shared/Card',
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <Text style={{ color: '#0F172A', fontSize: 16 }}>카드 기본 내용입니다.</Text>
    </Card>
  ),
};

export const WithShadow: Story = {
  name: 'WithShadow (그림자 강조)',
  render: () => (
    <Card style={{ shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}>
      <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '600' }}>그림자가 강조된 카드</Text>
      <Text style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>
        style prop으로 shadowOpacity/elevation 조정 가능
      </Text>
    </Card>
  ),
};
