import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import type { MotivationType } from '../../src/types';

type MotivationOption = {
    id: MotivationType;
    icon: keyof typeof Ionicons.glyphMap;
};

const motivationOptions: MotivationOption[] = [
    { id: 'meaningful_time', icon: 'sparkles-outline' },
    { id: 'pursue_goals', icon: 'flag-outline' },
    { id: 'relationships', icon: 'people-outline' },
    { id: 'self_control', icon: 'shield-checkmark-outline' },
];

export default function MotivationScreen() {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();
    const { setMotivation } = useAppStore();
    const [selectedMotivation, setSelectedMotivation] = useState<MotivationType | null>(null);

    const handleContinue = () => {
        if (selectedMotivation) {
            setMotivation(selectedMotivation);
            router.push('/(onboarding)/screentime-permission' as Href);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header showBack />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(600).delay(100)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            marginBottom: spacing.sm,
                        }
                    ]}>
                        {t('onboarding.v3.motivation.title')}
                    </Text>
                    <Text style={[
                        typography.bodyLarge,
                        {
                            color: colors.textSecondary,
                            marginBottom: spacing.xl,
                        }
                    ]}>
                        {t('onboarding.v3.motivation.subtitle')}
                    </Text>
                </Animated.View>

                <View style={styles.optionsContainer}>
                    {motivationOptions.map((option, index) => (
                        <Animated.View
                            key={option.id}
                            entering={FadeInRight.duration(600).delay(200 + index * 100)}
                        >
                            <SelectionCard
                                title={t(`onboarding.v3.motivation.options.${option.id}.title`)}
                                subtitle={t(`onboarding.v3.motivation.options.${option.id}.description`)}
                                icon={option.icon}
                                selected={selectedMotivation === option.id}
                                onPress={() => setSelectedMotivation(option.id)}
                            />
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            <Animated.View
                entering={FadeInUp.duration(600).delay(800)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    disabled={!selectedMotivation}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={8} currentStep={2} />
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
        paddingBottom: 24,
    },
    optionsContainer: {
        gap: 12,
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
