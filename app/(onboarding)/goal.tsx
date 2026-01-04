import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter, Href } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { SelectionCard } from '../../src/components/ui';
import { OnboardingScreenTemplate } from '../../src/components/templates';
import { t } from '../../src/i18n';
import { useAppStore } from '../../src/stores/useAppStore';

type GoalOption = {
    id: 'concentration' | 'sleep' | 'time' | 'mental';
    icon: keyof typeof Ionicons.glyphMap;
};

const goalOptions: GoalOption[] = [
    { id: 'concentration', icon: 'locate-outline' },
    { id: 'sleep', icon: 'moon-outline' },
    { id: 'time', icon: 'time-outline' },
    { id: 'mental', icon: 'leaf-outline' },
];

export default function GoalScreen() {
    const router = useRouter();
    const { setGoal } = useAppStore();
    const [selectedGoal, setSelectedGoal] = useState<GoalOption['id'] | null>(null);

    const handleContinue = () => {
        if (!selectedGoal) return;
        setGoal(selectedGoal);
        router.push('/(onboarding)/app-selection' as Href);
    };

    return (
        <OnboardingScreenTemplate
            title={t('onboarding.v3.goal.title')}
            subtitle={t('onboarding.v3.goal.subtitle')}
            currentStep={4}
            buttonText={t('common.continue')}
            onButtonPress={handleContinue}
            buttonDisabled={!selectedGoal}
        >
            <View style={{ gap: 12 }}>
                {goalOptions.map((option, index) => (
                    <Animated.View
                        key={option.id}
                        entering={FadeInRight.duration(600).delay(200 + index * 100)}
                    >
                        <SelectionCard
                            title={t(`onboarding.v3.goal.options.${option.id}.title`)}
                            subtitle={t(`onboarding.v3.goal.options.${option.id}.description`)}
                            icon={option.icon}
                            selected={selectedGoal === option.id}
                            onPress={() => setSelectedGoal(option.id)}
                        />
                    </Animated.View>
                ))}
            </View>
        </OnboardingScreenTemplate>
    );
}
