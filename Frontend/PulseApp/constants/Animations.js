// constants/Animations.js
export const ANIMATIONS = {
    SPRING: {
        BOUNCY: { tension: 320, friction: 5.5 },    // Tap/press (Super Money feel)
        SNAPPY: { tension: 450, friction: 4.8 },    // Modals, icons
        FLOATY: { tension: 220, friction: 8.2 },    // Lists, cards entry
        GENTLE: { tension: 160, friction: 11 },     // Backgrounds, subtle
    },

    // ⏱️ TIMING (for fade/delay)
    TIMING: {
        FASTEST: 120,
        FAST: 180,
        NORMAL: 280,
        SLOW: 420,
    },

    // 🎯 TRANSFORM RANGES
    RANGES: {
        TAP_SCALE: [1, 0.95, 1],
        SLIDE_UP: [25, 0],
        FADE_IN: [0, 1],
        ROTATE: [0, 360],
    },

    // 🎨 DEFAULTS
    DEFAULTS: {
        useNativeDriver: true,
        delay: 0,
    }
};
