import React, { useEffect } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/Colors';
import { THEME } from '../constants/Themes';
import { Easing } from 'react-native';


const AnimatedSwitch = ({
    value,
    onValueChange,
    trackColor = { false: '#E2E8F0', true: COLORS.primary },
    thumbColor = '#FFFFFF',
    size = 'normal',
    disabled = false,
    theme,
}) => {
    const translateX = React.useRef(new Animated.Value(value ? 22 : 0)).current;
    const scale = React.useRef(new Animated.Value(1)).current;

    // 🎬 PREMIUM SLOW EASE-IN-OUT ANIMATION
    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: value ? 22 : 0,
                duration: 280, // ✅ SLOW & DELIBERATE
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: value ? 1.03 : 0.97,
                duration: 280,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            })
        ]).start(() => {
            scale.setValue(1);
        });
    }, [value]);

    const handleToggle = () => {
        if (disabled) return;

        // Subtle press feedback
        Animated.sequence([
            Animated.timing(scale, {
                toValue: 0.94,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 1,
                duration: 120,
                useNativeDriver: true,
            })
        ]).start();

        onValueChange(!value);
    };

    const sizeConfig = {
        small: { width: 44, height: 24, thumb: 20 },
        normal: { width: 52, height: 28, thumb: 24 },
        large: { width: 60, height: 32, thumb: 28 }
    }[size] || { width: 52, height: 28, thumb: 24 };

    return (
        <TouchableOpacity
            style={[styles.container, { opacity: disabled ? 0.5 : 1 }]}
            onPress={handleToggle}
            activeOpacity={1}
            disabled={disabled}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
            {/* 🎯 SINGLE PERFECT TRACK */}
            <View
                style={[
                    styles.track,
                    {
                        width: sizeConfig.width,
                        height: sizeConfig.height,
                        borderRadius: sizeConfig.height / 2,
                        backgroundColor: value ? trackColor.true : trackColor.false,
                        borderColor: theme?.border || (value ? '#B794FF' : '#D1D5DB'),
                        borderWidth: value ? 1.8 : 1.2,
                    }
                ]}
            />

            {/* ✨ FLAWLESS THUMB ALIGNMENT */}
            <Animated.View
                style={[
                    styles.thumb,
                    {
                        width: sizeConfig.thumb,
                        height: sizeConfig.thumb,
                        borderRadius: sizeConfig.thumb / 2 - 0.5,
                        backgroundColor: thumbColor,
                        top: (sizeConfig.height - sizeConfig.thumb) / 2,
                        left: 1.5, // ✅ PERFECT LEFT OFFSET
                        transform: [{ translateX }, { scale }]
                    }
                ]}
            />
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    container: {
        width: 52,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    track: {
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    thumb: {
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 6,
        borderWidth: 2,
        borderColor: '#F8FAFC',
    },
});

export default AnimatedSwitch;
