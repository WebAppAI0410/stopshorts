import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';

interface SettingRowProps {
    label: string;
    value?: string;
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
    borderColor: string;
    backgroundColor: string;
    textPrimaryColor: string;
    textSecondaryColor: string;
    textMutedColor: string;
    bodyStyle: TextStyle;
}

function SettingRow({
    label,
    value,
    onPress,
    icon,
    borderColor,
    backgroundColor,
    textPrimaryColor,
    textSecondaryColor,
    textMutedColor,
    bodyStyle,
}: SettingRowProps) {
    return (
        <TouchableOpacity
            style={[styles.row, { borderBottomColor: borderColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor }]}>
                    <Ionicons name={icon} size={20} color={textPrimaryColor} />
                </View>
                <Text style={[bodyStyle, { color: textPrimaryColor }]}>{label}</Text>
            </View>
            <View style={styles.rowRight}>
                <Text style={[bodyStyle, { color: textSecondaryColor, marginRight: 8 }]}>{value}</Text>
                <Ionicons name="chevron-forward" size={16} color={textMutedColor} />
            </View>
        </TouchableOpacity>
    );
}

export default function SettingsScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius, themeMode } = useTheme();
    const { reset, urgeSurfingDurationSeconds, goal, alternativeActivity, customAlternativeActivity, ifThenPlan, selectedApps, customApps, interventionSettings } = useAppStore();
    const selectedCustomCount = customApps.filter((app) => app.isSelected !== false).length;
    const interventionLabel = interventionSettings.timing === 'immediate'
        ? '即時'
        : `遅延 ${interventionSettings.delayMinutes}分`;

    // Display custom text if available, otherwise show the translated option
    const getAlternativeLabel = () => {
        if (!alternativeActivity) return '-';
        if (alternativeActivity === 'custom' && customAlternativeActivity) {
            return customAlternativeActivity;
        }
        return t(`onboarding.v3.alternative.options.${alternativeActivity}`);
    };

    const getIfThenLabel = () => {
        if (!ifThenPlan) return '-';
        if (ifThenPlan.action === 'custom' && ifThenPlan.customAction) {
            return ifThenPlan.customAction;
        }
        return t(`onboarding.v3.ifThen.options.${ifThenPlan.action}`);
    };

    const handleReset = () => {
        Alert.alert(
            t('settings.data.reset'),
            t('settings.data.resetConfirmMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('settings.data.resetButton'),
                    style: 'destructive',
                    onPress: () => reset()
                }
            ]
        );
    };

    const settingRowCommonProps = {
        borderColor: colors.borderSubtle,
        backgroundColor: colors.surface,
        textPrimaryColor: colors.textPrimary,
        textSecondaryColor: colors.textSecondary,
        textMutedColor: colors.textMuted,
        bodyStyle: typography.body,
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header title={t('settings.title')} showBack={false} variant="ghost" />
            <GlowOrb position="top-right" size="large" color="accent" intensity={0.05} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: 40 }}
            >
                <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.section}>
                    <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.md }]}>
                        {t('settings.theme.title').toUpperCase()}
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
        <SettingRow
            {...settingRowCommonProps}
            label={t('settings.theme.title')}
            value={t(`settings.theme.${themeMode}`)}
            icon="color-palette-outline"
            onPress={() => router.push('/(main)/theme-settings')}
        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.section}>
                    <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.md }]}>
                        {t('settings.yourSettings.title').toUpperCase()}
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
        <SettingRow
            {...settingRowCommonProps}
            label={t('settings.yourSettings.goal')}
            value={goal ? t(`onboarding.v3.goal.options.${goal}.title`) : '-'}
            icon="flag-outline"
            onPress={() => router.push('/(main)/goal-settings')}
        />
        <SettingRow
            {...settingRowCommonProps}
            label={t('settings.yourSettings.alternative')}
            value={getAlternativeLabel()}
            icon="swap-horizontal-outline"
            onPress={() => router.push('/(main)/alternative-settings')}
        />
        <SettingRow
            {...settingRowCommonProps}
            label={t('settings.yourSettings.ifThen')}
            value={getIfThenLabel()}
            icon="git-branch-outline"
            onPress={() => router.push('/(main)/if-then-settings')}
        />
                        <SettingRow
                            {...settingRowCommonProps}
                            label={t('settings.yourSettings.targetApps')}
                            value={t('settings.yourSettings.appsCount', { count: selectedApps.length + selectedCustomCount })}
                            icon="apps-outline"
                            onPress={() => router.push('/(main)/target-apps')}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.section}>
                    <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.md }]}>
                        {t('settings.limits.title').toUpperCase()}
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
                        <SettingRow
                            {...settingRowCommonProps}
                            label={t('settings.limits.interventionSettings')}
                            value={interventionLabel}
                            icon="hand-left-outline"
                            onPress={() => router.push('/(main)/intervention-settings')}
                        />
        <SettingRow
            {...settingRowCommonProps}
            label={t('settings.limits.urgeSurfingDuration')}
            value={t('settings.limits.secondsValue', { seconds: urgeSurfingDurationSeconds })}
            icon="time-outline"
            onPress={() => router.push('/(main)/urge-surfing-duration')}
        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(250)} style={styles.section}>
                    <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.md }]}>
                        {t('settings.data.title').toUpperCase()}
                    </Text>
                    <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
                        <SettingRow
                            {...settingRowCommonProps}
                            label={t('settings.data.reset')}
                            icon="trash-outline"
                            onPress={handleReset}
                        />
                    </View>
                </Animated.View>

                <View style={styles.footer}>
                    <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                        StopShorts v0.1.0
                    </Text>
                    <Text style={[typography.overline, { color: colors.textMuted, textAlign: 'center', marginTop: 4 }]}>
                        Made with Intention
                    </Text>
                </View>
            </ScrollView>
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
    section: {
        marginTop: 32,
    },
    card: {
        borderWidth: 1,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    footer: {
        marginTop: 64,
    },
});
