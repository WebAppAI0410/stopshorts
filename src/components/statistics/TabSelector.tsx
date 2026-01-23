import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
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
    const { colors, typography, spacing, borderRadius, isDark } = useTheme();
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

    // Glassmorphism styling
    const glassBackground = colors.glassBackgroundLight;
    const glassBorder = colors.glassBorderLight;

    const tabContent = (
        <>
            {containerWidth > 0 && (
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            backgroundColor: colors.successMuted,
                            borderRadius: borderRadius.md,
                            width: containerWidth / 2,
                            // Glow effect on indicator
                            shadowColor: colors.accent,
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: isDark ? 0.5 : 0.3,
                            shadowRadius: 8,
                            elevation: 4,
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
                            color: selectedTab === 'day' ? colors.accent : colors.textMuted,
                            fontWeight: selectedTab === 'day' ? '600' : '400',
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
                            color: selectedTab === 'week' ? colors.accent : colors.textMuted,
                            fontWeight: selectedTab === 'week' ? '600' : '400',
                        },
                    ]}
                >
                    {t('statistics.week')}
                </Text>
            </Pressable>
        </>
    );

    return (
        <View
            style={[
                styles.outerContainer,
                {
                    // Subtle glow on the container
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: isDark ? 0.1 : 0.05,
                    shadowRadius: 12,
                    elevation: 2,
                },
            ]}
        >
            {Platform.OS === 'ios' ? (
                <BlurView
                    intensity={30}
                    tint={isDark ? 'dark' : 'light'}
                    style={[
                        styles.container,
                        {
                            borderRadius: borderRadius.lg,
                            borderWidth: 1,
                            borderColor: glassBorder,
                            padding: spacing.xs,
                        },
                    ]}
                    onLayout={handleLayout}
                    accessibilityRole="tablist"
                >
                    {tabContent}
                </BlurView>
            ) : (
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: glassBackground,
                            borderRadius: borderRadius.lg,
                            borderWidth: 1,
                            borderColor: glassBorder,
                            padding: spacing.xs,
                        },
                    ]}
                    onLayout={handleLayout}
                    accessibilityRole="tablist"
                >
                    {tabContent}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        alignSelf: 'center',
        borderRadius: 12,
        overflow: 'hidden',
    },
    container: {
        flexDirection: 'row',
        position: 'relative',
        height: 44,
        minWidth: 160,
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
        paddingHorizontal: 24,
    },
});
