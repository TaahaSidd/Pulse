import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

export default function GeneralInfoCard({ transaction, theme, title }) {
    if (!transaction) return null;

    // We only display the data NOT already shown in the Z-Pattern header
    const details = [
        { label: 'BANK', value: transaction.bank || transaction.bank_name || 'N/A' },
        { label: 'CATEGORY', value: transaction.category || 'Others' },
        { label: 'ACCOUNT', value: transaction.account_number ? `****${transaction.account_number}` : 'N/A' },
        { label: 'PAYMENT', value: transaction.transaction_method || transaction.transactionMethod || 'N/A' },
        { label: 'REF NO', value: transaction.ref_number || transaction.reference_number || transaction.ref_id || 'N/A' },
    ];

    return (
        <View style={styles.container}>
            {title && (
                <Text style={[styles.titleText, { color: theme.textTertiary, fontFamily: FONTS.bold }]}>
                    {title.toUpperCase()}
                </Text>
            )}

            <View style={styles.grid}>
                {details.map((item, index) => (
                    <View key={index} style={styles.gridItem}>
                        <Text style={[styles.infoLabel, { color: theme.textTertiary, fontFamily: FONTS.bold }]}>
                            {item.label}
                        </Text>
                        <Text
                            style={[styles.infoValue, { color: theme.text, fontFamily: FONTS.semiBold }]}
                            numberOfLines={1}
                            ellipsizeMode="middle"
                        >
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 10,
    },
    titleText: {
        fontSize: 10,
        letterSpacing: 1.5,
        marginBottom: 12,
        paddingLeft: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 20, // Vertical spacing between rows
    },
    gridItem: {
        width: '48%', // Creates the 2-column effect
    },
    infoLabel: {
        fontSize: 10,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
    },
});