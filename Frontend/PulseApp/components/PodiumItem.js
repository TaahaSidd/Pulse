import React from 'react';
import { StyleSheet, View, Text, Animated, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../constants/Fonts';
import { useAnimations } from '../hooks/useAnimations';

const { width } = Dimensions.get('window');

const RankedPillar = ({ item, rank, theme, onPress, index }) => {
    const { useBouncyPress, useListEntry } = useAnimations();

    // 1. Staggered Entry Animation (delayed based on rank/index)
    // We use a slightly longer delay (150ms) for a more elegant entrance
    const { translateY, opacity } = useListEntry(index * 150);

    // 2. Tap Interaction Animation
    const { scale, pressIn, pressOut } = useBouncyPress();

    // Rank 1 is the hero, Rank 2/3 provide the support
    const heightMap = { 1: 135, 2: 100, 3: 85 };
    const pillarColor = item.color || theme.primary;
    const isFirst = rank === 1;

    return (
        <TouchableWithoutFeedback
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={onPress}
        >
            <Animated.View style={[
                styles.pillarColumn,
                {
                    opacity,
                    transform: [
                        { translateY },
                        { scale }
                    ]
                }
            ]}>
                {/* Amount text with slight transparency for 2nd and 3rd place */}
                <Text style={[
                    styles.amountText,
                    {
                        color: theme.text,
                        fontFamily: isFirst ? FONTS.bold : FONTS.semiBold,
                        opacity: isFirst ? 1 : 0.7
                    }
                ]}>
                    ₹{Math.round(item.amount).toLocaleString()}
                </Text>

                <View style={[
                    styles.pillar,
                    {
                        height: heightMap[rank],
                        backgroundColor: pillarColor,
                        borderRadius: 20,
                        // Glow/Shadow effect exclusively for the #1 spot
                        shadowColor: pillarColor,
                        shadowOffset: { width: 0, height: isFirst ? 8 : 0 },
                        shadowOpacity: isFirst ? 0.4 : 0,
                        shadowRadius: 12,
                        elevation: isFirst ? 8 : 0,
                    }
                ]}>
                    {/* Floating Icon Circle */}
                    <View style={[styles.iconCircle, {
                        backgroundColor: 'rgba(255,255,255,0.15)'
                    }]}>
                        <Ionicons
                            name={item.icon || 'receipt-outline'}
                            size={isFirst ? 26 : 22}
                            color="white"
                        />
                    </View>

                    {/* Minimalist circular rank badge */}
                    <View style={[styles.rankBadge, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                        <Text style={[styles.rankBadgeText, { color: pillarColor }]}>
                            {rank}
                        </Text>
                    </View>
                </View>

                {/* Label text - Bold for #1, Medium for others */}
                <Text
                    numberOfLines={1}
                    style={[
                        styles.nameText,
                        {
                            color: theme.text,
                            fontFamily: isFirst ? FONTS.bold : FONTS.medium,
                            fontSize: isFirst ? 12 : 11
                        }
                    ]}
                >
                    {item.name}
                </Text>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

export const TopThreeRanking = ({ data, theme, onSelect }) => {
    // Basic safety check
    if (!data || data.length < 3) return null;

    return (
        <View style={[styles.rankingContainer, { backgroundColor: theme.card + '60', borderColor: theme.border }]}>
            {/* Podium arrangement: 
                Left: Rank 2 (index 1)
                Middle: Rank 1 (index 0)
                Right: Rank 3 (index 2)
            */}
            <RankedPillar index={1} item={data[1]} rank={2} theme={theme} onPress={() => onSelect(data[1])} />
            <RankedPillar index={0} item={data[0]} rank={1} theme={theme} onPress={() => onSelect(data[0])} />
            <RankedPillar index={2} item={data[2]} rank={3} theme={theme} onPress={() => onSelect(data[2])} />
        </View>
    );
};

const styles = StyleSheet.create({
    rankingContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        marginVertical: 16,
        marginHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 32,
        borderWidth: 1,
    },
    pillarColumn: {
        width: (width - 100) / 3,
        alignItems: 'center',
    },
    pillar: {
        width: '90%', // Slightly narrower than the column for better spacing
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    rankBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    rankBadgeText: {
        fontSize: 11,
        fontFamily: FONTS.bold,
    },
    amountText: {
        fontSize: 11,
        marginBottom: 10
    },
    nameText: {
        marginTop: 12,
        textAlign: 'center',
        paddingHorizontal: 4
    },
});