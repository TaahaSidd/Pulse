import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import { CategoryMapper } from '../utils/CategoryMapper';

const TransactionItem = ({
    item,
    index,
    isLast,
    theme,
    onPress,
    onDelete
}) => {
    const isExpense = item.type === 'debit';
    const categoryColor = CategoryMapper.getCategoryColor(item.category);
    const categoryIcon = CategoryMapper.getCategoryIcon(item.category);

    const handleLongPress = () => {
        if (!onDelete) return;
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to remove this record?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(item.id) }
            ]
        );
    };

    return (
        <TouchableOpacity
            style={styles.txRow}
            activeOpacity={0.6}
            onPress={onPress}
            onLongPress={handleLongPress}
        >
            <View style={styles.iconWrapper}>
                <Ionicons name={categoryIcon} size={24} color={categoryColor} />
            </View>

            <View style={[
                styles.txMain,
                !isLast && { borderBottomWidth: 0.5, borderBottomColor: theme.border }
            ]}>
                <View style={styles.details}>
                    <Text
                        numberOfLines={1}
                        style={[styles.txTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}
                    >
                        {item.merchant || 'Unknown'}
                    </Text>
                    <Text style={[styles.txSubtitle, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
                        {item.category} • {item.bank}
                    </Text>
                </View>

                <View style={styles.amountContainer}>
                    <Text style={[
                        styles.amountText,
                        { color: isExpense ? theme.text : COLORS.primary, fontFamily: FONTS.bold }
                    ]}>
                        {isExpense ? `-₹${item.amount.toLocaleString()}` : `+₹${item.amount.toLocaleString()}`}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingRight: 20,
    },
    details: { flex: 1 },
    txTitle: { fontSize: 16, marginBottom: 2 },
    txSubtitle: { fontSize: 12, opacity: 0.6 },
    amountContainer: { marginLeft: 10, alignItems: 'flex-end' },
    amountText: { fontSize: 16 },
});

export default TransactionItem;