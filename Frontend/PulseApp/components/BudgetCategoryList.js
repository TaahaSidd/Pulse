import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { COLORS } from '../constants/Colors';
import CategoryMapper from '../utils/CategoryMapper';

export default function BudgetCategoryList({ allocations = [], spending = {}, theme, onEditPress }) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                    Category Breakdown
                </Text>
                {onEditPress && (
                    <TouchableOpacity onPress={onEditPress} hitSlop={8}>
                        <Text style={[styles.editLink, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
                            Edit
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.listContainer}>
                {allocations.map((allocation, index) => {
                    const spent = spending[allocation.category] || 0;
                    const allocated = allocation.allocated_amount;
                    const percentage = allocated > 0 ? Math.min((spent / allocated) * 100, 100) : 0;
                    const isOver = allocated > 0 && spent > allocated;
                    const isWarning = percentage > 80 && !isOver;
                    const remaining = allocated - spent;

                    const barColor = isOver ? COLORS.error : isWarning ? '#FF9500' : COLORS.primary;
                    const categoryColor = CategoryMapper.getCategoryColor(allocation.category);
                    const categoryIcon = CategoryMapper.getCategoryIcon(allocation.category);

                    return (
                        <View key={index} style={[styles.row, { backgroundColor: theme.card }]}>
                            <View style={styles.contentRow}>
                                {/* Icon — same size/radius as BudgetCategoryCard */}
                                <View style={[styles.iconBox, { backgroundColor: categoryColor + '15' }]}>
                                    <Ionicons name={categoryIcon} size={18} color={categoryColor} />
                                </View>

                                {/* Name + status subtitle */}
                                <View style={styles.middle}>
                                    <Text numberOfLines={1} style={[styles.categoryName, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                        {allocation.category}
                                    </Text>
                                    <Text style={[styles.categorySubText, { color: isOver ? COLORS.error : theme.textTertiary, fontFamily: FONTS.regular }]}>
                                        {isOver
                                            ? `₹${Math.abs(remaining).toFixed(0)} over budget`
                                            : spent > 0
                                                ? `₹${remaining.toFixed(0)} remaining`
                                                : 'No spend yet'
                                        }
                                    </Text>
                                </View>

                                {/* Spent / Allocated — mirrors card's right-side input width */}
                                <View style={styles.right}>
                                    <Text style={[styles.spentAmount, { color: isOver ? COLORS.error : theme.text, fontFamily: FONTS.bold }]}>
                                        ₹{spent.toFixed(0)}
                                    </Text>
                                    <Text style={[styles.allocatedAmount, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                                        / ₹{allocated.toLocaleString()}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress bar — only when spent > 0, same as BudgetCategoryCard */}
                            {spent > 0 && (
                                <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
                                    <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingLeft: 4,
    },
    title: {
        fontSize: 16,
    },
    editLink: {
        fontSize: FONT_SIZES.base,
    },
    listContainer: {
        gap: 8,
    },
    // Matches BudgetCategoryCard's categoryItem
    row: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // Matches BudgetCategoryCard's iconBox
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    middle: {
        flex: 1,
    },
    // Matches BudgetCategoryCard's categoryName
    categoryName: {
        fontSize: 14,
    },
    // Matches BudgetCategoryCard's categorySubText
    categorySubText: {
        fontSize: 11,
        marginTop: 1,
    },
    right: {
        alignItems: 'flex-end',
    },
    spentAmount: {
        fontSize: 14,
    },
    allocatedAmount: {
        fontSize: 11,
        marginTop: 1,
    },
    // Matches BudgetCategoryCard's miniProgressBar
    barTrack: {
        height: 3,
        borderRadius: 1.5,
        marginTop: 8,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
    },
});