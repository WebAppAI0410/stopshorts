import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { t } from '../../i18n';
import { useTheme } from '../../contexts/ThemeContext';

export interface TabSelectorProps {
    selectedTab: 'day' | 'week';
    onTabChange: (tab: 'day' | 'week') => void;
}

const SPRING_CONFIG = {
    damping: 20,
    stiffness: 200,
};

export function TabSelector({ selectedTab, onTabChange }: TabSelectorProps) {
    const { colors, typography, spacing, borderRadius } = useTheme();
    const [containerWidth, setContainerWidth] = useState(0);

    const indicatorPosition = useSharedValue(selectedTab === 'day' ? 0 : 1);

    React.useEffect(() => {
        indicatorPosition.value = withSpring(
            selectedTab === 'day' ? 0 : 1,
            SPRING_CONFIG
        );
    }, [selectedTab, indicatorPosition]);

    const animatedIndicatorStyle = useAnimatedStyle(() => {
        const tabWidth = containerWidth / 2;
        return {
            transform: [{ translateX: indicatorPosition.value * tabWidth }],
        };
    });

    const handleTabPress = (tab: 'day' | 'week') => {
        if (tab !== selectedTab) {
            onTabChange(tab);
        }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width - spacing.xs * 2);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    padding: spacing.xs,
                },
            ]}
            onLayout={handleLayout}
            accessibilityRole="tablist"
        >
            {containerWidth > 0 && (
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            backgroundColor: colors.backgroundCard,
                            borderRadius: borderRadius.md,
                            width: containerWidth / 2,
                        },
                        animatedIndicatorStyle,
                    ]}
                />
            )}
            <Pressable
                style={styles.tab}
                onPress={() => handleTabPress('day')}
                accessibilityRole="tab"
                accessibilityState={{ selected: selectedTab === 'day' }}
                accessibilityLabel={t('statistics.day')}
            >
                <Text
                    style={[
                        typography.button,
                        {
                            color: selectedTab === 'day' ? colors.textPrimary : colors.textMuted,
                        },
                    ]}
                >
                    {t('statistics.day')}
                </Text>
            </Pressable>
            <Pressable
                style={styles.tab}
                onPress={() => handleTabPress('week')}
                accessibilityRole="tab"
                accessibilityState={{ selected: selectedTab === 'week' }}
                accessibilityLabel={t('statistics.week')}
            >
                <Text
                    style={[
                        typography.button,
                        {
                            color: selectedTab === 'week' ? colors.textPrimary : colors.textMuted,
                        },
                    ]}
                >
                    {t('statistics.week')}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        position: 'relative',
        height: 44,
    },
    indicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        width: '50%',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
});
