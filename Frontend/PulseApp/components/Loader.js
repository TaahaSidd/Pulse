// components/CloverLoader.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function CloverLoader({ size = 64, color = '#8CF364' }) {
    const progress = useSharedValue(0);

    React.useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 1200 }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        'worklet';
        const rotation = progress.value * 360; // 0 → 360 continuously
        return {
            transform: [{ rotate: `${rotation}deg` }],
        };
    });

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <AnimatedSvg
                style={animatedStyle}
                width="100%"
                height="100%"
                viewBox="0 0 176 175"
            >
                <G>
                    <Path d="M175.871 0L175.871 83.9334L120.422 83.9334C104.69 83.9334 91.9372 71.1805 91.9372 55.4489L91.9372 -3.66885e-06L175.871 0Z" fill={color} />
                    <Path d="M175.867 90.9551L175.867 154.889C175.867 165.934 166.913 174.889 155.867 174.889L91.9337 174.889L91.9337 90.9551L175.867 90.9551Z" fill={color} />
                    <Path d="M83.937 0.0214844L83.937 83.9549L0.00355926 83.9549L0.00356205 20.0215C0.00356254 8.97581 8.95787 0.0214811 20.0036 0.0214816L83.937 0.0214844Z" fill={color} />
                    <Path d="M55.449 90.9766C71.1806 90.9766 83.9336 103.73 83.9336 119.461L83.9336 174.91L0.00014129 174.91L0.000144958 90.9766L55.449 90.9766Z" fill={color} />
                </G>
            </AnimatedSvg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
