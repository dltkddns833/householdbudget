import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Shared/LoadingSpinner',
  component: LoadingSpinner,
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};
