import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
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
import { IntentType, ImplementationIntentConfig } from '../../src/types';

const INTENT_OPTIONS: { id: IntentType; icon: any }[] = [
    { id: 'breathe', icon: 'leaf-outline' },
    { id: 'stretch', icon: 'body-outline' },
    { id: 'water', icon: 'water-outline' },
    { id: 'checklist', icon: 'list-outline' },
    { id: 'custom', icon: 'create-outline' },
];

export default function ImplementationIntentScreen() {
    const router = useRouter();
    const { colors, typography, spacing, borderRadius } = useTheme();
    const { setImplementationIntent, implementationIntent } = useAppStore();

    const [selectedType, setSelectedType] = useState<IntentType | null>(implementationIntent?.type || null);
    const [customText, setCustomText] = useState(implementationIntent?.customText || '');

    const handleContinue = () => {
        if (selectedType) {
            const config: ImplementationIntentConfig = {
                type: selectedType,
                customText: selectedType === 'custom' ? customText : undefined,
            };
            setImplementationIntent(config);
            router.push('/(onboarding)/pricing' as Href);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <Header variant="ghost" />
            <GlowOrb position="bottom-right" size="large" color="primary" intensity={0.1} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: spacing.xl }}
            >
                <Animated.View entering={FadeInRight.duration(600).delay(200)}>
                    <Text style={[typography.h1, { color: colors.textPrimary, marginBottom: spacing.sm }]}>
                        {t('onboarding.intent.title')}
                    </Text>
                    <Text style={[typography.bodyLarge, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
                        {t('onboarding.intent.subtitle')}
                    </Text>
                </Animated.View>

                <View style={styles.list}>
                    {INTENT_OPTIONS.map((option, index) => (
                        <Animated.View
                            key={option.id}
                            entering={FadeInRight.duration(400).delay(300 + index * 50)}
                        >
                            <SelectionCard
                                title={t(`onboarding.intent.options.${option.id}`)}
                                selected={selectedType === option.id}
                                onPress={() => setSelectedType(option.id)}
                                icon={option.icon}
                            />

                            {selectedType === 'custom' && option.id === 'custom' && (
                                <View style={[styles.inputContainer, { marginTop: -spacing.xs, marginBottom: spacing.md }]}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: colors.surface,
                                                color: colors.textPrimary,
                                                borderRadius: borderRadius.md,
                                                padding: spacing.md,
                                                ...typography.body,
                                            },
                                        ]}
                                        placeholder={t('onboarding.intent.customPlaceholder')}
                                        placeholderTextColor={colors.textMuted}
                                        value={customText}
                                        onChangeText={setCustomText}
                                        multiline
                                    />
                                </View>
                            )}
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            <View style={[styles.footer, { paddingHorizontal: spacing.gutter, paddingBottom: 40 }]}>
                <Button
                    title={t('common.continue')}
                    onPress={handleContinue}
                    disabled={!selectedType || (selectedType === 'custom' && !customText.trim())}
                    size="lg"
                />
                <View style={{ marginTop: spacing.xl }}>
                    <ProgressIndicator totalSteps={12} currentStep={9} />
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
    inputContainer: {
        paddingHorizontal: 4,
    },
    input: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
});
