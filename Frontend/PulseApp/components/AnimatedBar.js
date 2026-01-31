import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
} from 'react-native-reanimated';
import { COLORS } from '../constants/Colors';

const AnimatedBar = ({ height, color, delay = 0, maxHeight = 100 }) => {
    const animatedHeight = useSharedValue(0);

    useEffect(() => {
        // Animate with delay for stagger effect
        animatedHeight.value = withDelay(
            delay,
            withSpring(height, {
                damping: 12,
                stiffness: 100,
            })
        );
    }, [height]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: animatedHeight.value,
        };
    });

    return (
        <View style={[styles.barContainer, { height: maxHeight }]}>
            <Animated.View
                style={[
                    styles.bar,
                    animatedStyle,
                    { backgroundColor: color },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    barContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: 14,
        borderRadius: 7,
    },
});

export default AnimatedBar;