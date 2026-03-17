// constants/Colors.js

export const COLORS = {
    // Primary Brand Colors (The "Pulse" Identity) - EMERALD GREEN
    primary: '#10B981',           // ← Changed from #8CF364
    primaryDark: '#059669',       // Darker emerald
    primaryLight: '#34D399',      // Lighter emerald  
    primaryLighter: '#6EE7B7',    // Even lighter
    primaryLightest: '#D1FAE5',   // Lightest emerald tint


    // Secondary & Accent
    secondary: '#6366F1',
    secondaryDark: '#4F46E5',
    secondaryLight: '#818CF8',
    accent: '#FFB800',
    accentDark: '#E6A500',
    accentLight: '#FFC933',


    // Semantic Colors (Feedback)
    success: '#10B981',           // ← Matches primary
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    danger: '#FF3B30',


    // Neutral Palette
    white: '#FFFFFF',
    offWhite: '#FAF9F6',
    black: '#000000',
    outerSpace: '#252525',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },


    // Mode Specific: DARK
    dark: {
        bg: '#252525',
        bgElevated: '#2E2E2E',
        card: '#303030',
        cardElevated: '#3A3A3A',
        border: '#404040',
        divider: '#4A4A4A',
        text: '#FAF9F6',
        textSecondary: '#E0E0E0',
        textTertiary: 'rgba(224, 224, 224, 0.6)',
        overlay: 'rgba(0, 0, 0, 0.6)',
    },


    // Mode Specific: LIGHT
    light: {
        bg: '#FAF9F6',
        bgElevated: '#FFFFFF',
        card: '#FFFFFF',
        cardElevated: '#F5F5F5',
        border: '#E5E5E5',
        divider: '#EFEFEF',
        text: '#252525',
        textSecondary: '#4A4A4A',
        textTertiary: '#6B6B6B',
        overlay: 'rgba(37, 37, 37, 0.3)',
    },


    // Gradients - Updated for Emerald
    gradients: {
        primary: ['#10B981', '#059669'],      // ← Emerald gradient
        greenGlow: ['#10B981', '#34D399'],    // ← Emerald glow
        sunset: ['#FF6B6B', '#FFE66D'],
        darkToLight: ['#252525', '#3A3A3A'],
    },
};


export const getThemedColors = (isDarkMode) => {
    const theme = isDarkMode ? COLORS.dark : COLORS.light;
    return {
        ...theme,
        primary: COLORS.primary,
        primaryDark: COLORS.primaryDark,
        primaryLight: COLORS.primaryLight,
        success: COLORS.success,
        error: COLORS.error,
        warning: COLORS.warning,
        info: COLORS.info,
        gradients: COLORS.gradients,
    };
};
