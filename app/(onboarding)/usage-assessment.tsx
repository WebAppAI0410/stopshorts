import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import {
    Button,
    ProgressIndicator,
    Header,
    SelectionCard,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import type { UsageAssessment, QuitAttempts, PeakUsageTime, UsageDuration } from '../../src/types';

type UsageHours = '30min' | '1hour' | '2hours' | '3hours' | '4hours' | '5hours';
type OpenCount = 'few' | 'moderate' | 'often' | 'veryOften';

const USAGE_OPTIONS: { id: UsageHours; hours: number }[] = [
    { id: '30min', hours: 0.5 },
    { id: '1hour', hours: 0.75 },
    { id: '2hours', hours: 1.5 },
    { id: '3hours', hours: 2.5 },
    { id: '4hours', hours: 3.5 },
    { id: '5hours', hours: 5 },
];

const OPEN_COUNT_OPTIONS: { id: OpenCount; count: number }[] = [
    { id: 'few', count: 5 },
    { id: 'moderate', count: 15 },
    { id: 'often', count: 25 },
    { id: 'veryOften', count: 40 },
];

const QUIT_ATTEMPTS_OPTIONS: QuitAttempts[] = ['never', 'once', 'few', 'many'];

const PEAK_TIME_OPTIONS: PeakUsageTime[] = ['morning', 'afternoon', 'evening', 'night', 'random'];

const DURATION_OPTIONS: UsageDuration[] = ['1month', '6months', '1year', '2years', '3years+'];

export default function UsageAssessmentScreen() {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();
    const { setUsageAssessment, calculateLifetimeImpact } = useAppStore();

    const [step, setStep] = useState(0);
    const [dailyUsage, setDailyUsage] = useState<UsageHours | null>(null);
    const [openCount, setOpenCount] = useState<OpenCount | null>(null);
    const [quitAttempts, setQuitAttempts] = useState<QuitAttempts | null>(null);
    const [peakTime, setPeakTime] = useState<PeakUsageTime | null>(null);
    const [duration, setDuration] = useState<UsageDuration | null>(null);

    const canContinue = () => {
        switch (step) {
            case 0: return dailyUsage !== null;
            case 1: return openCount !== null;
            case 2: return quitAttempts !== null;
            case 3: return peakTime !== null;
            case 4: return duration !== null;
            default: return false;
        }
    };

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Save assessment and calculate impact
            const usageHours = USAGE_OPTIONS.find((o) => o.id === dailyUsage)?.hours ?? 2;
            const openCountNum = OPEN_COUNT_OPTIONS.find((o) => o.id === openCount)?.count ?? 15;

            const assessment: UsageAssessment = {
                dailyUsageHours: usageHours,
                dailyOpenCount: openCountNum,
                quitAttempts: quitAttempts!,
                peakUsageTime: peakTime!,
                usageDuration: duration!,
            };

            setUsageAssessment(assessment);
            calculateLifetimeImpact(assessment);
            router.push('/(onboarding)/impact' as Href);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <View>
                        <Text style={[typography.h3, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                            {t('onboarding.usageAssessment.dailyUsageQuestion')}
                        </Text>
                        {USAGE_OPTIONS.map((option, index) => (
                            <Animated.View
                                key={option.id}
                                entering={FadeInRight.duration(300).delay(index * 50)}
                            >
                                <SelectionCard
                                    title={t(`onboarding.usageAssessment.dailyUsageOptions.${option.id}`)}
                                    selected={dailyUsage === option.id}
                                    onPress={() => setDailyUsage(option.id)}
                                    compact
                                />
                            </Animated.View>
                        ))}
                    </View>
                );
            case 1:
                return (
                    <View>
                        <Text style={[typography.h3, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                            {t('onboarding.usageAssessment.openCountQuestion')}
                        </Text>
                        {OPEN_COUNT_OPTIONS.map((option, index) => (
                            <Animated.View
                                key={option.id}
                                entering={FadeInRight.duration(300).delay(index * 50)}
                            >
                                <SelectionCard
                                    title={t(`onboarding.usageAssessment.openCountOptions.${option.id}`)}
                                    selected={openCount === option.id}
                                    onPress={() => setOpenCount(option.id)}
                                    compact
                                />
                            </Animated.View>
                        ))}
                    </View>
                );
            case 2:
                return (
                    <View>
                        <Text style={[typography.h3, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                            {t('onboarding.usageAssessment.quitAttemptsQuestion')}
                        </Text>
                        {QUIT_ATTEMPTS_OPTIONS.map((option, index) => (
                            <Animated.View
                                key={option}
                                entering={FadeInRight.duration(300).delay(index * 50)}
                            >
                                <SelectionCard
                                    title={t(`onboarding.usageAssessment.quitAttemptsOptions.${option}`)}
                                    selected={quitAttempts === option}
                                    onPress={() => setQuitAttempts(option)}
                                    compact
                                />
                            </Animated.View>
                        ))}
                    </View>
                );
            case 3:
                return (
                    <View>
                        <Text style={[typography.h3, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                            {t('onboarding.usageAssessment.peakTimeQuestion')}
                        </Text>
                        {PEAK_TIME_OPTIONS.map((option, index) => (
                            <Animated.View
                                key={option}
                                entering={FadeInRight.duration(300).delay(index * 50)}
                            >
                                <SelectionCard
                                    title={t(`onboarding.usageAssessment.peakTimeOptions.${option}`)}
                                    selected={peakTime === option}
                                    onPress={() => setPeakTime(option)}
                                    compact
                                />
                            </Animated.View>
                        ))}
                    </View>
                );
            case 4:
                return (
                    <View>
                        <Text style={[typography.h3, { color: colors.textSecondary, marginBottom: spacing.md }]}>
                            {t('onboarding.usageAssessment.durationQuestion')}
                        </Text>
                        {DURATION_OPTIONS.map((option, index) => (
                            <Animated.View
                                key={option}
                                entering={FadeInRight.duration(300).delay(index * 50)}
                            >
                                <SelectionCard
                                    title={t(`onboarding.usageAssessment.durationOptions.${option}`)}
                                    selected={duration === option}
                                    onPress={() => setDuration(option)}
                                    compact
                                />
                            </Animated.View>
                        ))}
                    </View>
                );
            default:
                return null;
        }
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
                        {t('onboarding.usageAssessment.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.usageAssessment.subtitle')}
                    </Text>
                </Animated.View>

                {/* Step indicator */}
                <View style={[styles.stepIndicator, { marginBottom: spacing.lg }]}>
                    {[0, 1, 2, 3, 4].map((s) => (
                        <View
                            key={s}
                            style={[
                                styles.stepDot,
                                {
                                    backgroundColor: s <= step ? colors.accent : colors.border,
                                    marginRight: s < 4 ? spacing.sm : 0,
                                },
                            ]}
                        />
                    ))}
                </View>

                {renderStep()}
            </ScrollView>

            <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                <Button
                    title={step < 4 ? t('common.next') : t('common.continue')}
                    onPress={handleNext}
                    disabled={!canContinue()}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={2} />
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
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    stepDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    footer: {
        paddingTop: 20,
    },
});
