import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import {
    Button,
    ProgressIndicator,
    Header,
    SelectionCard,
    GlowOrb,
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { ManagedApp } from '../../src/types';

const APP_OPTIONS: { id: ManagedApp; title: string; subtitle: string; icon: any }[] = [
    { id: 'tiktok', title: 'TikTok', subtitle: 'Short video focus', icon: 'logo-tiktok' },
    { id: 'youtubeShorts', title: 'YouTube Shorts', subtitle: 'Integrated distractions', icon: 'logo-youtube' },
    { id: 'instagramReels', title: 'Instagram Reels', subtitle: 'Social scroll loop', icon: 'logo-instagram' },
];

export default function AppSelectionScreen() {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();
    const { setManagedApps, managedApps } = useAppStore();
    const [selected, setSelected] = useState<ManagedApp[]>(managedApps);

    const toggleSelection = (id: ManagedApp) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((item) => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleContinue = () => {
        setManagedApps(selected);
        router.push('/(onboarding)/tutorial' as Href);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />
            <GlowOrb position="top-right" size="large" color="accent" intensity={0.1} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
            >
                <Animated.View entering={FadeInRight.duration(600).delay(200)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {t('onboarding.appSelection.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.appSelection.subtitle')}
                    </Text>
                </Animated.View>

                <View style={styles.list}>
                    {APP_OPTIONS.map((option, index) => (
                        <Animated.View
                            key={option.id}
                            entering={FadeInRight.duration(400).delay(300 + index * 50)}
                        >
                            <SelectionCard
                                title={option.title}
                                subtitle={option.subtitle}
                                selected={selected.includes(option.id)}
                                onPress={() => toggleSelection(option.id)}
                                icon={option.icon}
                            />
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    disabled={selected.length === 0}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={7} />
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
    list: {
        marginTop: 10,
    },
    footer: {
        paddingTop: 20,
    },
});
