import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    FadeOut,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Button,
    ProgressIndicator,
    Header,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';

const { width, height } = Dimensions.get('window');

// Mock video data for the tutorial
const MOCK_VIDEOS = [
    { id: 1, user: '@creator1', description: 'Amazing dance moves! #viral #fyp', likes: '245K', comments: '1.2K' },
    { id: 2, user: '@funnyvideos', description: 'Wait for it... 😂 #comedy', likes: '89K', comments: '432' },
    { id: 3, user: '@lifehacks', description: 'This trick will change your life!', likes: '156K', comments: '2.3K' },
];

export default function TutorialScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setTutorialComplete } = useAppStore();

    const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1: mock app, 2: shield demo, 3: complete
    const [currentVideo, setCurrentVideo] = useState(0);
    const [showShield, setShowShield] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const translateY = useSharedValue(0);
    const shieldOpacity = useSharedValue(0);

    useEffect(() => {
        if (currentStep === 1) {
            // Start timer when in mock app
            timerRef.current = setInterval(() => {
                setTimeElapsed((prev) => {
                    if (prev >= 5) {
                        // Show shield after 5 seconds
                        if (timerRef.current) clearInterval(timerRef.current);
                        setShowShield(true);
                        shieldOpacity.value = withTiming(1, { duration: 500 });
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep]);

    const handleSkip = () => {
        setTutorialComplete();
        router.push('/(onboarding)/implementation-intent' as Href);
    };

    const handleStart = () => {
        setCurrentStep(1);
    };

    const handleShieldClose = () => {
        setShowShield(false);
        shieldOpacity.value = withTiming(0, { duration: 300 });
        setCurrentStep(3);
    };

    const handleComplete = () => {
        setTutorialComplete();
        router.push('/(onboarding)/implementation-intent' as Href);
    };

    const swipeGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (currentStep === 1 && !showShield) {
                translateY.value = e.translationY;
            }
        })
        .onEnd((e) => {
            if (currentStep === 1 && !showShield) {
                if (e.translationY < -50) {
                    // Swipe up - next video
                    translateY.value = withSpring(0);
                    runOnJS(setCurrentVideo)((currentVideo + 1) % MOCK_VIDEOS.length);
                } else if (e.translationY > 50) {
                    // Swipe down - previous video
                    translateY.value = withSpring(0);
                    runOnJS(setCurrentVideo)(currentVideo === 0 ? MOCK_VIDEOS.length - 1 : currentVideo - 1);
                } else {
                    translateY.value = withSpring(0);
                }
            }
        });

    const animatedVideoStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const animatedShieldStyle = useAnimatedStyle(() => ({
        opacity: shieldOpacity.value,
    }));

    // Intro screen
    if (currentStep === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Header variant="ghost" />

                <View style={[styles.content, { paddingHorizontal: spacing.gutter }]}>
                    <Animated.View entering={FadeInUp.duration(600).delay(200)}>
                        <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                            {t('onboarding.tutorial.title')}
                        </Text>
                        <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                            {t('onboarding.tutorial.subtitle')}
                        </Text>
                    </Animated.View>

                    {/* Steps preview */}
                    <View style={{ marginTop: spacing.xl }}>
                        {[1, 2, 3].map((step, index) => (
                            <Animated.View
                                key={step}
                                entering={FadeInDown.duration(400).delay(400 + index * 100)}
                                style={[
                                    styles.stepCard,
                                    {
                                        backgroundColor: colors.backgroundCard,
                                        borderRadius: borderRadius.lg,
                                        padding: spacing.md,
                                        marginBottom: spacing.md,
                                    },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.stepNumber,
                                        {
                                            backgroundColor: colors.accent,
                                            borderRadius: borderRadius.full,
                                        },
                                    ]}
                                >
                                    <Text style={[typography.body, { color: '#FFFFFF', fontWeight: '600' }]}>
                                        {step}
                                    </Text>
                                </View>
                                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                                    <Text style={[typography.h3, { color: colors.textPrimary }]}>
                                        {t(`onboarding.tutorial.step${step}.title`)}
                                    </Text>
                                    <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                                        {t(`onboarding.tutorial.step${step}.description`)}
                                    </Text>
                                </View>
                            </Animated.View>
                        ))}
                    </View>

                    <View style={{ flex: 1 }} />
                </View>

                <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                    <Button
                        title={t('onboarding.tutorial.tryButton')}
                        onPress={handleStart}
                        size="lg"
                    />
                    <Pressable onPress={handleSkip} style={{ marginTop: spacing.md }}>
                        <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
                            {t('onboarding.tutorial.skipButton')}
                        </Text>
                    </Pressable>
                    <View style={{ marginTop: spacing.lg }}>
                        <ProgressIndicator totalSteps={12} currentStep={8} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Mock TikTok-style app
    if (currentStep === 1 || currentStep === 2) {
        const video = MOCK_VIDEOS[currentVideo];

        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={[styles.mockAppContainer, { backgroundColor: '#000000' }]}>
                    <GestureDetector gesture={swipeGesture}>
                        <Animated.View style={[styles.videoContainer, animatedVideoStyle]}>
                            {/* Gradient background to simulate video */}
                            <LinearGradient
                                colors={['#1a1a2e', '#16213e', '#0f3460']}
                                style={StyleSheet.absoluteFill}
                            />

                            {/* Timer display */}
                            <View style={[styles.timerBadge, { top: 50 }]}>
                                <Text style={styles.timerText}>{timeElapsed}秒経過</Text>
                            </View>

                            {/* Video content placeholder */}
                            <View style={styles.videoContent}>
                                <Ionicons name="play-circle-outline" size={80} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.swipeHint}>
                                    {t('onboarding.tutorial.mockApp.swipeHint')}
                                </Text>
                            </View>

                            {/* Right side actions */}
                            <View style={styles.actionsContainer}>
                                <View style={styles.actionItem}>
                                    <Ionicons name="heart" size={32} color="#FFFFFF" />
                                    <Text style={styles.actionText}>{video.likes}</Text>
                                </View>
                                <View style={styles.actionItem}>
                                    <Ionicons name="chatbubble-ellipses" size={32} color="#FFFFFF" />
                                    <Text style={styles.actionText}>{video.comments}</Text>
                                </View>
                                <View style={styles.actionItem}>
                                    <Ionicons name="share-social" size={32} color="#FFFFFF" />
                                    <Text style={styles.actionText}>{t('onboarding.tutorial.mockApp.shareCount')}</Text>
                                </View>
                            </View>

                            {/* Bottom info */}
                            <View style={styles.videoInfo}>
                                <Text style={styles.username}>{video.user}</Text>
                                <Text style={styles.description}>{video.description}</Text>
                            </View>
                        </Animated.View>
                    </GestureDetector>

                    {/* Shield overlay */}
                    {showShield && (
                        <Animated.View
                            style={[styles.shieldOverlay, animatedShieldStyle]}
                            entering={FadeIn.duration(500)}
                        >
                            <View style={[styles.shieldContent, { backgroundColor: 'rgba(13, 17, 23, 0.95)' }]}>
                                <Animated.View entering={FadeInDown.duration(600).delay(200)}>
                                    <View style={styles.shieldIcon}>
                                        <Ionicons name="shield-checkmark" size={64} color={colors.accent} />
                                    </View>
                                    <Text style={[typography.h1, { color: '#FFFFFF', textAlign: 'center', marginTop: spacing.lg }]}>
                                        5分が経過しました
                                    </Text>
                                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
                                        続けますか？それとも今日の目標に向かいますか？
                                    </Text>
                                </Animated.View>

                                <Animated.View
                                    entering={FadeInUp.duration(600).delay(400)}
                                    style={{ marginTop: spacing.xl, width: '100%' }}
                                >
                                    <Pressable
                                        onPress={handleShieldClose}
                                        style={[
                                            styles.shieldButton,
                                            {
                                                backgroundColor: colors.accent,
                                                borderRadius: borderRadius.lg,
                                                padding: spacing.md,
                                            },
                                        ]}
                                    >
                                        <Text style={[typography.button, { color: '#FFFFFF', textAlign: 'center' }]}>
                                            アプリを閉じる
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[
                                            styles.shieldButton,
                                            {
                                                backgroundColor: 'transparent',
                                                borderColor: colors.border,
                                                borderWidth: 1,
                                                borderRadius: borderRadius.lg,
                                                padding: spacing.md,
                                                marginTop: spacing.md,
                                            },
                                        ]}
                                    >
                                        <Text style={[typography.button, { color: colors.textSecondary, textAlign: 'center' }]}>
                                            5分延長する
                                        </Text>
                                    </Pressable>
                                </Animated.View>
                            </View>
                        </Animated.View>
                    )}
                </View>
            </GestureHandlerRootView>
        );
    }

    // Complete screen
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />

            <View style={[styles.content, { paddingHorizontal: spacing.gutter, justifyContent: 'center' }]}>
                <Animated.View entering={FadeInUp.duration(600)} style={{ alignItems: 'center' }}>
                    <View style={[styles.successIcon, { backgroundColor: colors.accentMuted }]}>
                        <Ionicons name="checkmark-circle" size={80} color={colors.accent} />
                    </View>
                    <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center', marginTop: spacing.xl }]}>
                        体験完了！
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
                        これがStopShortsの動作です。{'\n'}
                        5分ごとに意識的な選択を促します。
                    </Text>
                </Animated.View>
            </View>

            <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                <Button
                    title={t('common.continue')}
                    onPress={handleComplete}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={8} />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepNumber: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        paddingTop: 20,
    },
    mockAppContainer: {
        flex: 1,
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerBadge: {
        position: 'absolute',
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    timerText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    videoContent: {
        alignItems: 'center',
    },
    swipeHint: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 14,
        marginTop: 16,
    },
    actionsContainer: {
        position: 'absolute',
        right: 16,
        bottom: 150,
    },
    actionItem: {
        alignItems: 'center',
        marginBottom: 24,
    },
    actionText: {
        color: '#FFFFFF',
        fontSize: 12,
        marginTop: 4,
    },
    videoInfo: {
        position: 'absolute',
        left: 16,
        right: 80,
        bottom: 100,
    },
    username: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    description: {
        color: '#FFFFFF',
        fontSize: 14,
        marginTop: 4,
    },
    shieldOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    shieldContent: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
    },
    shieldIcon: {
        alignItems: 'center',
    },
    shieldButton: {},
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
