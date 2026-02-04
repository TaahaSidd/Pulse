import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const SegmentedFilter = ({ options, activeFilter, onSelect, theme }) => {
    // 1. Setup Animation Reference
    const translateX = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = useState(0);
    
    // 2. Calculate Pill Width
    const segmentWidth = containerWidth ? (containerWidth - 12) / options.length : 0; // 12 is container padding (6*2)

    useEffect(() => {
        const activeIndex = options.indexOf(activeFilter);
        Animated.spring(translateX, {
            toValue: activeIndex * segmentWidth,
            useNativeDriver: true,
            bounciness: 4, // Adds a slight premium "snap"
            speed: 12,
        }).start();
    }, [activeFilter, segmentWidth]);

    return (
        <View 
            style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
            {/* 3. The Sliding Pill */}
            {containerWidth > 0 && (
                <Animated.View
                    style={[
                        styles.activePill,
                        {
                            width: segmentWidth,
                            backgroundColor: COLORS.primary,
                            transform: [{ translateX }],
                        },
                    ]}
                />
            )}

            {options.map((option) => {
                const isActive = activeFilter === option;
                return (
                    <TouchableOpacity
                        key={option}
                        onPress={() => onSelect(option)}
                        activeOpacity={0.9}
                        style={styles.segment}
                    >
                        <Text style={[
                            styles.text,
                            {
                                color: isActive ? '#000' : theme.textTertiary,
                                fontFamily: isActive ? FONTS.bold : FONTS.semiBold
                            }
                        ]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 54,
        borderRadius: 16,
        padding: 6,
        flex: 1,
        borderWidth: 1,
        position: 'relative', // Necessary for absolute pill positioning
    },
    segment: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2, // Ensures text stays above the sliding pill
    },
    activePill: {
        position: 'absolute',
        top: 6,
        bottom: 6,
        left: 6,
        borderRadius: 12,
        // Chonky shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    text: {
        fontSize: 14,
        letterSpacing: 0.3
    },
});

export default SegmentedFilter;