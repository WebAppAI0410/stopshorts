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
} from '../../src/components/ui';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppStore } from '../../src/stores/useAppStore';
import { t } from '../../src/i18n';
import { UserPurpose } from '../../src/types';

const PURPOSE_OPTIONS: { id: UserPurpose; icon: string }[] = [
    { id: 'sleep', icon: 'moon-outline' },
    { id: 'study', icon: 'book-outline' },
    { id: 'work', icon: 'briefcase-outline' },
    { id: 'creative', icon: 'color-palette-outline' },
    { id: 'mental', icon: 'heart-outline' },
];

export default function PurposeScreen() {
    const router = useRouter();
    const { colors, typography, spacing } = useTheme();
    const { setPurpose, purpose: currentPurpose } = useAppStore();
    const [selected, setSelected] = useState<UserPurpose | null>(currentPurpose);

    const handleContinue = () => {
        if (selected) {
            setPurpose(selected);
            router.push('/(onboarding)/purpose-detail' as Href);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInRight.duration(600).delay(200)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {t('onboarding.purpose.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.purpose.subtitle')}
                    </Text>
                </Animated.View>

                <View style={styles.grid}>
                    {PURPOSE_OPTIONS.map((option, index) => (
                        <Animated.View
                            key={option.id}
                            entering={FadeInRight.duration(400).delay(300 + index * 50)}
                        >
                            <SelectionCard
                                title={t(`onboarding.purpose.options.${option.id}`)}
                                selected={selected === option.id}
                                onPress={() => setSelected(option.id)}
                                icon={option.icon as any}
                            />
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    disabled={!selected}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={4} />
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
    grid: {
        marginTop: 10,
    },
    footer: {
        paddingTop: 20,
    },
});
