import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const BudgetSummaryCard = ({
    theme,
    budget,
    expenses,
    monthLabel,
    isPastMonth,
    onPressSetBudget,
    onPressCard,
}) => {
    const percentage = budget > 0 ? (expenses / budget) * 100 : 0;
    const clamped = Math.min(Math.max(percentage, 0), 150);
    const overBudget = percentage > 100;

    const size = 72;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(clamped, 100);
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const primaryColor = overBudget ? COLORS.error : COLORS.primary;

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={onPressCard || undefined}
        >
            {/* Left: Text side */}
            <View style={styles.left}>
                <Text style={[styles.label, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                    Monthly Budget
                </Text>

                <Text
                    style={[
                        styles.amount,
                        { color: theme.text, fontFamily: FONTS.bold },
                    ]}
                    numberOfLines={1}
                >
                    {budget > 0
                        ? `₹${expenses.toLocaleString()} / ₹${budget.toLocaleString()}`
                        : 'Not set'}
                </Text>

                {budget > 0 ? (
                    <Text style={[styles.subLabel, {
                        color: overBudget ? COLORS.error : theme.textTertiary,
                        fontFamily: FONTS.regular,
                    }]}>
                        {Math.round(percentage)}% used
                    </Text>
                ) : isPastMonth ? (
                    <Text style={[styles.subLabel, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                        No budget set  {monthLabel}
                    </Text>
                ) : (
                    <TouchableOpacity onPress={onPressSetBudget} activeOpacity={0.7}>
                        <Text style={[styles.setBudgetLink, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
                            + Set budget  {monthLabel}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Right: Donut */}
            <View style={styles.right}>
                <View style={[styles.donutContainer, { backgroundColor: theme.card }]}>
                    <Svg width={size} height={size}>
                        {/* Track */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={theme.border}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        {/* Progress */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={primaryColor}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            rotation="-90"
                            origin={`${size / 2}, ${size / 2}`}
                        />
                    </Svg>

                    {/* Center text */}
                    <View style={styles.donutCenter}>
                        <Text
                            style={[
                                styles.donutPercent,
                                { color: theme.text, fontFamily: FONTS.semiBold },
                            ]}
                        >
                            {budget > 0 ? Math.round(percentage) : 0}%
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    left: {
        flex: 1,
        paddingRight: 12,
    },
    right: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: FONT_SIZES.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    amount: {
        fontSize: FONT_SIZES.base,
        marginBottom: 4,
    },
    subLabel: {
        fontSize: FONT_SIZES.xs,
    },
    setBudgetLink: {
        fontSize: FONT_SIZES.xs,
        marginTop: 4,
    },
    donutContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutCenter: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    donutPercent: {
        fontSize: FONT_SIZES.sm,
    },
});

export default BudgetSummaryCard;
