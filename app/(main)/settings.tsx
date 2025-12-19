import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Header, GlowOrb } from '../../src/components/ui';
import { useTheme, ThemeMode } from '../../src/contexts/ThemeContext';
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
    const { colors, typography, spacing, borderRadius, themeMode, setThemeMode } = useTheme();
    const { reset, interventionDurationMinutes, setInterventionDuration, goal, alternativeActivity, ifThenPlan, selectedApps } = useAppStore();

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
                            onPress={() => {
                                const modes: ThemeMode[] = ['light', 'dark', 'system'];
                                const next = modes[(modes.indexOf(themeMode) + 1) % modes.length];
                                setThemeMode(next);
                            }}
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
                            onPress={() => Alert.alert(t('settings.comingSoon.title'), t('settings.comingSoon.message'))}
                        />
                        <SettingRow
                            {...settingRowCommonProps}
                            label={t('settings.yourSettings.alternative')}
                            value={alternativeActivity ? t(`onboarding.v3.alternative.options.${alternativeActivity}`) : '-'}
                            icon="swap-horizontal-outline"
                            onPress={() => Alert.alert(t('settings.comingSoon.title'), t('settings.comingSoon.message'))}
                        />
                        <SettingRow
                            {...settingRowCommonProps}
                            label={t('settings.yourSettings.ifThen')}
                            value={ifThenPlan ? t(`onboarding.v3.ifThen.options.${ifThenPlan.action}`) : '-'}
                            icon="git-branch-outline"
                            onPress={() => Alert.alert(t('settings.comingSoon.title'), t('settings.comingSoon.message'))}
                        />
                        <SettingRow
                            {...settingRowCommonProps}
                            label={t('settings.yourSettings.targetApps')}
                            value={t('settings.yourSettings.appsCount', { count: selectedApps.length })}
                            icon="apps-outline"
                            onPress={() => Alert.alert(t('settings.comingSoon.title'), t('settings.comingSoon.message'))}
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
                            label={t('settings.limits.interventionTime')}
                            value={t('settings.limits.minutesValue', { minutes: interventionDurationMinutes })}
                            icon="time-outline"
                            onPress={() => {
                                const durations = [1, 3, 5, 10];
                                const next = durations[(durations.indexOf(interventionDurationMinutes) + 1) % durations.length];
                                setInterventionDuration(next);
                            }}
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.section}>
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
