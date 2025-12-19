import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import {
    Button,
    ProgressIndicator,
    Header,
    GlowOrb,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { AddictionLevel, AddictionAssessment } from '../../src/types';

const VIEWING_HOURS_OPTIONS = [
    { value: 0.5, label: '30分未満' },
    { value: 1, label: '約1時間' },
    { value: 2, label: '約2時間' },
    { value: 3, label: '約3時間' },
    { value: 5, label: '3時間以上' },
];

const OPEN_COUNT_OPTIONS = [
    { value: 5, label: '5回以下' },
    { value: 10, label: '約10回' },
    { value: 20, label: '約20回' },
    { value: 30, label: '約30回' },
    { value: 50, label: '30回以上' },
];

function calculateAddictionLevel(
    hours: number,
    openCount: number,
    difficulty: number
): AddictionLevel {
    const score = (hours / 5) * 30 + (openCount / 50) * 30 + (difficulty / 5) * 40;
    if (score < 25) return 'light';
    if (score < 50) return 'moderate';
    if (score < 75) return 'heavy';
    return 'severe';
}

function getLevelDescription(level: AddictionLevel): string {
    switch (level) {
        case 'light':
            return '軽度 - 比較的コントロールできています';
        case 'moderate':
            return '中程度 - 少し注意が必要です';
        case 'heavy':
            return '重度 - しっかりサポートします';
        case 'severe':
            return '深刻 - 一緒に取り組みましょう';
    }
}

export default function AssessmentScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setAddictionAssessment, purpose } = useAppStore();

    const [viewingHours, setViewingHours] = useState(2);
    const [openCount, setOpenCount] = useState(20);
    const [difficulty, setDifficulty] = useState<1 | 2 | 3 | 4 | 5>(3);

    const calculatedLevel = calculateAddictionLevel(viewingHours, openCount, difficulty);

    const handleContinue = () => {
        const assessment: AddictionAssessment = {
            dailyViewingHours: viewingHours,
            dailyOpenCount: openCount,
            difficultyLevel: difficulty,
            calculatedLevel,
        };
        setAddictionAssessment(assessment);
        router.push('/(onboarding)/purpose-detail' as Href);
    };

    const getDifficultyLabel = (value: number) => {
        switch (value) {
            case 1: return '簡単';
            case 2: return 'やや簡単';
            case 3: return '普通';
            case 4: return 'やや難しい';
            case 5: return '非常に難しい';
            default: return '普通';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />
            <GlowOrb position="top-right" size="large" color="primary" intensity={0.08} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {t('onboarding.assessment.title')}
                    </Text>
                    <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.assessment.subtitle')}
                    </Text>
                </Animated.View>

                {/* Question 1: Daily viewing time */}
                <Animated.View
                    entering={FadeInUp.duration(500).delay(300)}
                    style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
                >
                    <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                        {t('onboarding.assessment.question1Label')}
                    </Text>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                        {t('onboarding.assessment.question1')}
                    </Text>
                    <View style={styles.optionsRow}>
                        {VIEWING_HOURS_OPTIONS.map((option) => (
                            <Animated.View key={option.value} style={styles.optionWrapper}>
                                <Button
                                    title={option.label}
                                    onPress={() => setViewingHours(option.value)}
                                    variant={viewingHours === option.value ? 'primary' : 'outline'}
                                    size="sm"
                                />
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Question 2: Daily open count */}
                <Animated.View
                    entering={FadeInUp.duration(500).delay(400)}
                    style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
                >
                    <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                        {t('onboarding.assessment.question2Label')}
                    </Text>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                        {t('onboarding.assessment.question2')}
                    </Text>
                    <View style={styles.optionsRow}>
                        {OPEN_COUNT_OPTIONS.map((option) => (
                            <Animated.View key={option.value} style={styles.optionWrapper}>
                                <Button
                                    title={option.label}
                                    onPress={() => setOpenCount(option.value)}
                                    variant={openCount === option.value ? 'primary' : 'outline'}
                                    size="sm"
                                />
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Question 3: Difficulty level */}
                <Animated.View
                    entering={FadeInUp.duration(500).delay(500)}
                    style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
                >
                    <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                        {t('onboarding.assessment.question3Label')}
                    </Text>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                        {t('onboarding.assessment.question3')}
                    </Text>
                    <View style={styles.sliderContainer}>
                        <Slider
                            style={styles.slider}
                            minimumValue={1}
                            maximumValue={5}
                            step={1}
                            value={difficulty}
                            onValueChange={(value) => setDifficulty(value as 1 | 2 | 3 | 4 | 5)}
                            minimumTrackTintColor={colors.accent}
                            maximumTrackTintColor={colors.border}
                            thumbTintColor={colors.accent}
                        />
                        <View style={styles.sliderLabels}>
                            <Text style={[typography.caption, { color: colors.textMuted }]}>簡単</Text>
                            <Text style={[typography.body, { color: colors.accent, fontWeight: '600' }]}>
                                {getDifficultyLabel(difficulty)}
                            </Text>
                            <Text style={[typography.caption, { color: colors.textMuted }]}>難しい</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Assessment Result Preview */}
                <Animated.View
                    entering={FadeInUp.duration(500).delay(600)}
                    style={[styles.resultCard, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.lg }]}
                >
                    <Text style={[typography.label, { color: colors.accent, marginBottom: spacing.sm }]}>
                        {t('onboarding.assessment.resultLabel')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textPrimary }]}>
                        {getLevelDescription(calculatedLevel)}
                    </Text>
                </Animated.View>
            </ScrollView>

            <Animated.View
                entering={FadeInUp.duration(600).delay(700)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={7} currentStep={3} />
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
    questionCard: {
        padding: 20,
        marginBottom: 16,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    optionWrapper: {
        marginBottom: 4,
    },
    sliderContainer: {
        paddingHorizontal: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    resultCard: {
        padding: 20,
        marginTop: 8,
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 40,
    },
});
