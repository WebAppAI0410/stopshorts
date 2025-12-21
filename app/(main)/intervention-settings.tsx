import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Switch, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { Button, SelectionCard } from '../../src/components/ui';
import { screenTimeService } from '../../src/native/ScreenTimeModule';
import type { InterventionTiming, InterventionDelayMinutes } from '../../src/types';
import { useSettingsBack } from '../../src/hooks/useSettingsBack';

export default function InterventionSettingsScreen() {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { interventionSettings, setInterventionSettings } = useAppStore();

    const [timing, setTiming] = useState<InterventionTiming>(interventionSettings.timing);
    const [delayMinutes, setDelayMinutes] = useState<InterventionDelayMinutes>(interventionSettings.delayMinutes);
    const [isSaving, setIsSaving] = useState(false);
    const handleBack = useSettingsBack();

    const isAndroid = Platform.OS === 'android';

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update store
            setInterventionSettings({ timing, delayMinutes });

            // Sync to native on Android
            if (isAndroid) {
                await screenTimeService.setInterventionSettings(timing, delayMinutes);
            }

            handleBack();
        } catch (error) {
            console.error('[InterventionSettings] Failed to save:', error);
            Alert.alert(
                '保存エラー',
                '設定の保存に失敗しました。もう一度お試しください。',
                [{ text: 'OK' }]
            );
        } finally {
            setIsSaving(false);
        }
    };

    const delayOptions: { value: InterventionDelayMinutes; label: string }[] = [
        { value: 5, label: '5分' },
        { value: 10, label: '10分' },
        { value: 15, label: '15分' },
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
                            介入設定
                        </Text>
                        <View style={{ width: 40 }} />
                    </View>
                </Animated.View>

                {/* Description */}
                <Animated.View entering={FadeInDown.duration(600).delay(100)}>
                    <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
                        ショート動画アプリを使用した際の介入タイミングを設定します。
                        {!isAndroid && '\n\n注意: iOSでは即時介入のみ利用可能です（通知リマインダー）。'}
                    </Text>
                </Animated.View>

                {/* Timing Selection */}
                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                    <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                        介入タイミング
                    </Text>

                    <SelectionCard
                        title="即時介入"
                        subtitle="アプリ起動時すぐに介入画面を表示"
                        selected={timing === 'immediate'}
                        onPress={() => setTiming('immediate')}
                        icon="flash"
                    />

                    <SelectionCard
                        title="時間経過後に介入"
                        subtitle={`アプリを${delayMinutes}分使用後に介入画面を表示`}
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
                                iOSでは時間経過後の介入は利用できません。代わりに通知リマインダーを設定できます。
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Delay Time Selection (Only for delayed mode on Android) */}
                {timing === 'delayed' && isAndroid && (
                    <Animated.View entering={FadeInDown.duration(600).delay(300)} style={{ marginTop: spacing.lg }}>
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                            介入までの時間
                        </Text>

                        <View style={styles.delayOptionsRow}>
                            {delayOptions.map((option) => (
                                <View key={option.value} style={styles.delayOption}>
                                    <SelectionCard
                                        title={option.label}
                                        selected={delayMinutes === option.value}
                                        onPress={() => setDelayMinutes(option.value)}
                                        compact
                                    />
                                </View>
                            ))}
                        </View>

                        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
                            選択した時間、アプリを連続使用すると介入画面が表示されます
                        </Text>
                    </Animated.View>
                )}

                {/* iOS Notification Reminder Section */}
                {!isAndroid && (
                    <Animated.View entering={FadeInDown.duration(600).delay(300)} style={{ marginTop: spacing.xl }}>
                        <Text style={[typography.h3, { color: colors.textPrimary, marginBottom: spacing.md }]}>
                            通知リマインダー
                        </Text>

                        <View style={[styles.notificationCard, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.xl, borderColor: colors.border, borderWidth: 1 }]}>
                            <View style={styles.notificationRow}>
                                <View style={styles.notificationInfo}>
                                    <Ionicons name="notifications" size={24} color={colors.accent} />
                                    <View style={{ marginLeft: spacing.md }}>
                                        <Text style={[typography.body, { color: colors.textPrimary }]}>
                                            定期リマインダー
                                        </Text>
                                        <Text style={[typography.caption, { color: colors.textSecondary }]}>
                                            使用量を確認する通知を送信
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={false}
                                    onValueChange={() => {
                                        // TODO: Implement iOS notification scheduling
                                    }}
                                    trackColor={{ false: colors.surface, true: colors.accent }}
                                    thumbColor={colors.background}
                                />
                            </View>
                        </View>

                        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                            iOSではアプリのスクリーンタイムAPIへのアクセスが制限されているため、
                            リアルタイム介入の代わりに通知リマインダーを使用します。
                        </Text>
                    </Animated.View>
                )}

                {/* How it works */}
                <Animated.View
                    entering={FadeInDown.duration(600).delay(400)}
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
                        🧠 仕組み
                    </Text>
                    <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                        {timing === 'immediate'
                            ? '対象アプリを開くと、すぐに「本当に使いますか？」という確認画面が表示されます。衝動的な使用を防ぎ、意識的な選択を促します。'
                            : `対象アプリを${delayMinutes}分間使用すると、休憩を促す画面が表示されます。適度な使用は許容しつつ、長時間の使用を防ぎます。`}
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Save Button */}
            <Animated.View
                entering={FadeInDown.duration(600).delay(500)}
                style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
            >
                <Button
                    title={isSaving ? '保存中...' : '保存'}
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
});
