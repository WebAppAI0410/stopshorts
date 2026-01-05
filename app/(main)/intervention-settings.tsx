import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { useAIStore } from '../../src/stores/useAIStore';
import { Button, SelectionCard } from '../../src/components/ui';
import { screenTimeService } from '../../src/native/ScreenTimeModule';
import { t } from '../../src/i18n';
import type { InterventionTiming, InterventionDelayMinutes, InterventionType } from '../../src/types';
import { useSettingsBack } from '../../src/hooks/useSettingsBack';

export default function InterventionSettingsScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const router = useRouter();
    const {
        interventionSettings,
        setInterventionSettings,
        selectedInterventionType,
        setSelectedInterventionType,
    } = useAppStore();
    const modelStatus = useAIStore((state) => state.modelStatus);

    // AI option requires model to be downloaded
    const isAIModelReady = modelStatus === 'ready';

    const [timing, setTiming] = useState<InterventionTiming>(interventionSettings.timing);
    const [delayMinutes, setDelayMinutes] = useState<InterventionDelayMinutes>(interventionSettings.delayMinutes);
    const [interventionType, setInterventionType] = useState<InterventionType>(selectedInterventionType);
    const [isSaving, setIsSaving] = useState(false);
    const handleBack = useSettingsBack();

    const isAndroid = Platform.OS === 'android';

    // Navigate to AI Coach to download model
    const handleGoToAICoach = () => {
        router.push('/(main)/ai');
    };

    const shortcutOptions: { key: string; labelKey: string }[] = [
        { key: 'tiktok', labelKey: 'intervention.settings.shortcuts.apps.tiktok' },
        { key: 'youtube', labelKey: 'intervention.settings.shortcuts.apps.youtube' },
        { key: 'instagram', labelKey: 'intervention.settings.shortcuts.apps.instagram' },
        { key: 'custom', labelKey: 'intervention.settings.shortcuts.apps.custom' },
    ];

    const handleShortcutPress = (key: string) => {
        const appLabel = t(`intervention.settings.shortcuts.apps.${key}`);
        Alert.alert(
            t('intervention.settings.shortcuts.alertTitle'),
            t('intervention.settings.shortcuts.alertMessage', { app: appLabel }),
            [{ text: t('common.confirm') }]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update store
            setInterventionSettings({ timing, delayMinutes });
            setSelectedInterventionType(interventionType);

            // Sync to native on Android
            if (isAndroid) {
                await screenTimeService.setInterventionSettings(timing, delayMinutes);
            }

            handleBack();
        } catch (error) {
            if (__DEV__) {
                console.error('[InterventionSettings] Failed to save:', error);
            }
            Alert.alert(
                t('intervention.settings.saveError.title'),
                t('intervention.settings.saveError.message'),
                [{ text: t('common.confirm') }]
            );
        } finally {
            setIsSaving(false);
        }
    };

    const delayOptions: { value: InterventionDelayMinutes }[] = [
        { value: 5 },
        { value: 10 },
        { value: 15 },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingTop: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
                    <View style={styles.headerRow}>
                        <Pressable onPress={handleBack} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </Pressable>
                        <Text style={[typography.h2, { color: colors.textPrimary }]}>
                            {t('intervention.settings.title')}
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                </Animated.View>

                {/* Description */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
                        {t('intervention.settings.description')}
                        {!isAndroid && '\n\n' + t('intervention.settings.iosNote')}
                    </Text>
                </Animated.View>

                {/* Intervention Type Selection */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                        {t('intervention.settings.types.title')}
                    </Text>

                    <SelectionCard
                        title={t('intervention.settings.types.breathing.title')}
                        subtitle={t('intervention.settings.types.breathing.description')}
                        selected={interventionType === 'breathing'}
                        onPress={() => setInterventionType('breathing')}
                        icon="leaf"
                    />

                    <SelectionCard
                        title={t('intervention.settings.types.friction.title')}
                        subtitle={t('intervention.settings.types.friction.description')}
                        selected={interventionType === 'friction'}
                        onPress={() => setInterventionType('friction')}
                        icon="time"
                    />

                    <SelectionCard
                        title={t('intervention.settings.types.mirror.title')}
                        subtitle={t('intervention.settings.types.mirror.description')}
                        selected={interventionType === 'mirror'}
                        onPress={() => setInterventionType('mirror')}
                        icon="person"
                    />

                    <View style={{ opacity: isAIModelReady ? 1 : 0.5 }}>
                        <SelectionCard
                            title={t('intervention.settings.types.ai.title')}
                            subtitle={t('intervention.settings.types.ai.description')}
                            selected={interventionType === 'ai'}
                            onPress={() => isAIModelReady && setInterventionType('ai')}
                            icon="sparkles"
                        />
                    </View>
                    {!isAIModelReady && (
                        <Pressable
                            onPress={handleGoToAICoach}
                            style={({ pressed }) => [
                                styles.downloadBadge,
                                {
                                    backgroundColor: colors.primary,
                                    borderRadius: borderRadius.sm,
                                    opacity: pressed ? 0.8 : 1,
                                },
                            ]}
                        >
                            <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                            <Text style={[typography.caption, { color: '#FFFFFF', marginLeft: 4 }]}>
                                {t('ai.downloadOnAICoach')}
                            </Text>
                        </Pressable>
                    )}
                </Animated.View>

                {/* Timing Selection */}
                <Animated.View entering={FadeInDown.duration(600).delay(300)} style={{ marginTop: spacing.lg }}>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                        {t('intervention.settings.timing.title')}
                    </Text>

                    <SelectionCard
                        title={t('intervention.settings.timing.immediate.title')}
                        subtitle={t('intervention.settings.timing.immediate.description')}
                        selected={timing === 'immediate'}
                        onPress={() => setTiming('immediate')}
                        icon="flash"
                    />

                    <SelectionCard
                        title={t('intervention.settings.timing.delayed.title')}
                        subtitle={t('intervention.settings.timing.delayed.description', { minutes: delayMinutes })}
                        selected={timing === 'delayed'}
                        onPress={() => {
                            if (isAndroid) setTiming('delayed');
                        }}
                        icon="timer"
                    />

                    {!isAndroid && timing === 'delayed' && (
                        <View style={[styles.warningBanner, { backgroundColor: colors.warning + '20', borderRadius: borderRadius.lg }]}>
                            <Ionicons name="warning" size={18} color={colors.warning} />
                            <Text style={[typography.caption, { color: colors.warning, marginLeft: spacing.sm, flex: 1 }]}>
                                {t('intervention.settings.timing.iosWarning')}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Delay Time Selection (Only for delayed mode on Android) */}
                {timing === 'delayed' && isAndroid && (
                    <Animated.View entering={FadeInDown.duration(600).delay(400)} style={{ marginTop: spacing.lg }}>
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                            {t('intervention.settings.threshold.title')}
                        </Text>

                        <View style={styles.delayOptionsRow}>
                            {delayOptions.map((option) => (
                                <View key={option.value} style={styles.delayOption}>
                                    <SelectionCard
                                        title={t('intervention.settings.delay.minutes', { value: option.value })}
                                        selected={delayMinutes === option.value}
                                        onPress={() => setDelayMinutes(option.value)}
                                        compact
                                    />
                                </View>
                            ))}
                        </View>

                        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
                            {t('intervention.settings.threshold.note')}
                        </Text>
                    </Animated.View>
                )}

                {/* iOS Shortcuts Section */}
                {!isAndroid && (
                    <Animated.View entering={FadeInDown.duration(600).delay(400)} style={{ marginTop: spacing.xl }}>
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                            {t('intervention.settings.shortcuts.title')}
                        </Text>

                        <View style={[styles.notificationCard, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.xl, borderColor: colors.border, borderWidth: 1 }]}>
                            <View style={styles.notificationRow}>
                                <View style={styles.notificationInfo}>
                                    <Ionicons name="notifications" size={24} color={colors.accent} />
                                    <View style={{ marginLeft: spacing.md }}>
                                        <Text style={[typography.body, { color: colors.textPrimary }]}>
                                            {t('intervention.settings.shortcuts.instant.title')}
                                        </Text>
                                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                            {t('intervention.settings.shortcuts.instant.description')}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                            {t('intervention.settings.shortcuts.note')}
                        </Text>

                        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
                            {shortcutOptions.map((option) => (
                                <SelectionCard
                                    key={option.key}
                                    title={t('intervention.settings.shortcuts.addButton', { app: t(option.labelKey) })}
                                    selected={false}
                                    onPress={() => handleShortcutPress(option.key)}
                                    compact
                                />
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* How it works */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(500)}
                    style={[
                        styles.infoCard,
                        {
                            backgroundColor: colors.primary + '10',
                            borderRadius: borderRadius.xl,
                            marginTop: spacing.xl,
                        },
                    ]}
                >
                    <Text style={[typography.label, { color: colors.primary, marginBottom: spacing.sm }]}>
                        {t('intervention.settings.howItWorks.title')}
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                        {interventionType === 'friction'
                            ? t('intervention.settings.howItWorks.friction')
                            : interventionType === 'mirror'
                                ? t('intervention.settings.howItWorks.mirror')
                                : timing === 'immediate'
                                    ? t('intervention.settings.howItWorks.breathingImmediate')
                                    : t('intervention.settings.howItWorks.breathingDelayed', { minutes: delayMinutes })}
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Save Button */}
            <Animated.View
                entering={FadeInDown.duration(600).delay(600)}
                style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
            >
                <Button
                    title={isSaving ? t('intervention.settings.saving') : t('common.save')}
                    onPress={handleSave}
                    disabled={isSaving}
                    style={{ width: '100%' }}
                />
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
    header: {
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    delayOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    delayOption: {
        flex: 1,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    notificationCard: {
        padding: 16,
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    notificationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    infoCard: {
        padding: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
    },
    downloadBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
});
