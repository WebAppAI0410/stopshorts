import React from 'react';
import { StatCard } from './StatCard';

export default {
  title: 'UI/StatCard',
  component: StatCard,
  args: {
    icon: 'time-outline',
    title: 'Weekly usage',
    value: 12.4,
    unit: 'h',
    subtitle: 'Last 7 days',
  },
};

export const Default = {};

export const Highlight = {
  args: {
    progressColor: '#ff7a59',
    iconColor: '#ff7a59',
  },
};
