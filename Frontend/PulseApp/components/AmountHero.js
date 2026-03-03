import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

export const AmountHero = ({ amount, setAmount, theme }) => {
    return (
        <View style={styles.amountHero}>
            <Text style={[styles.amountLabel, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
                SET AMOUNT
            </Text>
            <View style={styles.amountRow}>
                <Text style={[styles.currency, { color: COLORS.primary, fontFamily: FONTS.bold }]}>₹</Text>
                <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={theme.textTertiary + '40'}
                    style={[styles.heroInput, { color: theme.text, fontFamily: FONTS.bold }]}
                    autoFocus={false}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    amountHero: { alignItems: 'center', marginVertical: 30 },
    amountLabel: { fontSize: FONT_SIZES.xs, letterSpacing: 2, marginBottom: 8 },
    amountRow: { flexDirection: 'row', alignItems: 'center' },
    currency: { fontSize: 32 },
    heroInput: { fontSize: 60, minWidth: 150, textAlign: 'center' },
});