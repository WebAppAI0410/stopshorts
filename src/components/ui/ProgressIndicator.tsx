import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

type ProgressIndicatorProps = {
    totalSteps: number;
    currentStep: number;
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    totalSteps,
    currentStep,
}) => {
    const { colors, spacing, borderRadius } = useTheme();

    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const step = index + 1;
                const isActive = step === currentStep;

                return (
                    <View
                        key={index}
                        testID={`progress-dot-${step}`}
                        style={[
                            styles.dot,
                            {
                                backgroundColor: isActive ? colors.accent : colors.border,
                                width: isActive ? 24 : 8,
                                marginHorizontal: spacing.xs,
                                borderRadius: borderRadius.full,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
    },
});
