import React, { useRef } from 'react';
import { Pressable, StyleSheet, Animated, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { ANIMATIONS } from '../constants/Animations'; // Using your new constants

const AddButton = ({ onPress, style, label = "" }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.95, // Using your TAP_SCALE logic
                ...ANIMATIONS.SPRING.BOUNCY,
                useNativeDriver: true,
            }),
            Animated.spring(rotateAnim, {
                toValue: 1,
                ...ANIMATIONS.SPRING.SNAPPY,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                ...ANIMATIONS.SPRING.BOUNCY,
                useNativeDriver: true,
            }),
            Animated.spring(rotateAnim, {
                toValue: 0,
                ...ANIMATIONS.SPRING.SNAPPY,
                useNativeDriver: true,
            })
        ]).start();
    };

    // Full 360 degree rotation
    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={[
            styles.wrapper,
            { transform: [{ scale: scaleAnim }] },
            style
        ]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={({ pressed }) => [
                    styles.container,
                    {
                        backgroundColor: COLORS.primary,
                        // Using a subtle opacity shift instead of a harsh color change
                        opacity: pressed ? 0.9 : 1,
                    }
                ]}
            >
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <Ionicons
                        name="add"
                        size={22}
                        color="#FFFFFF"
                    />
                </Animated.View>

                {label !== "" && <Text style={styles.buttonText}>{label}</Text>}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: 'center',
        // Ensure shadow isn't clipped
        overflow: 'visible',
    },
    container: {
        height: 38,// Balanced height for a "long rect"
        paddingHorizontal: 14, //reates the elongated look
        flexDirection: 'row',
        borderRadius: 18, // More "Rect" than "Pill"
        justifyContent: 'center',
        alignItems: 'center',
        // Brand-colored glow shadow
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800', // Heavy weight for premium feel
        marginLeft: 6,
        letterSpacing: 0.5,
        textTransform: 'uppercase', // Optional: looks very "pro" in long rects
    }
});

export default AddButton;