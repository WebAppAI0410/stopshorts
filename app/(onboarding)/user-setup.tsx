import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Platform,
    ScrollView,
    AppState,
    AppStateStatus,
    KeyboardAvoidingView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Button, ProgressIndicator, Header, GlowOrb } from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import screenTimeService, { PermissionStatus } from '../../src/services/screenTime';

// Android Overlay Settings Mockup Component
function AndroidOverlaySettingsMockup({
    colors,
    typography,
    spacing,
    borderRadius,
    highlightApp,
}: {
    colors: any;
    typography: any;
    spacing: any;
    borderRadius: any;
    highlightApp: boolean;
}) {
    const mockApps = [
        { name: 'Chrome', enabled: false },
        { name: 'Instagram', enabled: true },
        { name: 'StopShorts', enabled: false, highlight: true },
        { name: 'YouTube', enabled: true },
    ];

    return (
        <View style={[styles.mockupContainer, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            {/* Mock Header */}
            <View style={[styles.mockupHeader, { borderBottomColor: colors.border }]}>
                <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                <Text style={[typography.body, { color: colors.textPrimary, marginLeft: spacing.sm, fontWeight: '600' }]}>
                    他のアプリの上に重ねて表示
                </Text>
            </View>

            {/* Mock App List */}
            <View style={styles.mockupList}>
                {mockApps.map((app, index) => (
                    <View
                        key={app.name}
                        style={[
                            styles.mockupItem,
                            app.highlight && highlightApp && {
                                backgroundColor: colors.accentMuted,
                                borderRadius: borderRadius.md,
                            },
                        ]}
                    >
                        <View style={[styles.mockupAppIcon, { backgroundColor: colors.backgroundCard }]}>
                            <Ionicons
                                name={app.name === 'StopShorts' ? 'heart' : 'apps'}
                                size={16}
                                color={app.highlight ? colors.accent : colors.textMuted}
                            />
                        </View>
                        <Text
                            style={[
                                typography.body,
                                {
                                    flex: 1,
                                    color: app.highlight ? colors.accent : colors.textPrimary,
                                    fontWeight: app.highlight ? '700' : '400',
                                },
                            ]}
                        >
                            {app.name}
                        </Text>
                        {app.highlight && highlightApp && (
                            <View style={[styles.tapHere, { backgroundColor: colors.accent }]}>
                                <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>
                                    タップ
                                </Text>
                            </View>
                        )}
                        <View
                            style={[
                                styles.mockupToggle,
                                {
                                    backgroundColor: app.enabled ? colors.accent : colors.border,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.mockupToggleKnob,
                                    { transform: [{ translateX: app.enabled ? 12 : 0 }] },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

// Android Settings Mockup Component
function AndroidSettingsMockup({
    colors,
    typography,
    spacing,
    borderRadius,
    highlightApp,
}: {
    colors: any;
    typography: any;
    spacing: any;
    borderRadius: any;
    highlightApp: boolean;
}) {
    const mockApps = [
        { name: 'Chrome', enabled: true },
        { name: 'Instagram', enabled: false },
        { name: 'StopShorts', enabled: false, highlight: true },
        { name: 'YouTube', enabled: false },
    ];

    return (
        <View style={[styles.mockupContainer, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
            {/* Mock Header */}
            <View style={[styles.mockupHeader, { borderBottomColor: colors.border }]}>
                <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                <Text style={[typography.body, { color: colors.textPrimary, marginLeft: spacing.sm, fontWeight: '600' }]}>
                    使用状況へのアクセス
                </Text>
            </View>

            {/* Mock App List */}
            <View style={styles.mockupList}>
                {mockApps.map((app, index) => (
                    <View
                        key={app.name}
                        style={[
                            styles.mockupItem,
                            app.highlight && highlightApp && {
                                backgroundColor: colors.accentMuted,
                                borderRadius: borderRadius.md,
                            },
                        ]}
                    >
                        <View style={[styles.mockupAppIcon, { backgroundColor: colors.backgroundCard }]}>
                            <Ionicons
                                name={app.name === 'StopShorts' ? 'heart' : 'apps'}
                                size={16}
                                color={app.highlight ? colors.accent : colors.textMuted}
                            />
                        </View>
                        <Text
                            style={[
                                typography.body,
                                {
                                    flex: 1,
                                    color: app.highlight ? colors.accent : colors.textPrimary,
                                    fontWeight: app.highlight ? '700' : '400',
                                },
                            ]}
                        >
                            {app.name}
                        </Text>
                        {app.highlight && highlightApp && (
                            <View style={[styles.tapHere, { backgroundColor: colors.accent }]}>
                                <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '600' }]}>
                                    タップ
                                </Text>
                            </View>
                        )}
                        <View
                            style={[
                                styles.mockupToggle,
                                {
                                    backgroundColor: app.enabled ? colors.accent : colors.border,
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.mockupToggleKnob,
                                    { transform: [{ translateX: app.enabled ? 12 : 0 }] },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default function UserSetupScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setUserName, setScreenTimePermission } = useAppStore();

    const [name, setName] = useState('');
    const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);
    const [currentStep, setCurrentStep] = useState<'name' | 'permission'>('name');
    const [hasOpenedUsageSettings, setHasOpenedUsageSettings] = useState(false);
    const [hasOpenedOverlaySettings, setHasOpenedOverlaySettings] = useState(false);
    const [currentPermissionType, setCurrentPermissionType] = useState<'usage' | 'overlay'>('usage');

    // Check permission status
    const checkPermissions = useCallback(async () => {
        if (Platform.OS === 'android') {
            try {
                const status = await screenTimeService.getAndroidPermissionStatus();
                setPermissionStatus(status);

                // Both permissions granted
                if (status.usageStats && status.overlay) {
                    setScreenTimePermission(true);
                }
            } catch (error) {
                console.error('[UserSetup] Failed to check permissions:', error);
            }
        }
    }, [setScreenTimePermission]);

    // Listen for app state changes (returning from Settings on Android)
    useEffect(() => {
        if (Platform.OS !== 'android' || currentStep !== 'permission') return;

        const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                checkPermissions();
            }
        });

        checkPermissions();
        return () => subscription.remove();
    }, [checkPermissions, currentStep]);

    const handleNameSubmit = () => {
        if (name.trim().length === 0) return;
        setUserName(name.trim());
        setCurrentStep('permission');
    };

    const handlePermissionRequest = async () => {
        setIsRequestingPermission(true);

        try {
            if (Platform.OS === 'ios') {
                // iOS: Show system modal
                const result = await screenTimeService.requestAuthorization();
                setScreenTimePermission(result.success);
                router.push('/(onboarding)/the-problem' as Href);
            } else {
                // Android: Open appropriate settings
                if (currentPermissionType === 'usage') {
                    setHasOpenedUsageSettings(true);
                    await screenTimeService.openUsageStatsSettings();
                } else {
                    setHasOpenedOverlaySettings(true);
                    await screenTimeService.openOverlaySettings();
                }
            }
        } catch (error) {
            console.error('[UserSetup] Permission request failed:', error);
        } finally {
            setIsRequestingPermission(false);
        }
    };

    const handleContinue = () => {
        router.push('/(onboarding)/the-problem' as Href);
    };

    const isUsageStatsGranted = Platform.OS === 'android' && permissionStatus?.usageStats;
    const isOverlayGranted = Platform.OS === 'android' && permissionStatus?.overlay;
    const isAllAndroidPermissionsGranted = isUsageStatsGranted && isOverlayGranted;

    // Render name input step
    const renderNameStep = () => (
        <>
            <Animated.View entering={FadeIn.duration(600)} style={styles.iconWrapper}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accentMuted }]}>
                    <Ionicons name="person-outline" size={48} color={colors.accent} />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }]}>
                    はじめまして
                </Text>
                <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }]}>
                    お名前を教えてください
                </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200).duration(600)} style={{ width: '100%' }}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderColor: colors.border,
                            color: colors.textPrimary,
                            borderRadius: borderRadius.lg,
                            padding: spacing.md,
                            fontSize: 18,
                        },
                    ]}
                    placeholder="ニックネーム"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={handleNameSubmit}
                />
            </Animated.View>
        </>
    );

    // Render iOS permission step
    const renderIOSPermissionStep = () => (
        <>
            <Animated.View entering={FadeIn.duration(600)} style={styles.iconWrapper}>
                <View style={[styles.iconCircle, { backgroundColor: colors.accentMuted }]}>
                    <Ionicons name="bar-chart-outline" size={48} color={colors.accent} />
                </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }]}>
                    {name}さん、{'\n'}使用状況を確認しましょう
                </Text>
                <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.xl }]}>
                    スクリーンタイムへのアクセスを許可すると、{'\n'}実際の使用時間を分析できます
                </Text>
            </Animated.View>

            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                style={[styles.privacyCard, { backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg, padding: spacing.lg }]}
            >
                <View style={styles.privacyHeader}>
                    <Ionicons name="shield-checkmark-outline" size={24} color={colors.accent} />
                    <Text style={[typography.h3, { color: colors.textPrimary, marginLeft: spacing.sm }]}>
                        プライバシー保護
                    </Text>
                </View>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                    データはあなたのデバイス内でのみ処理されます。外部に送信されることはありません。
                </Text>
            </Animated.View>
        </>
    );

    // Render Android permission step
    const renderAndroidPermissionStep = () => {
        const isUsageStep = currentPermissionType === 'usage';

        return (
            <>
                {/* Permission type tabs */}
                <Animated.View entering={FadeInUp.delay(50).duration(600)} style={{ width: '100%', marginBottom: spacing.md }}>
                    <View style={[styles.permissionTabs, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: 4 }]}>
                        <TouchableOpacity
                            style={[
                                styles.permissionTab,
                                {
                                    backgroundColor: isUsageStep ? colors.backgroundCard : 'transparent',
                                    borderRadius: borderRadius.md,
                                },
                            ]}
                            onPress={() => setCurrentPermissionType('usage')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isUsageStatsGranted ? 'checkmark-circle' : 'bar-chart-outline'}
                                size={16}
                                color={isUsageStatsGranted ? colors.accent : (isUsageStep ? colors.textPrimary : colors.textMuted)}
                            />
                            <Text style={[typography.caption, { color: isUsageStatsGranted ? colors.accent : (isUsageStep ? colors.textPrimary : colors.textMuted), marginLeft: 4, fontWeight: '600' }]}>
                                使用状況
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.permissionTab,
                                {
                                    backgroundColor: !isUsageStep ? colors.backgroundCard : 'transparent',
                                    borderRadius: borderRadius.md,
                                },
                            ]}
                            onPress={() => setCurrentPermissionType('overlay')}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={isOverlayGranted ? 'checkmark-circle' : 'layers-outline'}
                                size={16}
                                color={isOverlayGranted ? colors.accent : (!isUsageStep ? colors.textPrimary : colors.textMuted)}
                            />
                            <Text style={[typography.caption, { color: isOverlayGranted ? colors.accent : (!isUsageStep ? colors.textPrimary : colors.textMuted), marginLeft: 4, fontWeight: '600' }]}>
                                オーバーレイ
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                    <Text style={[typography.h2, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm }]}>
                        {isUsageStep ? (
                            <>使用状況へのアクセスを許可</>
                        ) : (
                            <>他のアプリの上に{'\n'}重ねて表示を許可</>
                        )}
                    </Text>
                    <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg }]}>
                        {isUsageStep ? (
                            '設定画面で「StopShorts」を有効にしてください'
                        ) : (
                            'アプリ制限の通知を表示するために必要です'
                        )}
                    </Text>
                </Animated.View>

                {/* Step by step instructions */}
                <Animated.View entering={FadeInUp.delay(200).duration(600)} style={{ width: '100%', marginBottom: spacing.lg }}>
                    {isUsageStep ? (
                        // Usage Stats steps
                        <>
                            <View style={[styles.stepItem, { marginBottom: spacing.sm }]}>
                                <View style={[styles.stepNumber, { backgroundColor: hasOpenedUsageSettings ? colors.accent : colors.textMuted }]}>
                                    <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>1</Text>
                                </View>
                                <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                                    下のボタンで設定画面を開く
                                </Text>
                                {hasOpenedUsageSettings ? (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                ) : (
                                    <Ionicons name="arrow-forward" size={20} color={colors.accent} />
                                )}
                            </View>
                            <View style={[styles.stepItem, { marginBottom: spacing.sm }]}>
                                <View style={[styles.stepNumber, { backgroundColor: hasOpenedUsageSettings ? (isUsageStatsGranted ? colors.accent : colors.warning || '#F59E0B') : colors.textMuted }]}>
                                    <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>2</Text>
                                </View>
                                <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                                    「StopShorts」を探してタップ
                                </Text>
                                {hasOpenedUsageSettings && isUsageStatsGranted && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                )}
                            </View>
                            <View style={[styles.stepItem]}>
                                <View style={[styles.stepNumber, { backgroundColor: isUsageStatsGranted ? colors.accent : colors.textMuted }]}>
                                    <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>3</Text>
                                </View>
                                <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                                    トグルをONにしてアプリに戻る
                                </Text>
                                {isUsageStatsGranted && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                )}
                            </View>
                        </>
                    ) : (
                        // Overlay steps
                        <>
                            <View style={[styles.stepItem, { marginBottom: spacing.sm }]}>
                                <View style={[styles.stepNumber, { backgroundColor: hasOpenedOverlaySettings ? colors.accent : colors.textMuted }]}>
                                    <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>1</Text>
                                </View>
                                <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                                    下のボタンで設定画面を開く
                                </Text>
                                {hasOpenedOverlaySettings ? (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                ) : (
                                    <Ionicons name="arrow-forward" size={20} color={colors.accent} />
                                )}
                            </View>
                            <View style={[styles.stepItem, { marginBottom: spacing.sm }]}>
                                <View style={[styles.stepNumber, { backgroundColor: hasOpenedOverlaySettings ? (isOverlayGranted ? colors.accent : colors.warning || '#F59E0B') : colors.textMuted }]}>
                                    <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>2</Text>
                                </View>
                                <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                                    「StopShorts」を探してタップ
                                </Text>
                                {hasOpenedOverlaySettings && isOverlayGranted && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                )}
                            </View>
                            <View style={[styles.stepItem]}>
                                <View style={[styles.stepNumber, { backgroundColor: isOverlayGranted ? colors.accent : colors.textMuted }]}>
                                    <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>3</Text>
                                </View>
                                <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                                    トグルをONにしてアプリに戻る
                                </Text>
                                {isOverlayGranted && (
                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                )}
                            </View>
                        </>
                    )}
                </Animated.View>

                {/* Settings mockup */}
                <Animated.View entering={FadeInUp.delay(300).duration(600)} style={{ width: '100%' }}>
                    {isUsageStep ? (
                        <AndroidSettingsMockup
                            colors={colors}
                            typography={typography}
                            spacing={spacing}
                            borderRadius={borderRadius}
                            highlightApp={!isUsageStatsGranted}
                        />
                    ) : (
                        <AndroidOverlaySettingsMockup
                            colors={colors}
                            typography={typography}
                            spacing={spacing}
                            borderRadius={borderRadius}
                            highlightApp={!isOverlayGranted}
                        />
                    )}
                </Animated.View>

                {/* Permission granted indicator */}
                {isUsageStep && isUsageStatsGranted && (
                    <Animated.View
                        entering={FadeIn.duration(400)}
                        style={[styles.grantedBadge, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.lg }]}
                    >
                        <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                        <Text style={[typography.body, { color: colors.accent, fontWeight: '600', marginLeft: spacing.sm }]}>
                            使用状況の許可が完了しました
                        </Text>
                    </Animated.View>
                )}
                {!isUsageStep && isOverlayGranted && (
                    <Animated.View
                        entering={FadeIn.duration(400)}
                        style={[styles.grantedBadge, { backgroundColor: colors.accentMuted, borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.lg }]}
                    >
                        <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
                        <Text style={[typography.body, { color: colors.accent, fontWeight: '600', marginLeft: spacing.sm }]}>
                            オーバーレイの許可が完了しました
                        </Text>
                    </Animated.View>
                )}

                {/* All permissions granted */}
                {isAllAndroidPermissionsGranted && (
                    <Animated.View
                        entering={FadeIn.duration(400)}
                        style={[styles.allGrantedBadge, { backgroundColor: colors.accent, borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.md }]}
                    >
                        <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                        <Text style={[typography.body, { color: '#FFFFFF', fontWeight: '700', marginLeft: spacing.sm }]}>
                            すべての権限が許可されました！
                        </Text>
                    </Animated.View>
                )}
            </>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <GlowOrb position="top-right" size="large" color="accent" intensity={0.1} />

            <Header showBack variant="ghost" />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.gutter }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {currentStep === 'name' && renderNameStep()}
                    {currentStep === 'permission' && Platform.OS === 'ios' && renderIOSPermissionStep()}
                    {currentStep === 'permission' && Platform.OS === 'android' && renderAndroidPermissionStep()}
                </ScrollView>
            </KeyboardAvoidingView>

            <Animated.View
                entering={FadeInUp.duration(600).delay(400)}
                style={[styles.footer, { paddingHorizontal: spacing.gutter }]}
            >
                {currentStep === 'name' ? (
                    <Button
                        title="次へ"
                        onPress={handleNameSubmit}
                        disabled={name.trim().length === 0}
                        size="lg"
                        testID="next-button"
                    />
                ) : Platform.OS === 'ios' ? (
                    <Button
                        title={isRequestingPermission ? '確認中...' : '使用状況へのアクセスを許可'}
                        onPress={handlePermissionRequest}
                        disabled={isRequestingPermission}
                        size="lg"
                    />
                ) : isAllAndroidPermissionsGranted ? (
                    <Button
                        title="次へ進む"
                        onPress={handleContinue}
                        size="lg"
                    />
                ) : currentPermissionType === 'usage' && isUsageStatsGranted ? (
                    <Button
                        title="次へ：オーバーレイ権限"
                        onPress={() => setCurrentPermissionType('overlay')}
                        size="lg"
                    />
                ) : currentPermissionType === 'overlay' && isOverlayGranted ? (
                    <Button
                        title="次へ：使用状況権限"
                        onPress={() => setCurrentPermissionType('usage')}
                        size="lg"
                    />
                ) : (
                    <Button
                        title={currentPermissionType === 'usage' ? '使用状況の設定を開く' : 'オーバーレイの設定を開く'}
                        onPress={handlePermissionRequest}
                        disabled={isRequestingPermission}
                        size="lg"
                    />
                )}

                <View style={{ marginTop: spacing.lg }}>
                    <ProgressIndicator totalSteps={11} currentStep={2} />
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
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 24,
    },
    iconWrapper: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        textAlign: 'center',
    },
    privacyCard: {
        width: '100%',
    },
    privacyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mockupContainer: {
        width: '100%',
        overflow: 'hidden',
    },
    mockupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
    },
    mockupList: {
        padding: 8,
    },
    mockupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    mockupAppIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mockupToggle: {
        width: 36,
        height: 20,
        borderRadius: 10,
        padding: 2,
    },
    mockupToggleKnob: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    tapHere: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    grantedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    allGrantedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    permissionTabs: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    permissionTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    footer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
});
