import React, { useRef } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Animated,
    Easing,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import * as Haptics from 'expo-haptics';

const Button = ({
    title,
    onPress,
    variant = 'primary', // primary, secondary, outline, ghost, danger
    size = 'medium',    // small, medium, large
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    holdToTrigger = false, // If true, requires long press with animation
    holdDuration = 2000,   // Duration in ms
    style,
    textStyle
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    // --- HOLD TO FILL LOGIC ---
    const handlePressIn = () => {
        if (!holdToTrigger || disabled || loading) return;

        Animated.timing(animatedValue, {
            toValue: 1,
            duration: holdDuration,
            easing: Easing.linear,
            useNativeDriver: false, // Width animation requires false
        }).start(({ finished }) => {
            if (finished) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onPress?.();
                // Reset after a small delay so they see it reached 100%
                setTimeout(() => animatedValue.setValue(0), 200);
            }
        });
    };

    const handlePressOut = () => {
        if (!holdToTrigger) return;
        // Snap back to zero if released early
        Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    };

    // --- INTERPOLATIONS ---
    const progressWidth = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    // This ensures text remains readable as the background color fills up
    const dynamicTextColor = animatedValue.interpolate({
        inputRange: [0, 0.45, 0.46, 1],
        outputRange: [
            variant === 'danger' ? COLORS.error : (styles[`${variant}Text`]?.color || COLORS.white),
            variant === 'danger' ? COLORS.error : (styles[`${variant}Text`]?.color || COLORS.white),
            COLORS.white,
            COLORS.white
        ],
    });

    const renderIcon = () => {
        if (!icon) return null;

        let iconColor = COLORS.outerSpace;
        if (variant === 'outline' || variant === 'ghost') iconColor = COLORS.primary;
        if (variant === 'secondary') iconColor = COLORS.white;
        if (variant === 'danger') iconColor = COLORS.error;
        if (disabled) iconColor = COLORS.gray[400];

        const iconSize = size === 'small' ? 16 : size === 'large' ? 22 : 18;

        // Note: Icon color doesn't interpolate here for simplicity,
        // but it stays above the progress bar due to zIndex.
        return (
            <Ionicons
                name={icon}
                size={iconSize}
                color={iconColor}
                style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
            />
        );
    };

    // If holdToTrigger is enabled, we use TouchableWithoutFeedback to prevent standard tap interference
    const BaseButton = holdToTrigger ? TouchableWithoutFeedback : TouchableOpacity;

    return (
        <BaseButton
            onPress={!holdToTrigger ? onPress : undefined}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            <View style={[
                styles.button,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
                disabled && styles.disabled,
                style,
                { overflow: 'hidden' } // Clips the progress fill
            ]}>

                {/* PROGRESS FILL LAYER */}
                {holdToTrigger && (
                    <Animated.View style={[
                        styles.progressFill,
                        {
                            width: progressWidth,
                            backgroundColor: variant === 'danger' ? COLORS.error : COLORS.primary
                        }
                    ]} />
                )}

                {loading ? (
                    <ActivityIndicator
                        color={variant === 'primary' ? COLORS.outerSpace : COLORS.primary}
                        size="small"
                    />
                ) : (
                    <View style={styles.content}>
                        {iconPosition === 'left' && renderIcon()}

                        <Animated.Text style={[
                            styles.title,
                            styles[`${size}Text`],
                            styles[`${variant}Text`],
                            holdToTrigger && { color: dynamicTextColor }, // Apply animated color
                            disabled && styles.disabledText,
                            textStyle,
                        ]}>
                            {title}
                        </Animated.Text>

                        {iconPosition === 'right' && renderIcon()}
                    </View>
                )}
            </View>
        </BaseButton>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 18,
        position: 'relative',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2, // Keep content above the progress bar
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1,
    },

    // --- PULSE VARIANTS ---
    primary: {
        backgroundColor: COLORS.primary, // #8CF364
    },
    secondary: {
        backgroundColor: COLORS.outerSpace, // Deep Charcoal
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: COLORS.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(239, 68, 68, 0.3)',
    },

    // --- SIZES ---
    small: { paddingVertical: 10, paddingHorizontal: 16 },
    medium: { paddingVertical: 16, paddingHorizontal: 24 },
    large: { paddingVertical: 20, paddingHorizontal: 32 },

    disabled: {
        backgroundColor: COLORS.gray[200],
        borderColor: COLORS.gray[300],
    },
    fullWidth: { width: '100%' },

    // --- TYPOGRAPHY ---
    title: {
        fontFamily: FONTS.bold,
        letterSpacing: -0.2,
    },
    primaryText: { color: COLORS.outerSpace },
    secondaryText: { color: COLORS.white },
    outlineText: { color: COLORS.primary },
    ghostText: { color: COLORS.primary },
    dangerText: { color: COLORS.error },
    disabledText: { color: COLORS.gray[400] },

    smallText: { fontSize: 13 },
    mediumText: { fontSize: 16 },
    largeText: { fontSize: 18 },

    iconLeft: { marginRight: 8 },
    iconRight: { marginLeft: 8 },
});

export default Button;