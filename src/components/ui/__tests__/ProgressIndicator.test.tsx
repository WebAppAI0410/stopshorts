import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressIndicator } from '../ProgressIndicator';
import { ThemeProvider } from '../../../contexts/ThemeContext';

describe('ProgressIndicator', () => {
  const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

  it('renders dots for each step and highlights the current step', () => {
    const { getByTestId } = renderWithTheme(
      <ProgressIndicator totalSteps={3} currentStep={2} />
    );

    const activeDot = getByTestId('progress-dot-2');
    const inactiveDot = getByTestId('progress-dot-1');

    expect(activeDot).toHaveStyle({ width: 24 });
    expect(inactiveDot).toHaveStyle({ width: 8 });
  });
});
