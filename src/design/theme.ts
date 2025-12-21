/**
 * Design System Theme Definitions
 * Dark Glassmorphism UI - StopShorts
 */

export const palette = {
    // Dark backgrounds
    dark: {
        900: '#0D1117', // Deepest background
        800: '#161B22', // Card backgrounds
        700: '#1C2128', // Elevated surfaces
        600: '#21262D', // Borders, dividers
        500: '#30363D', // Subtle borders
    },
    // Light backgrounds (Ink & Paper theme)
    light: {
        50: '#FAFAFA',   // Deepest background (paper white)
        100: '#F5F5F4',  // Card backgrounds (warm paper)
        200: '#E7E5E4',  // Elevated surfaces
        300: '#D6D3D1',  // Borders, dividers
        400: '#A8A29E',  // Subtle borders
    },
    // Emerald/Teal accents (primary)
    emerald: {
        500: '#10B981', // Primary green
        400: '#34D399', // Light green
        300: '#6EE7B7', // Lighter
        600: '#059669', // Darker for light mode
        glow: 'rgba(16, 185, 129, 0.4)', // For glow effects
        glowLight: 'rgba(16, 185, 129, 0.2)', // Subtle glow for light mode
    },
    // Teal/Cyan for gradients
    teal: {
        500: '#14B8A6',
        400: '#2DD4BF',
        600: '#0D9488', // Darker for light mode
    },
    // Purple/Violet for gradients
    purple: {
        500: '#8B5CF6',
        400: '#A78BFA',
        300: '#C4B5FD',
    },
    // Text colors (dark mode)
    text: {
        primary: '#F0F6FC',
        secondary: '#8B949E',
        muted: '#9AA0AD',
        inverse: '#0D1117',
    },
    // Text colors (light mode - ink colors)
    textLight: {
        primary: '#1C1917',   // Stone 900 - deep ink
        secondary: '#57534E', // Stone 600
        muted: '#78716C',     // Stone 500
        inverse: '#FAFAFA',   // Light for dark backgrounds
    },
    // Semantic
    orange: {
        500: '#F97316', // Streak fire color
        400: '#FB923C',
        600: '#EA580C', // Darker for light mode
    },
    red: {
        500: '#EF4444',
        400: '#F87171',
        600: '#DC2626', // Darker for light mode
    },
};

export const typography = {
    // Hero stats (large numbers)
    hero: {
        fontSize: 64,
        fontWeight: '800' as const,
        letterSpacing: -2,
        lineHeight: 64,
    },
    // Large stat
    statLarge: {
        fontSize: 48,
        fontWeight: '700' as const,
        letterSpacing: -1,
        lineHeight: 52,
    },
    // Headings
    h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -1, lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: '600' as const, letterSpacing: -0.5, lineHeight: 32 },
    h3: { fontSize: 18, fontWeight: '600' as const, letterSpacing: -0.3, lineHeight: 24 },

    // Body
    bodyLarge: { fontSize: 17, fontWeight: '400' as const, lineHeight: 26 },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 24 },
    bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 20 },

    // Labels
    label: {
        fontSize: 12,
        fontWeight: '600' as const,
        letterSpacing: 0.5,
    },

    // Caption
    caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 0.2 },

    // Overline
    overline: {
        fontSize: 11,
        fontWeight: '600' as const,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
    },

    // Button
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
        letterSpacing: 0.3,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    gutter: 20,
};

export const borderRadius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
};

// Glass effect styles
export const glassEffect = {
    // Dark mode glass
    card: {
        backgroundColor: 'rgba(22, 27, 34, 0.8)',
        borderColor: 'rgba(48, 54, 61, 0.6)',
        borderWidth: 1,
    },
    cardSolid: {
        backgroundColor: palette.dark[800],
        borderColor: palette.dark[500],
        borderWidth: 1,
    },
    // Light mode glass
    cardLight: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: 'rgba(214, 211, 209, 0.6)',
        borderWidth: 1,
    },
    cardSolidLight: {
        backgroundColor: palette.light[100],
        borderColor: palette.light[300],
        borderWidth: 1,
    },
};

// Gradient definitions for charts/UI
export const gradients = {
    primary: [palette.emerald[500], palette.teal[500]],
    secondary: [palette.teal[500], palette.purple[500]],
    accent: [palette.emerald[400], palette.emerald[500]],
    bar: [palette.purple[400], palette.teal[400], palette.emerald[400]],
};

export const darkTheme = {
    // Backgrounds
    background: palette.dark[900],
    backgroundCard: palette.dark[800],
    backgroundCardGlass: 'rgba(22, 27, 34, 0.7)',
    surface: palette.dark[700],
    backgroundElevated: palette.dark[700],

    // Text
    textPrimary: palette.text.primary,
    textSecondary: palette.text.secondary,
    textMuted: palette.text.muted,
    textInverse: palette.text.inverse,

    // Accents
    primary: palette.emerald[500],
    primaryLight: palette.emerald[400],
    accent: palette.emerald[500],
    accentLight: palette.emerald[300],
    accentGlow: palette.emerald.glow,
    accentMuted: 'rgba(16, 185, 129, 0.15)',

    // Gradients
    gradientStart: palette.emerald[500],
    gradientEnd: palette.teal[500],

    // Semantic
    success: palette.emerald[500],
    warning: palette.orange[500],
    error: palette.red[500],
    streak: palette.orange[500],

    // Borders
    border: palette.dark[500],
    borderSubtle: palette.dark[600],

    // Special
    shieldGlow: 'rgba(16, 185, 129, 0.3)',
    cardGlow: 'rgba(16, 185, 129, 0.15)',
};

// Light theme - Ink & Paper design
export const lightTheme = {
    // Backgrounds
    background: palette.light[50],
    backgroundCard: palette.light[100],
    backgroundCardGlass: 'rgba(245, 245, 244, 0.8)',
    surface: palette.light[200],
    backgroundElevated: '#FFFFFF',

    // Text
    textPrimary: palette.textLight.primary,
    textSecondary: palette.textLight.secondary,
    textMuted: palette.textLight.muted,
    textInverse: palette.textLight.inverse,

    // Accents (slightly darker for better contrast on light backgrounds)
    primary: palette.emerald[600],
    primaryLight: palette.emerald[500],
    accent: palette.emerald[600],
    accentLight: palette.emerald[400],
    accentGlow: palette.emerald.glowLight,
    accentMuted: 'rgba(16, 185, 129, 0.1)',

    // Gradients
    gradientStart: palette.emerald[500],
    gradientEnd: palette.teal[500],

    // Semantic
    success: palette.emerald[600],
    warning: palette.orange[600],
    error: palette.red[600],
    streak: palette.orange[500],

    // Borders
    border: palette.light[300],
    borderSubtle: palette.light[200],

    // Special
    shieldGlow: 'rgba(16, 185, 129, 0.2)',
    cardGlow: 'rgba(16, 185, 129, 0.1)',
};

export type Theme = typeof darkTheme;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;

export const theme = {
    light: lightTheme,
    dark: darkTheme,
    typography,
    spacing,
    borderRadius,
    gradients,
    glassEffect,
};
