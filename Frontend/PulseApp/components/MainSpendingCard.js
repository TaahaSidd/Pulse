import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const MainSpendingCard = ({ amount, isDarkMode, theme }) => {
    const darkGradient = [COLORS.dark.card, '#2A2A2A'];
    const lightGradient = ['#FFFFFF', COLORS.primaryLightest];

    return (
        // FIXED: Move the dynamic shadow logic here so it can see 'isDarkMode'
        <View style={[
            styles.outerWrapper,
            {
                shadowOpacity: isDarkMode ? 0 : 0.06,
                elevation: isDarkMode ? 0 : 5
            }
        ]}>
            <LinearGradient
                colors={isDarkMode ? darkGradient : lightGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.mainStatsCard,
                    {
                        borderColor: isDarkMode ? COLORS.primary + '20' : 'transparent',
                        borderWidth: isDarkMode ? 1 : 0
                    }
                ]}
            >
                <Text style={[styles.statsLabel, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
                    SPENT TODAY
                </Text>

                <View style={styles.amountRow}>
                    <Text style={[styles.currencySymbol, { color: COLORS.primary }]}>₹</Text>
                    <Text style={[styles.amountText, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {amount.toLocaleString('en-IN')}
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    outerWrapper: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        marginBottom: 12,
    },
    mainStatsCard: {
        borderRadius: 24,
        paddingVertical: 28,
        paddingHorizontal: 24,
    },
    statsLabel: {
        fontSize: 11,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    currencySymbol: {
        fontSize: 24,
        fontWeight: '600',
        marginRight: 4,
        transform: [{ translateY: 2 }]
    },
    amountText: {
        fontSize: 42,
        letterSpacing: -0.5,
    },
});

export default MainSpendingCard;