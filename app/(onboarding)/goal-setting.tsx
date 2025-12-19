import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
    Button,
    ProgressIndicator,
    Header,
    SelectionCard,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import type { AlternativeActivity, AlternativeGoal } from '../../src/types';

const ACTIVITY_OPTIONS: { id: AlternativeActivity; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'reading', icon: 'book-outline' },
    { id: 'exercise', icon: 'fitness-outline' },
    { id: 'meditation', icon: 'leaf-outline' },
    { id: 'learning', icon: 'school-outline' },
    { id: 'hobby', icon: 'color-palette-outline' },
    { id: 'social', icon: 'people-outline' },
    { id: 'sleep', icon: 'moon-outline' },
    { id: 'work', icon: 'briefcase-outline' },
    { id: 'custom', icon: 'create-outline' },
];

const WEEKLY_TARGETS = [
    { hours: 1, label: '1時間' },
    { hours: 3, label: '3時間' },
    { hours: 5, label: '5時間' },
    { hours: 7, label: '7時間' },
    { hours: 10, label: '10時間以上' },
];

export default function GoalSettingScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setAlternativeGoals, usageAssessment } = useAppStore();

    const [selectedActivity, setSelectedActivity] = useState<AlternativeActivity | null>(null);
    const [customActivity, setCustomActivity] = useState('');
    const [weeklyTarget, setWeeklyTarget] = useState<number | null>(null);
    const [specificGoal, setSpecificGoal] = useState('');

    // Suggest weekly target based on usage assessment
    const suggestedHours = usageAssessment
        ? Math.round(usageAssessment.dailyUsageHours * 7 * 0.5) // 50% of current usage
        : 5;

    const canContinue = selectedActivity !== null &&
        (selectedActivity !== 'custom' || customActivity.trim().length > 0) &&
        weeklyTarget !== null;

    const handleContinue = () => {
        if (!selectedActivity || weeklyTarget === null) return;

        const goal: AlternativeGoal = {
            activity: selectedActivity,
            customActivity: selectedActivity === 'custom' ? customActivity : undefined,
            weeklyTargetMinutes: weeklyTarget * 60,
            specificGoal: specificGoal.trim() || undefined,
        };

        setAlternativeGoals([goal]);
        router.push('/(onboarding)/app-selection' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {t('onboarding.goalSetting.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.goalSetting.subtitle')}
                    </Text>
                </Animated.View>

                {/* Activity selection */}
                <View style={styles.activityGrid}>
                    {ACTIVITY_OPTIONS.map((option, index) => (
                        <Animated.View
                            key={option.id}
                            entering={FadeInRight.duration(300).delay(200 + index * 50)}
                            style={styles.activityItem}
                        >
                            <SelectionCard
                                title={t(`onboarding.goalSetting.activities.${option.id}`)}
                                selected={selectedActivity === option.id}
                                onPress={() => setSelectedActivity(option.id)}
                                icon={option.icon}
                                compact
                            />
                        </Animated.View>
                    ))}
                </View>

                {/* Custom activity input */}
                {selectedActivity === 'custom' && (
                    <Animated.View
                        entering={FadeInUp.duration(300)}
                        style={{ marginTop: spacing.md }}
                    >
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.backgroundCard,
                                    borderColor: colors.border,
                                    color: colors.textPrimary,
                                    borderRadius: borderRadius.md,
                                    padding: spacing.md,
                                    ...typography.body,
                                },
                            ]}
                            placeholder="どんな活動をしたいですか？"
                            placeholderTextColor={colors.textMuted}
                            value={customActivity}
                            onChangeText={setCustomActivity}
                        />
                    </Animated.View>
                )}

                {/* Weekly target */}
                {selectedActivity && (
                    <Animated.View
                        entering={FadeInUp.duration(400).delay(100)}
                        style={{ marginTop: spacing.xl }}
                    >
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                            {t('onboarding.goalSetting.weeklyTargetLabel')}
                        </Text>
                        <View style={styles.targetGrid}>
                            {WEEKLY_TARGETS.map((target, index) => {
                                const isSelected = weeklyTarget === target.hours;
                                const isSuggested = target.hours === suggestedHours ||
                                    (suggestedHours > 10 && target.hours === 10);
                                return (
                                    <Animated.View
                                        key={target.hours}
                                        entering={FadeInRight.duration(300).delay(index * 50)}
                                    >
                                        <Pressable
                                            onPress={() => setWeeklyTarget(target.hours)}
                                            style={[
                                                styles.targetChip,
                                                {
                                                    backgroundColor: isSelected ? colors.accent : colors.backgroundCard,
                                                    borderColor: isSuggested && !isSelected ? colors.accent : colors.border,
                                                    borderRadius: borderRadius.full,
                                                    paddingVertical: spacing.sm,
                                                    paddingHorizontal: spacing.md,
                                                    borderWidth: isSuggested ? 2 : 1,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    typography.body,
                                                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                                                ]}
                                            >
                                                {target.label}
                                            </Text>
                                            {isSuggested && !isSelected && (
                                                <Text style={[typography.caption, { color: colors.accent, marginLeft: 4 }]}>
                                                    おすすめ
                                                </Text>
                                            )}
                                        </Pressable>
                                    </Animated.View>
                                );
                            })}
                        </View>
                    </Animated.View>
                )}

                {/* Specific goal (optional) */}
                {selectedActivity && weeklyTarget && (
                    <Animated.View
                        entering={FadeInUp.duration(400).delay(200)}
                        style={{ marginTop: spacing.xl }}
                    >
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                            {t('onboarding.goalSetting.specificGoalLabel')}
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.backgroundCard,
                                    borderColor: colors.border,
                                    color: colors.textPrimary,
                                    borderRadius: borderRadius.md,
                                    padding: spacing.md,
                                    ...typography.body,
                                },
                            ]}
                            placeholder={t('onboarding.goalSetting.specificGoalPlaceholder')}
                            placeholderTextColor={colors.textMuted}
                            value={specificGoal}
                            onChangeText={setSpecificGoal}
                            multiline
                            numberOfLines={2}
                        />
                    </Animated.View>
                )}
            </ScrollView>

            <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    disabled={!canContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={6} />
                </View>
            </View>
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
    activityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    activityItem: {
        width: '100%',
    },
    input: {
        borderWidth: 1,
    },
    targetGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    targetChip: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        paddingTop: 20,
    },
});
