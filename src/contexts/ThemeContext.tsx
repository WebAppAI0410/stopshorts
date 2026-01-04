/**
 * ThemeContext - Application Theme Management
 *
 * Provides theme configuration (light/dark/system) across the app.
 * Persists user preference to AsyncStorage.
 *
 * @example
 * ```tsx
 * // In app root
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // In components
 * function MyComponent() {
 *   const { colors, isDark, setThemeMode } = useTheme();
 *   return <View style={{ backgroundColor: colors.background }} />;
 * }
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, Theme, Typography, Spacing, BorderRadius } from '../design/theme';

/** Theme mode options */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Valid theme modes for type guard */
const VALID_THEME_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];

/**
 * Type guard to validate theme mode from storage
 */
function isValidThemeMode(value: unknown): value is ThemeMode {
    return typeof value === 'string' && VALID_THEME_MODES.includes(value as ThemeMode);
}

/** Theme context value interface */
interface ThemeContextType {
    /** Current theme mode setting */
    themeMode: ThemeMode;
    /** Update theme mode (persists to storage) */
    setThemeMode: (mode: ThemeMode) => void;
    /** Current color palette based on theme */
    colors: Theme;
    /** Typography configuration */
    typography: Typography;
    /** Spacing values */
    spacing: Spacing;
    /** Border radius values */
    borderRadius: BorderRadius;
    /** Whether dark mode is currently active */
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@stopshorts_theme_mode';

/**
 * Theme Provider Component
 * Wraps the app to provide theme context to all children.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    // Default to dark mode for this app's design aesthetic
    const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                // Validate stored value before using
                if (isValidThemeMode(savedMode)) {
                    setThemeModeState(savedMode);
                }
            } catch (e) {
                if (__DEV__) {
                    console.error('Failed to load theme mode', e);
                }
            }
        };
        loadTheme();
    }, []);

    const setThemeMode = async (mode: ThemeMode) => {
        try {
            setThemeModeState(mode);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (e) {
            if (__DEV__) {
                console.error('Failed to save theme mode', e);
            }
        }
    };

    const isDark = themeMode === 'system'
        ? systemColorScheme === 'dark'
        : themeMode === 'dark';

    const currentColors = isDark ? theme.dark : theme.light;

    const value = useMemo(() => ({
        themeMode,
        setThemeMode,
        colors: currentColors,
        typography: theme.typography,
        spacing: theme.spacing,
        borderRadius: theme.borderRadius,
        isDark,
    }), [themeMode, currentColors, isDark]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Hook to access theme context
 * @throws Error if used outside of ThemeProvider
 * @returns Theme context value
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
