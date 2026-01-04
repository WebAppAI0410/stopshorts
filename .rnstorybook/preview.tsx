import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/contexts/ThemeContext';

const preview = {
  decorators: [
    (Story: React.ComponentType) => (
      <SafeAreaProvider>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </SafeAreaProvider>
    ),
  ],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
  },
};

export default preview;
