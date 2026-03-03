import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const BudgetDetailedCard = ({
    totalSpent,
    budgetAmount,
    spentPercentage,
    daysRemaining,
    dailyBurnRate,
    theme,
    isOverBudget,
    isWarning
}) => {
    // We still use this for the icons and the tiny progress bar
    const statusColor = isOverBudget ? COLORS.error : isWarning ? '#FF9500' : COLORS.primary;

    return (
        <View style={[
            styles.compactCard,
            {
                backgroundColor: theme.cardElevated,
                // Removed status color border, using standard theme border or none
                borderColor: theme.border,
                borderWidth: 1
            }
        ]}>
            <View style={styles.cardMainRow}>
                {/* Left Side: Large Spending Figure */}
                <View style={styles.spendingInfo}>
                    <Text style={[styles.compactLabel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                        TOTAL SPENT
                    </Text>
                    <Text style={[styles.compactAmount, { color: theme.text, fontFamily: FONTS.bold }]}>
                        ₹{totalSpent.toLocaleString()}
                    </Text>

                    <View style={styles.spendingFooter}>
                        <Text style={[styles.ofLabel, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                            of ₹{budgetAmount.toLocaleString()} Budget
                        </Text>
                    </View>
                </View>

                {/* Right Side: Days Left Indicator */}
                <View style={[styles.daysContainer, { backgroundColor: theme.bg + '50' }]}>
                    <Text style={[styles.daysNumber, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {daysRemaining}
                    </Text>
                    <Text style={[styles.daysLabel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                        DAYS LEFT
                    </Text>
                    <View style={styles.microBarContainer}>
                        <View style={[
                            styles.microBarFill,
                            {
                                width: `${Math.min(spentPercentage, 100)}%`,
                                backgroundColor: statusColor
                            }
                        ]} />
                    </View>
                </View>
            </View>

            {/* Bottom Row: Quick Stats */}
            <View style={[styles.compactStatsGrid, { borderTopColor: theme.border, borderTopWidth: 1 }]}>
                <View style={styles.compactStatItem}>
                    <Ionicons name="trending-down" size={14} color={COLORS.primary} />
                    <Text style={[styles.compactStatText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                        Left: <Text style={{ color: theme.text, fontFamily: FONTS.bold }}>₹{Math.max(0, budgetAmount - totalSpent).toLocaleString()}</Text>
                    </Text>
                </View>
                <View style={styles.compactStatItem}>
                    <Ionicons name="flash" size={14} color="#F59E0B" />
                    <Text style={[styles.compactStatText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                        Daily: <Text style={{ color: theme.text, fontFamily: FONTS.bold }}>₹{dailyBurnRate.toFixed(0)}</Text>
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    compactCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        marginTop: 10,
    },
    cardMainRow: {
        flexDirection: 'row',
        padding: 24, // Slightly more padding for the cleaner look
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    spendingInfo: { flex: 1 },
    compactLabel: { fontSize: 10, letterSpacing: 1, marginBottom: 4 },
    compactAmount: { fontSize: 32, lineHeight: 38 },
    spendingFooter: { marginTop: 4 },
    ofLabel: { fontSize: 14 },
    daysContainer: {
        width: 80,
        height: 85,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    daysNumber: { fontSize: 24, lineHeight: 28 },
    daysLabel: { fontSize: 8, letterSpacing: 0.5 },
    microBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
    },
    microBarFill: { height: '100%' },
    compactStatsGrid: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.01)',
    },
    compactStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    compactStatText: { fontSize: 12 },
});

export default BudgetDetailedCard;