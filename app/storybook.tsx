import React from 'react';
import { View, Text } from 'react-native';

const isStorybookEnabled = process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true';

const DisabledStorybook = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <Text style={{ fontSize: 16, textAlign: 'center' }}>
      Storybook is disabled. Start with EXPO_PUBLIC_STORYBOOK_ENABLED=true.
    </Text>
  </View>
);

const StorybookUIRoot = isStorybookEnabled
  ? require('../.rnstorybook').default
  : DisabledStorybook;

export default StorybookUIRoot;
