// Updated TransactionItem.js
// Changes needed for CategoryBreakdown screen support

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import { useAnimations } from '../hooks/useAnimations';

import { CategoryMapper } from '../utils/CategoryMapper';
import { PopularMerchants } from '../utils/MerchantMapper';
import PulseModal from './PulseModal';

const TransactionItem = ({
    item, index, isLast, theme, onPress, onDelete, showSubtitle = true, isDarkMode = true
}) => {
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const { useBouncyPress, useListEntry } = useAnimations();
    const { scale, pressIn, pressOut } = useBouncyPress();
    const { translateY, opacity } = useListEntry(index * 60);

    const brandMatch = Object.keys(PopularMerchants).find(key =>
        item.merchant?.toLowerCase().includes(key)
    );
    const brand = PopularMerchants[brandMatch];

    const categoryColor = item.color || brand?.color || CategoryMapper.getCategoryColor(item.category);
    const categoryIcon = item.icon || brand?.icon || CategoryMapper.getCategoryIcon(item.category);
    const isExpense = item.type === 'debit';

    const handleLongPress = () => onDelete && setIsDeleteModalVisible(true);
    const confirmDelete = () => {
        setIsDeleteModalVisible(false);
        onDelete(item.id);
    };

    const renderIcon = () => {
        if (categoryIcon && categoryIcon !== 'ellipsis-horizontal') {
            return (
                <View style={[styles.iconWrapper, { backgroundColor: categoryColor + '15' }]}>
                    <Ionicons name={categoryIcon} size={22} color={categoryColor} />
                </View>
            );
        }
        return (
            <View style={[styles.iconWrapper, { backgroundColor: theme.cardElevated }]}>
                <Text style={[styles.avatarText, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>
                    {(item.merchant || '?').charAt(0).toUpperCase()}
                </Text>
            </View>
        );
    };

    return (
        <>
            <Animated.View
                style={[
                    {
                        transform: [{ scale }, { translateY }],
                        opacity,
                    }
                ]}
            >
                <TouchableOpacity
                    style={styles.txRow}
                    activeOpacity={1}
                    onPressIn={pressIn}
                    onPressOut={pressOut}
                    onPress={onPress}
                    onLongPress={handleLongPress}
                >
                    {renderIcon()}
                    <View style={[
                        styles.txMain,
                        !isLast && { borderBottomWidth: 0.5, borderBottomColor: theme.border }
                    ]}>
                        <View style={styles.details}>
                            <Text numberOfLines={1} style={[styles.txTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                {item.merchant || 'Unknown'}
                            </Text>
                            {showSubtitle && (
                                <Text style={[styles.txSubtitle, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
                                    {item.bank ? `${item.category} • ${item.bank}` : item.category}
                                </Text>
                            )}
                        </View>
                        <View style={styles.amountContainer}>
                            <Text style={[
                                styles.amountText,
                                { color: isExpense ? theme.text : COLORS.primary, fontFamily: FONTS.bold }
                            ]}>
                                {isExpense ? `-₹${item.amount.toLocaleString('en-IN')}` : `+₹${item.amount.toLocaleString('en-IN')}`}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {onDelete && (
                <PulseModal
                    visible={isDeleteModalVisible}
                    type="delete"
                    title="Remove Record"
                    message={`Are you sure you want to delete the transaction for ${item.merchant}?`}
                    primaryButtonText="Delete"
                    onPrimaryPress={confirmDelete}
                    onSecondaryPress={() => setIsDeleteModalVisible(false)}
                    onClose={() => setIsDeleteModalVisible(false)}
                    isDarkMode={isDarkMode}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
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
    txSubtitle: { fontSize: 12, opacity: 0.7 },
    amountContainer: { marginLeft: 10, alignItems: 'flex-end' },
    amountText: { fontSize: 16 },
});

export default TransactionItem;