export const THEME = {
    spacing: {
        // Base 8px grid
        0: 0,
        1: 8,   // 8px
        2: 16,  // 16px  
        3: 24,  // 24px
        4: 32,  // 32px
        5: 40,  // 40px
        6: 48,  // 48px
        7: 56,  // 56px
        8: 64,  // 64px
        9: 72,  // 72px
        10: 80, // 80px
        11: 88, // 88px
        12: 96, // 96px

        // Named scales (8pt multiples)
        xxsmall: 8,
        xsmall: 16,
        small: 24,
        medium: 32,
        large: 40,
        xlarge: 48,
        xxlarge: 64,

        // UX Components (8pt grid aligned)
        screen: 16,      // Screen padding (2x8)
        card: 24,        // Card padding (3x8)  
        section: 32,     // Section gaps (4x8)
        gutter: 24,      // List gutters (3x8)
        button: 16,      // Button H padding (2x8)
        input: 16,       // Input padding (2x8)
        icon: 24,        // Icon spacing (3x8)
    },

    // 🔲 CORNER RADIUS (8pt grid + specific UX)
    borderRadius: {
        none: 0,
        xs: 4,      // 4px (micro)
        sm: 8,      // 8px (1x8)
        md: 12,     // 12px (button default)
        lg: 16,     // 16px (2x8, card default)
        xl: 24,     // 24px (3x8, prominent)
        '2xl': 32,  // 32px (4x8)
        full: 999,

        // UX Components
        button: 12,
        card: 16,
        input: 12,
        modal: 24,
        pill: 999,
        avatar: 999,
    },

    borderWidth: {
        none: 0,
        hairline: 0.5,
        thin: 1,      // ← ADD THIS
        medium: 1.5,
        thick: 2,
        heavy: 3,
    },


    // 📐 TOUCH TARGETS (44px min iOS spec = 5.5x8)
    sizes: {
        touchTarget: 48,      // 6x8 (44px iOS min)
        buttonHeight: {
            sm: 40,   // 5x8
            md: 48,   // 6x8  
            lg: 56,   // 7x8
        },
        inputHeight: {
            sm: 48,   // 6x8
            md: 56,   // 7x8
        },
        icon: {
            xs: 16,   // 2x8
            sm: 20,   // 2.5x8
            md: 24,   // 3x8
            lg: 32,   // 4x8
        },
        avatar: {
            xs: 32,   // 4x8
            sm: 40,   // 5x8
            md: 48,   // 6x8
            lg: 64,   // 8x8
        },
    },

    // 📏 TYPOGRAPHY (iOS Human Interface Guidelines aligned)
    fontSize: {
        micro: 12,    // Labels
        xs: 13,       // Caption
        sm: 15,       // Body
        base: 17,     // Body prominent  
        md: 17,
        lg: 19,       // Headline small
        xl: 22,       // Headline medium
        '2xl': 28,    // Headline large
        '3xl': 34,    // Headline xlarge
        '4xl': 45,    // Display small
    },

    // ⚖️ WEIGHTS (Standard scale)
    fontWeight: {
        thin: '100',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
    },

    // 🌑 SHADOWS (8pt offset progression)
    shadows: {
        none: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
        xs: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 },
        sm: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
        md: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
        lg: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 },
        xl: { shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 12 },
    },

    // 🎨 LAYOUT (8pt multiples)
    layout: {
        screenPadding: 16,        // 2x8
        headerHeight: 56,         // 7x8
        tabBarHeight: 80,         // 10x8  
        bottomSheetHandle: 24,    // 3x8 (width)
        listItemHeight: 72,       // 9x8
        cardMinHeight: 160,       // 20x8
        maxContentWidth: 640,     // 80x8
    },

    animation: {
        fastest: 100,
        fast: 200,      // 25x8
        normal: 300,    // 37.5x8
        slow: 400,      // 50x8
    },

    breakpoints: {
        phone: 375,
        tablet: 768,
        desktop: 1024,
    },

};

export const getSpacing = (scale) => THEME.spacing[scale] || scale;
export const getRadius = (scale) => THEME.borderRadius[scale] || scale;
export const getSize = (scale) => THEME.sizes[scale] || scale;

export const getResponsiveSpacing = (screenWidth, scale) => {
    const baseSpacing = getSpacing(scale);
    const multiplier = screenWidth > 768 ? 1.25 : 1;
    return Math.round(baseSpacing * multiplier / 8) * 8; // Always 8pt multiple
};

export const getScaledFontSize = (size, screenWidth) => {
    const baseWidth = 375;
    const scale = Math.min(Math.max(screenWidth / baseWidth, 0.85), 1.15);
    return Math.round(size * scale / 8) * 8 * 0.125; // Align to ~8pt rhythm
};
