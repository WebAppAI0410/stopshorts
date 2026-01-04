import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SelectionCard } from '../../src/components/ui';
import { OnboardingScreenTemplate } from '../../src/components/templates';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import type { AlternativeActivity } from '../../src/types';

type ActivityOption = {
    id: AlternativeActivity;
    icon: keyof typeof Ionicons.glyphMap;
};

const activityOptions: ActivityOption[] = [
    { id: 'reading', icon: 'book-outline' },
    { id: 'exercise', icon: 'fitness-outline' },
    { id: 'meditation', icon: 'leaf-outline' },
    { id: 'learning', icon: 'school-outline' },
    { id: 'hobby', icon: 'color-palette-outline' },
    { id: 'social', icon: 'people-outline' },
    { id: 'custom', icon: 'create-outline' },
];

export default function AlternativeScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setAlternativeActivity } = useAppStore();
    const [selectedActivity, setSelectedActivity] = useState<AlternativeActivity | null>(null);
    const [customActivity, setCustomActivity] = useState('');

    const handleContinue = () => {
        if (!selectedActivity) return;
        setAlternativeActivity(selectedActivity, customActivity || undefined);
        router.push('/(onboarding)/intervention-select' as Href);
    };

    const isValid = selectedActivity && (selectedActivity !== 'custom' || customActivity.trim().length > 0);

    return (
        <OnboardingScreenTemplate
            title={t('onboarding.v3.alternative.title')}
            subtitle={t('onboarding.v3.alternative.subtitle')}
            currentStep={7}
            buttonText={t('common.continue')}
            onButtonPress={handleContinue}
            buttonDisabled={!isValid}
            scrollContentPaddingBottom={120}
            titleAnimationDelay={200}
        >
            <View style={styles.optionsContainer}>
                {activityOptions.map((option, index) => (
                    <Animated.View
                        key={option.id}
                        entering={FadeInRight.duration(500).delay(300 + index * 80)}
                    >
                        <SelectionCard
                            title={t(`onboarding.v3.alternative.options.${option.id}`)}
                            icon={option.icon}
                            selected={selectedActivity === option.id}
                            onPress={() => setSelectedActivity(option.id)}
                        />
                    </Animated.View>
                ))}
            </View>

            {selectedActivity === 'custom' && (
                <Animated.View entering={FadeInUp.duration(400)}>
                    <TextInput
                        style={[
                            styles.customInput,
                            {
                                backgroundColor: colors.surface,
                                color: colors.textPrimary,
                                borderColor: colors.border,
                                borderRadius: borderRadius.md,
                                padding: spacing.md,
                            },
                        ]}
                        placeholder={t('onboarding.v3.alternative.customPlaceholder')}
                        placeholderTextColor={colors.textMuted}
                        value={customActivity}
                        onChangeText={setCustomActivity}
                        autoFocus
                        maxLength={50}
                    />
                </Animated.View>
            )}

            {selectedActivity && isValid && (
                <Animated.View
                    entering={FadeInUp.duration(500)}
                    style={[
                        styles.commitmentContainer,
                        {
                            backgroundColor: colors.accentMuted,
                            borderRadius: borderRadius.lg,
                            padding: spacing.lg,
                            marginTop: spacing.xl,
                        }
                    ]}
                >
                    <Ionicons name="heart" size={24} color={colors.accent} />
                    <Text style={[
                        typography.body,
                        {
                            color: colors.textPrimary,
                            flex: 1,
                            marginLeft: spacing.md,
                        }
                    ]}>
                        {t('onboarding.v3.alternative.commitment', {
                            activity: selectedActivity === 'custom'
                                ? customActivity
                                : t(`onboarding.v3.alternative.options.${selectedActivity}`)
                        })}
                    </Text>
                </Animated.View>
            )}
        </OnboardingScreenTemplate>
    );
}

const styles = StyleSheet.create({
    optionsContainer: {
        gap: 12,
    },
    customInput: {
        marginTop: 16,
        borderWidth: 1,
        fontSize: 16,
    },
    commitmentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
