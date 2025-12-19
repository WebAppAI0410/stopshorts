import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import {
    Button,
    ProgressIndicator,
    Header,
    GlowOrb,
    SelectionCard,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { PurposeDetails } from '../../src/types';

type TimePickerMode = 'bedtime' | 'wakeTime' | null;

export default function PurposeDetailScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { purpose, setPurposeDetails, setSleepProfile } = useAppStore();

    // Sleep purpose states
    const [bedtime, setBedtime] = useState(new Date(2024, 0, 1, 23, 0));
    const [wakeTime, setWakeTime] = useState(new Date(2024, 0, 1, 7, 0));
    const [showTimePicker, setShowTimePicker] = useState<TimePickerMode>(null);

    // Study purpose states
    const [studyGoal, setStudyGoal] = useState<'exam' | 'certification' | 'self_study' | 'language' | null>(null);
    const [studySchedule, setStudySchedule] = useState<'morning' | 'afternoon' | 'evening' | 'night' | null>(null);

    // Work purpose states
    const [workStyle, setWorkStyle] = useState<'office' | 'remote' | 'hybrid' | 'freelance' | null>(null);

    // Creative purpose states
    const [creativeField, setCreativeField] = useState<'writing' | 'art' | 'music' | 'video' | 'coding' | 'other' | null>(null);

    // Mental purpose states
    const [concernTimes, setConcernTimes] = useState<'morning' | 'afternoon' | 'evening' | 'night' | 'random' | null>(null);
    const [stressLevel, setStressLevel] = useState<1 | 2 | 3 | 4 | 5>(3);

    const handleContinue = () => {
        const details: PurposeDetails = {};

        switch (purpose) {
            case 'sleep':
                const bedtimeStr = `${bedtime.getHours().toString().padStart(2, '0')}:${bedtime.getMinutes().toString().padStart(2, '0')}`;
                const wakeTimeStr = `${wakeTime.getHours().toString().padStart(2, '0')}:${wakeTime.getMinutes().toString().padStart(2, '0')}`;
                details.targetBedtime = bedtimeStr;
                details.targetWakeTime = wakeTimeStr;
                setSleepProfile({ bedtime: bedtimeStr, wakeTime: wakeTimeStr });
                break;
            case 'study':
                if (studyGoal) details.studyGoal = studyGoal;
                if (studySchedule) details.studySchedule = studySchedule;
                break;
            case 'work':
                if (workStyle) details.workStyle = workStyle;
                break;
            case 'creative':
                if (creativeField) details.creativeField = creativeField;
                break;
            case 'mental':
                if (concernTimes) details.concernTimes = concernTimes;
                details.stressLevel = stressLevel;
                break;
        }

        setPurposeDetails(details);
        router.push('/(onboarding)/goal-setting' as Href);
    };

    const formatTime = (date: Date) => {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const renderSleepQuestions = () => (
        <>
            <Animated.View
                entering={FadeInUp.duration(500).delay(300)}
                style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
            >
                <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                    {t('onboarding.purposeDetail.sleep.bedtimeQuestion')}
                </Text>
                <TouchableOpacity
                    style={[styles.timeButton, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                    onPress={() => setShowTimePicker('bedtime')}
                >
                    <Ionicons name="moon-outline" size={24} color={colors.accent} />
                    <Text style={[typography.statLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                        {formatTime(bedtime)}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View
                entering={FadeInUp.duration(500).delay(400)}
                style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
            >
                <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                    {t('onboarding.purposeDetail.sleep.wakeTimeQuestion')}
                </Text>
                <TouchableOpacity
                    style={[styles.timeButton, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                    onPress={() => setShowTimePicker('wakeTime')}
                >
                    <Ionicons name="sunny-outline" size={24} color={colors.accent} />
                    <Text style={[typography.statLarge, { color: colors.textPrimary, marginLeft: spacing.md }]}>
                        {formatTime(wakeTime)}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {showTimePicker && (
                <DateTimePicker
                    value={showTimePicker === 'bedtime' ? bedtime : wakeTime}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    onChange={(event, date) => {
                        setShowTimePicker(null);
                        if (date) {
                            if (showTimePicker === 'bedtime') {
                                setBedtime(date);
                            } else {
                                setWakeTime(date);
                            }
                        }
                    }}
                />
            )}

            <Animated.View
                entering={FadeInUp.duration(500).delay(500)}
                style={[styles.tipCard, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.lg }]}
            >
                <Ionicons name="bulb-outline" size={20} color={colors.accent} />
                <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
                    {t('onboarding.purposeDetail.sleep.tip')}
                </Text>
            </Animated.View>
        </>
    );

    const renderStudyQuestions = () => (
        <>
            <Animated.View
                entering={FadeInUp.duration(500).delay(300)}
                style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
            >
                <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                    {t('onboarding.purposeDetail.study.goalQuestion')}
                </Text>
                <View style={styles.optionsGrid}>
                    {[
                        { id: 'exam', icon: 'school-outline' },
                        { id: 'certification', icon: 'ribbon-outline' },
                        { id: 'self_study', icon: 'book-outline' },
                        { id: 'language', icon: 'language-outline' },
                    ].map((option) => (
                        <SelectionCard
                            key={option.id}
                            title={t(`onboarding.purposeDetail.study.goals.${option.id}`)}
                            selected={studyGoal === option.id}
                            onPress={() => setStudyGoal(option.id as any)}
                            icon={option.icon as any}
                            compact
                        />
                    ))}
                </View>
            </Animated.View>

            <Animated.View
                entering={FadeInUp.duration(500).delay(400)}
                style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
            >
                <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                    {t('onboarding.purposeDetail.study.scheduleQuestion')}
                </Text>
                <View style={styles.optionsRow}>
                    {['morning', 'afternoon', 'evening', 'night'].map((time) => (
                        <Button
                            key={time}
                            title={t(`onboarding.purposeDetail.timeOfDay.${time}`)}
                            onPress={() => setStudySchedule(time as any)}
                            variant={studySchedule === time ? 'primary' : 'outline'}
                            size="sm"
                        />
                    ))}
                </View>
            </Animated.View>
        </>
    );

    const renderWorkQuestions = () => (
        <Animated.View
            entering={FadeInUp.duration(500).delay(300)}
            style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
        >
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                {t('onboarding.purposeDetail.work.styleQuestion')}
            </Text>
            <View style={styles.optionsGrid}>
                {[
                    { id: 'office', icon: 'business-outline' },
                    { id: 'remote', icon: 'home-outline' },
                    { id: 'hybrid', icon: 'git-merge-outline' },
                    { id: 'freelance', icon: 'cafe-outline' },
                ].map((option) => (
                    <SelectionCard
                        key={option.id}
                        title={t(`onboarding.purposeDetail.work.styles.${option.id}`)}
                        selected={workStyle === option.id}
                        onPress={() => setWorkStyle(option.id as any)}
                        icon={option.icon as any}
                        compact
                    />
                ))}
            </View>
        </Animated.View>
    );

    const renderCreativeQuestions = () => (
        <Animated.View
            entering={FadeInUp.duration(500).delay(300)}
            style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
        >
            <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                {t('onboarding.purposeDetail.creative.fieldQuestion')}
            </Text>
            <View style={styles.optionsGrid}>
                {[
                    { id: 'writing', icon: 'create-outline' },
                    { id: 'art', icon: 'color-palette-outline' },
                    { id: 'music', icon: 'musical-notes-outline' },
                    { id: 'video', icon: 'videocam-outline' },
                    { id: 'coding', icon: 'code-slash-outline' },
                    { id: 'other', icon: 'sparkles-outline' },
                ].map((option) => (
                    <SelectionCard
                        key={option.id}
                        title={t(`onboarding.purposeDetail.creative.fields.${option.id}`)}
                        selected={creativeField === option.id}
                        onPress={() => setCreativeField(option.id as any)}
                        icon={option.icon as any}
                        compact
                    />
                ))}
            </View>
        </Animated.View>
    );

    const renderMentalQuestions = () => (
        <>
            <Animated.View
                entering={FadeInUp.duration(500).delay(300)}
                style={[styles.questionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}
            >
                <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
                    {t('onboarding.purposeDetail.mental.concernTimesQuestion')}
                </Text>
                <View style={styles.optionsRow}>
                    {['morning', 'afternoon', 'evening', 'night', 'random'].map((time) => (
                        <Button
                            key={time}
                            title={t(`onboarding.purposeDetail.timeOfDay.${time}`)}
                            onPress={() => setConcernTimes(time as any)}
                            variant={concernTimes === time ? 'primary' : 'outline'}
                            size="sm"
                        />
                    ))}
                </View>
            </Animated.View>

            <Animated.View
                entering={FadeInUp.duration(500).delay(400)}
                style={[styles.tipCard, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.lg }]}
            >
                <Ionicons name="heart-outline" size={20} color={colors.accent} />
                <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
                    {t('onboarding.purposeDetail.mental.tip')}
                </Text>
            </Animated.View>
        </>
    );

    const renderQuestionsForPurpose = () => {
        switch (purpose) {
            case 'sleep':
                return renderSleepQuestions();
            case 'study':
                return renderStudyQuestions();
            case 'work':
                return renderWorkQuestions();
            case 'creative':
                return renderCreativeQuestions();
            case 'mental':
                return renderMentalQuestions();
            default:
                return null;
        }
    };

    const getPurposeTitle = () => {
        switch (purpose) {
            case 'sleep':
                return t('onboarding.purposeDetail.sleep.title');
            case 'study':
                return t('onboarding.purposeDetail.study.title');
            case 'work':
                return t('onboarding.purposeDetail.work.title');
            case 'creative':
                return t('onboarding.purposeDetail.creative.title');
            case 'mental':
                return t('onboarding.purposeDetail.mental.title');
            default:
                return '';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />
            <GlowOrb position="top-right" size="large" color="accent" intensity={0.08} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {getPurposeTitle()}
                    </Text>
                    <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.purposeDetail.subtitle')}
                    </Text>
                </Animated.View>

                {renderQuestionsForPurpose()}
            </ScrollView>

            <Animated.View
                entering={FadeInUp.duration(600).delay(600)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={5} />
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
    optionsGrid: {
        gap: 12,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 2,
    },
    tipCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        marginTop: 8,
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 40,
    },
});
