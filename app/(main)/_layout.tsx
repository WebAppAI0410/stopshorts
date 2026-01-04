import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/contexts/ThemeContext';
import { t } from '../../src/i18n';

export default function MainLayout() {
    const { colors, typography } = useTheme();
    const insets = useSafeAreaInsets();

    // Account for Android navigation bar
    const bottomPadding = Math.max(insets.bottom, 12);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.borderSubtle,
                    borderTopWidth: 1,
                    height: 60 + bottomPadding,
                    paddingBottom: bottomPadding,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.textPrimary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.home'),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="statistics"
                options={{
                    title: t('tabs.stats'),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'stats-chart' : 'stats-chart-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="training"
                options={{
                    title: t('tabs.training'),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'book' : 'book-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: t('tabs.settings'),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'settings' : 'settings-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('tabs.profile'),
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="target-apps"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="theme-settings"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="goal-settings"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="alternative-settings"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="if-then-settings"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="urge-surfing-duration"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="intervention-settings"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="urge-surfing"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="intervention-practice"
                options={{
                    href: null,
                }}
            />
            {/* Hide shield from tab bar - it's a modal screen */}
            <Tabs.Screen
                name="shield"
                options={{
                    href: null,
                }}
            />
            {/* Hide training nested routes from tab bar - expo-router auto-discovers them */}
            <Tabs.Screen
                name="training/index"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="training/[topicId]"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
