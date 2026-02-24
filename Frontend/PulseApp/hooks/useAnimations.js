// hooks/useAnimations.js
import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { ANIMATIONS } from '../constants/Animations';

export const useAnimations = () => {
    // 🎾 Bouncy Press (tap feedback)
    const useBouncyPress = () => {
        const scale = useRef(new Animated.Value(1)).current;

        const animatePress = (isPressing) => {
            Animated.spring(scale, {
                toValue: isPressing ? 0.95 : 1,
                tension: ANIMATIONS.SPRING.BOUNCY.tension,
                friction: ANIMATIONS.SPRING.BOUNCY.friction,
                useNativeDriver: true,
            }).start();
        };

        return {
            scale,
            pressIn: () => animatePress(true),
            pressOut: () => animatePress(false)
        };
    };

    // 📱 List Entry (staggered slide-up)
    const useListEntry = (delay = 0) => {
        const translateY = useRef(new Animated.Value(ANIMATIONS.RANGES.SLIDE_UP[0])).current;
        const opacity = useRef(new Animated.Value(ANIMATIONS.RANGES.FADE_IN[0])).current;

        useEffect(() => {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: ANIMATIONS.RANGES.SLIDE_UP[1],
                    ...ANIMATIONS.SPRING.FLOATY,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.spring(opacity, {
                    toValue: ANIMATIONS.RANGES.FADE_IN[1],
                    ...ANIMATIONS.SPRING.FLOATY,
                    delay,
                    useNativeDriver: true,
                })
            ]).start();
        }, [delay]);

        return { translateY, opacity };
    };

    // 🪄 Modal Slide (bottom sheet style)
    const useModalSlide = (isVisible) => {
        const slideY = useRef(new Animated.Value(100)).current;

        useEffect(() => {
            Animated.spring(slideY, {
                toValue: isVisible ? 0 : 100,
                ...ANIMATIONS.SPRING.SNAPPY,
                useNativeDriver: true,
            }).start();
        }, [isVisible]);

        return slideY;
    };

    return {
        useBouncyPress,
        useListEntry,
        useModalSlide,
    };
};
