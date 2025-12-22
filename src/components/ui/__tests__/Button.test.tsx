import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../../contexts/ThemeContext';

describe('Button', () => {
  const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

  it('renders the title and handles press', () => {
    const onPress = jest.fn();

    const { getByText } = renderWithTheme(
      <Button title="Tap me" onPress={onPress} />
    );

    fireEvent.press(getByText('Tap me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('hides the title while loading', () => {
    const { queryByText } = renderWithTheme(
      <Button title="Loading" onPress={() => {}} loading />
    );

    expect(queryByText('Loading')).toBeNull();
  });
});
