import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../constants/Fonts';

const StatCard = ({ label, amount, icon, iconColor, theme }) => (
    <View style={[styles.smallCard, { backgroundColor: theme.card }]}>
        <View style={[styles.smallIconBox, { backgroundColor: `${iconColor}20` }]}>
            <Ionicons name={icon} size={14} color={iconColor} />
        </View>
        <View>
            <Text style={[styles.smallLabel, { color: theme.textTertiary }]}>{label}</Text>
            <Text style={[styles.smallAmount, { color: theme.text }]}>
                ₹{amount.toLocaleString('en-IN')}
            </Text>
        </View>
    </View>
);

const StatSummaryRow = ({ income, expenses, theme }) => {
    return (
        <View style={styles.smallStatsRow}>
            <StatCard
                label="MONEY IN"
                amount={income}
                icon="arrow-down"
                iconColor="#34C759"
                theme={theme}
            />
            <StatCard
                label="MONEY OUT"
                amount={expenses}
                icon="arrow-up"
                iconColor="#FF3B30"
                theme={theme}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    smallStatsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28
    },
    smallCard: {
        flex: 1,
        padding: 16,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    smallIconBox: {
        width: 30,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    smallLabel: {
        fontSize: 9,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5
    },
    smallAmount: {
        fontSize: 13,
        fontFamily: FONTS.bold,
        marginTop: 1
    },
});

export default StatSummaryRow;