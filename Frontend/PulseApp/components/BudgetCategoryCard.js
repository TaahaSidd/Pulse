import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const BudgetCategoryCard = ({
    item,
    theme,
    numericTotal,
    isOptional,
    onAmountChange,
    onRemove
}) => {
    const spent = item.spent || 0;
    const catRemaining = item.amount - spent;
    const spentPct = item.amount > 0 ? (spent / item.amount) * 100 : 0;

    return (
        <View style={[styles.categoryItem, { backgroundColor: theme.card }]}>
            <View style={styles.categoryTopRow}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                </View>

                <View style={styles.categoryInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.categoryName, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                            {item.name}
                        </Text>
                        {isOptional && (
                            <TouchableOpacity
                                onPress={() => onRemove(item.id)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="close-circle" size={16} color={theme.textTertiary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text style={[styles.categoryLeft, {
                        color: catRemaining >= 0 ? theme.textTertiary : COLORS.error,
                        fontFamily: FONTS.regular
                    }]}>
                        {spent > 0 ? `Spent: ₹${spent.toFixed(0)}` : 'No spending yet'}
                    </Text>
                </View>

                {/* ✅ TIGHTER INPUT WRAPPER */}
                <View style={[styles.categoryInputWrapper, { backgroundColor: theme.bg }]}>
                    <Text style={[styles.inputCurrency, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>₹</Text>
                    <TextInput
                        style={[styles.categoryInput, {
                            color: theme.text,
                            fontFamily: FONTS.bold,
                        }]}
                        value={item.amount.toString()}
                        onChangeText={(text) => onAmountChange(item.id, text)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor={theme.textTertiary}
                        selectTextOnFocus
                        // This ensures the input only takes up the space it needs
                        multiline={false}
                    />
                </View>
            </View>

            {spent > 0 && (
                <View style={[styles.spendingBar, { backgroundColor: theme.border }]}>
                    <View style={[
                        styles.spendingFill,
                        {
                            width: `${Math.min(spentPct, 100)}%`,
                            backgroundColor: spentPct > 100 ? COLORS.error : item.color,
                        }
                    ]} />
                </View>
            )}

            <Text style={[styles.categoryPct, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                {numericTotal > 0 ? Math.round((item.amount / numericTotal) * 100) : 0}% of total budget
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    categoryItem: {
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
    },
    categoryTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    categoryInfo: { flex: 1 },
    categoryName: { fontSize: FONT_SIZES.base },
    categoryLeft: { fontSize: FONT_SIZES.xs, marginTop: 4 },
    categoryInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        maxWidth: 120, // Prevents the input from ever getting too wide
        justifyContent: 'flex-end', // Keeps content aligned to the right of the box
    },
    inputCurrency: {
        fontSize: FONT_SIZES.sm,
        marginRight: 2 // Tiny fixed gap between ₹ and number
    },
    categoryInput: {
        fontSize: FONT_SIZES.base, // Slightly smaller font so it fits better
        textAlign: 'right',
        padding: 0,
        minWidth: 40, // Smallest possible width for a single digit
    },
    spendingBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    spendingFill: { height: '100%', borderRadius: 2 },
    categoryPct: { fontSize: FONT_SIZES.xs, textAlign: 'right' },
});

export default BudgetCategoryCard;