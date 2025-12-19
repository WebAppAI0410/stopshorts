import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';
import { useAppStore } from '../../src/stores/useAppStore';

type GoalOption = {
    id: 'concentration' | 'sleep' | 'time' | 'mental';
    icon: keyof typeof Ionicons.glyphMap;
};

const goalOptions: GoalOption[] = [
    { id: 'concentration', icon: 'locate-outline' },
    { id: 'sleep', icon: 'moon-outline' },
    { id: 'time', icon: 'time-outline' },
    { id: 'mental', icon: 'leaf-outline' },
];

export default function GoalScreen() {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();
    const { setGoal } = useAppStore();
    const [selectedGoal, setSelectedGoal] = useState<GoalOption['id'] | null>(null);

    const handleContinue = () => {
        if (!selectedGoal) return;
        setGoal(selectedGoal);
        // Navigate to the next screen according to the onboarding flow
        // Step 3 (Goal) → Step 4 (Screen Time Permission)
        router.push('/(onboarding)/screentime-permission' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header showBack />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Title and Subtitle */}
                <Animated.View entering={FadeInUp.duration(600).delay(100)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            marginBottom: spacing.sm,
                        }
                    ]}>
                        {t('onboarding.v3.goal.title')}
                    </Text>
                    <Text style={[
                        typography.bodyLarge,
                        {
                            color: colors.textSecondary,
                            marginBottom: spacing.xl,
                        }
                    ]}>
                        {t('onboarding.v3.goal.subtitle')}
                    </Text>
                </Animated.View>

                {/* Goal Options */}
                <View style={styles.optionsContainer}>
                    {goalOptions.map((option, index) => (
                        <Animated.View
                            key={option.id}
                            entering={FadeInRight.duration(600).delay(200 + index * 100)}
                        >
                            <SelectionCard
                                title={t(`onboarding.v3.goal.options.${option.id}.title`)}
                                subtitle={t(`onboarding.v3.goal.options.${option.id}.description`)}
                                icon={option.icon}
                                selected={selectedGoal === option.id}
                                onPress={() => setSelectedGoal(option.id)}
                            />
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <Animated.View
                entering={FadeInUp.duration(600).delay(800)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    disabled={!selectedGoal}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={10} currentStep={3} />
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
