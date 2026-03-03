import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/Colors';

const CustomSwitch = ({ value, onValueChange, activeColor = COLORS.primary, isDarkMode }) => {
    // Animation value: 0 for off, 1 for on
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: false, // Color and positioning don't support native driver well
        }).start();
    }, [value]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22], // Distance the thumb moves
    });

    const backgroundColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [isDarkMode ? '#334155' : '#E2E8F0', activeColor],
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onValueChange(!value)}
        >
            <Animated.View style={[styles.track, { backgroundColor }]}>
                <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 46,
        height: 26,
        borderRadius: 13,
        padding: 2,
        justifyContent: 'center',
    },
    thumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        // Minimal shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2.5,
        elevation: 3,
    },
});

export default CustomSwitch;