import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
    Button,
    ProgressIndicator,
    Header,
    GlowOrb,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

export default function PermissionScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();

    const handleRequestPermission = () => {
        // 実際には通知許可のリクエストを行いますが、ここではシミュレートして遷移します
        Alert.alert(
            "通知の許可",
            "StopShorts が通知を送信することを許可しますか？",
            [
                { text: "許可しない", onPress: () => router.push('/(onboarding)/commitment' as Href) },
                { text: "許可", onPress: () => router.push('/(onboarding)/commitment' as Href) }
            ]
        );
    };

    const handleSkip = () => {
        router.push('/(onboarding)/commitment' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />
            <GlowOrb position="top-right" size="xl" color="accent" intensity={0.1} />

            <View style={[styles.content, { paddingHorizontal: spacing.gutter }]}>
                <Animated.View
                    entering={FadeInUp.duration(800)}
                    style={styles.iconContainer}
                >
                    <View style={[styles.circle, { backgroundColor: colors.accentMuted }]}>
                        <Ionicons name="notifications-outline" size={64} color={colors.accent} />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(800).delay(200)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.md }]}>
                        通知をオンにする
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing['2xl'] }]}>
                        最適なコーチングとリマインダーを受け取るために、通知の許可が必要です。
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.duration(800).delay(400)}
                    style={[styles.box, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg }]}
                >
                    <View style={styles.item}>
                        <Ionicons name="shield-checkmark" size={24} color={colors.accent} style={styles.itemIcon} />
                        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                            データはプライベートに保たれます
                        </Text>
                    </View>
                    <View style={[styles.item, { marginTop: spacing.md }]}>
                        <Ionicons name="time-outline" size={24} color={colors.accent} style={styles.itemIcon} />
                        <Text style={[typography.body, { color: colors.textPrimary, flex: 1 }]}>
                            必要な時だけ通知します
                        </Text>
                    </View>
                </Animated.View>

                <View style={{ flex: 1 }} />

                <View style={styles.footer}>
                    <Button
                        title="通知を許可する"
                        onPress={handleRequestPermission}
                        size="lg"
                    />

                    <Button
                        title="あとで設定する"
                        onPress={handleSkip}
                        variant="ghost"
                        style={{ marginTop: spacing.sm }}
                    />

                    <View style={{ marginTop: spacing.xl }}>
                        <ProgressIndicator totalSteps={12} currentStep={11} />
                    </View>
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
        paddingTop: 40,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    circle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        marginTop: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: 16,
    },
    footer: {
        paddingBottom: 40,
    },
});
