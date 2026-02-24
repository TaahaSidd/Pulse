import React from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const BudgetCategoryCard = ({
    item,
    theme,
    numericTotal,
    onAmountChange,
    onRemove
}) => {
    const spent = item.spent || 0;
    const spentPct = item.amount > 0 ? (spent / item.amount) * 100 : 0;
    const totalPct = numericTotal > 0 ? Math.round((item.amount / numericTotal) * 100) : 0;

    // Render the "Delete" action that appears behind the card
    const renderRightActions = (progress, dragX) => {
        const trans = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <RectButton
                style={[styles.deleteAction, { backgroundColor: COLORS.error }]}
                onPress={() => onRemove(item.id)}
            >
                <Animated.View style={{ opacity: trans, transform: [{ scale: trans }] }}>
                    <Ionicons name="trash-outline" size={24} color="white" />
                </Animated.View>
            </RectButton>
        );
    };

    return (
        <Swipeable renderRightActions={renderRightActions} friction={2} rightThreshold={40}>
            <View style={[styles.categoryItem, { backgroundColor: theme.card }]}>
                <View style={styles.contentRow}>
                    {/* Icon - Smaller */}
                    <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                        <Ionicons name={item.icon} size={18} color={item.color} />
                    </View>

                    {/* Name & Percentage Info */}
                    <View style={styles.categoryInfo}>
                        <Text style={[styles.categoryName, { color: theme.text, fontFamily: FONTS.semiBold }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={[styles.categorySubText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                            {totalPct}% of total • {spent > 0 ? `₹${spent.toFixed(0)} spent` : 'No spend'}
                        </Text>
                    </View>

                    {/* Input Wrapper - More compact */}
                    <View style={[styles.inputContainer, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                        <Text style={[styles.currencyPrefix, { color: theme.textSecondary }]}>₹</Text>
                        <TextInput
                            style={[styles.categoryInput, { color: theme.text, fontFamily: FONTS.bold }]}
                            value={item.amount.toString()}
                            onChangeText={(text) => onAmountChange(item.id, text)}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={theme.textTertiary}
                            selectTextOnFocus
                        />
                    </View>
                </View>

                {/* Spending Bar - Thinner and only shows if there's spending */}
                {spent > 0 && (
                    <View style={[styles.miniProgressBar, { backgroundColor: theme.border }]}>
                        <View style={[
                            styles.progressFill,
                            {
                                width: `${Math.min(spentPct, 100)}%`,
                                backgroundColor: spentPct > 100 ? COLORS.error : item.color
                            }
                        ]} />
                    </View>
                )}
            </View>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    categoryItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 14,
    },
    categorySubText: {
        fontSize: 11,
        marginTop: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 70,
    },
    currencyPrefix: {
        fontSize: 12,
        marginRight: 2,
    },
    categoryInput: {
        fontSize: 14,
        textAlign: 'right',
        flex: 1,
        padding: 0,
    },
    miniProgressBar: {
        height: 3,
        borderRadius: 1.5,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    deleteAction: {
        width: 70,
        height: '87%', // Matches the card height minus margin
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 8,
        marginLeft: 10,
    }
});

export default BudgetCategoryCard;