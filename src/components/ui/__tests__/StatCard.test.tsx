import React from 'react';
import { render } from '@testing-library/react-native';
import { StatCard } from '../StatCard';
import { ThemeProvider } from '../../../contexts/ThemeContext';

describe('StatCard', () => {
  const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

  it('renders title, value, unit, and subtitle', () => {
    const { getByText } = renderWithTheme(
      <StatCard
        icon="time-outline"
        title="Usage"
        value={120}
        unit="min"
        subtitle="Last 7 days"
      />
    );

    expect(getByText('Usage')).toBeTruthy();
    expect(getByText('120')).toBeTruthy();
    expect(getByText('min')).toBeTruthy();
    expect(getByText('Last 7 days')).toBeTruthy();
  });
});
