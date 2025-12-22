import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, SelectionCard } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import type { IfThenAction, IfThenPlan } from '../../src/types';

type ActionOption = {
    id: IfThenAction;
    icon: keyof typeof Ionicons.glyphMap;
};

const actionOptions: ActionOption[] = [
    { id: 'breathe', icon: 'leaf-outline' },
    { id: 'read_page', icon: 'book-outline' },
    { id: 'look_outside', icon: 'eye-outline' },
    { id: 'short_walk', icon: 'walk-outline' },
    { id: 'stretch', icon: 'body-outline' },
    { id: 'water', icon: 'water-outline' },
    { id: 'custom', icon: 'create-outline' },
];

export default function IfThenScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setIfThenPlan } = useAppStore();
    const [selectedAction, setSelectedAction] = useState<IfThenAction | null>(null);
    const [customAction, setCustomAction] = useState('');

    const handleContinue = () => {
        if (!selectedAction) return;

        const plan: IfThenPlan = {
            action: selectedAction,
            customAction: selectedAction === 'custom' ? customAction : undefined,
        };

        setIfThenPlan(plan);
        router.push('/(onboarding)/how-it-works' as Href);
    };

    const canContinue = selectedAction && (selectedAction !== 'custom' || customAction.trim().length > 0);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header showBack />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                    <Text style={[
                        typography.h1,
                        {
                            color: colors.textPrimary,
                            marginBottom: spacing.sm,
                        }
                    ]}>
                        {t('onboarding.v3.ifThen.title')}
                    </Text>
                    <Text style={[
                        typography.bodyLarge,
                        {
                            color: colors.textSecondary,
                            marginBottom: spacing.xl,
                        }
                    ]}>
                        {t('onboarding.v3.ifThen.subtitle')}
                    </Text>
                </Animated.View>

                <View style={styles.optionsContainer}>
                    {actionOptions.map((option, index) => (
                        <Animated.View
                            key={option.id}
                            entering={FadeInRight.duration(500).delay(300 + index * 80)}
                        >
                            <SelectionCard
                                title={t(`onboarding.v3.ifThen.options.${option.id}`)}
                                icon={option.icon}
                                selected={selectedAction === option.id}
                                onPress={() => setSelectedAction(option.id)}
                            />
                        </Animated.View>
                    ))}
                </View>

                {selectedAction === 'custom' && (
                    <Animated.View entering={FadeInUp.duration(400)} style={{ marginTop: spacing.md }}>
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
                            placeholder={t('onboarding.v3.ifThen.customPlaceholder')}
                            placeholderTextColor={colors.textMuted}
                            value={customAction}
                            onChangeText={setCustomAction}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </Animated.View>
                )}

                <Animated.View
                    entering={FadeInUp.duration(600).delay(800)}
                    style={[
                        styles.noteContainer,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.md,
                            padding: spacing.md,
                            marginTop: spacing.xl,
                        }
                    ]}
                >
                    <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
                    <Text style={[
                        typography.bodySmall,
                        {
                            color: colors.textMuted,
                            flex: 1,
                            marginLeft: spacing.sm,
                        }
                    ]}>
                        {t('onboarding.v3.ifThen.note')}
                    </Text>
                </Animated.View>
            </ScrollView>

            <Animated.View
                entering={FadeInUp.duration(600).delay(900)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    disabled={!canContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={11} currentStep={8} />
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
    customInput: {
        borderWidth: 1,
        fontSize: 16,
        minHeight: 100,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
