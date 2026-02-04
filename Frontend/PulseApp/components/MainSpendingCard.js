import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const MainSpendingCard = ({ amount, isDarkMode, theme }) => {
    return (
        <LinearGradient
            colors={[
                isDarkMode ? '#242a32' : '#FFFFFF',
                isDarkMode ? COLORS.primary + '15' : COLORS.primaryLightest
            ]}
            style={styles.mainStatsCard}
        >
            <Text style={[styles.statsLabel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                SPENT TODAY
            </Text>
            <View style={styles.amountRow}>
                <Text style={[styles.amountText, { color: theme.text, fontFamily: FONTS.bold }]}>
                    ₹{amount.toLocaleString('en-IN')}
                </Text>
                <View style={styles.greenCircle} />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    mainStatsCard: {
        borderRadius: 28,
        padding: 24,
        marginBottom: 12
    },
    statsLabel: {
        fontSize: 11,
        letterSpacing: 1
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 4
    },
    amountText: {
        fontSize: 38
    },
    greenCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginTop: 10
    },
});

export default MainSpendingCard;