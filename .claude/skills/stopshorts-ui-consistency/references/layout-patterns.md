# Layout Patterns Reference

## Onboarding Screen Template

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Button, ProgressIndicator, Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

export default function OnboardingScreenTemplate() {
  const router = useRouter();
  const { colors, typography, spacing, borderRadius } = useTheme();

  const handleContinue = () => {
    router.push('/(onboarding)/next-screen' as Href);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <GlowOrb position="top-left" size="large" color="primary" intensity={0.1} />
      <GlowOrb position="bottom-right" size="xl" color="accent" intensity={0.15} />

      <Header showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View entering={FadeInUp.duration(600)}>
          <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
            {t('screen.title')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {t('screen.subtitle')}
          </Text>
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200)}
          style={{ marginTop: spacing.xl }}
        >
          {/* Content here */}
        </Animated.View>

        {/* Additional Content */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(400)}
          style={{ marginTop: spacing.lg }}
        >
          {/* More content */}
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(600)}
        style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
      >
        <Button
          title={t('common.next')}
          onPress={handleContinue}
          size="lg"
        />
        <View style={{ marginTop: spacing.xl }}>
          <ProgressIndicator totalSteps={11} currentStep={N} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  footer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
});
```

## Dashboard Card Pattern

```tsx
<Animated.View
  entering={FadeInDown.duration(600).delay(200)}
  style={[
    styles.card,
    {
      backgroundColor: colors.backgroundCard,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
    },
  ]}
>
  <View style={styles.cardHeader}>
    <Ionicons name="icon-outline" size={24} color={colors.accent} />
    <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
      Card Title
    </Text>
  </View>
  <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
    Card description text.
  </Text>
</Animated.View>
```

## Settings Row Pattern

```tsx
<TouchableOpacity
  style={[styles.row, { borderBottomColor: colors.borderSubtle }]}
  onPress={onPress}
  activeOpacity={0.7}
>
  <View style={styles.rowLeft}>
    <View style={[styles.iconBox, { backgroundColor: colors.surface }]}>
      <Ionicons name="icon-outline" size={20} color={colors.textPrimary} />
    </View>
    <Text style={[typography.body, { color: colors.textPrimary }]}>
      Setting Label
    </Text>
  </View>
  <View style={styles.rowRight}>
    <Text style={[typography.body, { color: colors.textSecondary, marginRight: 8 }]}>
      Value
    </Text>
    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
  </View>
</TouchableOpacity>
```

## Info Card Pattern

```tsx
<Animated.View
  entering={FadeInUp.duration(600).delay(400)}
  style={[
    styles.infoCard,
    {
      backgroundColor: colors.backgroundCard,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
  ]}
>
  <View style={styles.infoRow}>
    <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
    <Text
      style={[
        typography.bodySmall,
        { color: colors.textSecondary, flex: 1, marginLeft: spacing.sm },
      ]}
    >
      Information text here.
    </Text>
  </View>
</Animated.View>
```

## Selection Card Pattern (using SelectionCard component)

```tsx
<SelectionCard
  selected={selectedOption === 'option1'}
  onPress={() => setSelectedOption('option1')}
  title="Option Title"
  description="Option description"
  icon="star-outline"
/>
```

## Full-Screen Modal Pattern (Immersive)

```tsx
<View style={[styles.fullScreen, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
  <SafeAreaView style={styles.modalContent}>
    {/* Back button */}
    <TouchableOpacity
      onPress={onClose}
      style={styles.modalBackButton}
    >
      <Ionicons name="arrow-back" size={24} color={colors.textMuted} />
    </TouchableOpacity>

    {/* Centered content */}
    <View style={styles.modalCenter}>
      <ShieldIcon size="xl" glowing={true} status="protected" />
      <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center' }]}>
        Modal Title
      </Text>
    </View>

    {/* Bottom actions */}
    <View style={styles.modalFooter}>
      <Button title="Primary Action" onPress={onAction} size="lg" />
    </View>
  </SafeAreaView>
</View>
```
