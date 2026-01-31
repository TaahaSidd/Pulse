import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FONT_SIZES, FONTS } from '../constants/Fonts';
import { COLORS } from '../constants/Colors';

export default function ScreenHeader({
    // common
    mode = 'simple',         // 'simple' | 'month'
    theme,
    title,
    showBack = false,
    onBackPress,
    rightIcon,
    onRightPress,

    // month mode
    selectedDate,
    onPrevMonth,
    onNextMonth,
    isNextDisabled = false,
    onOpenMonthPicker,
}) {
    if (mode === 'month') {
        return (
            <View style={styles.header}>
                <TouchableOpacity onPress={onPrevMonth}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.monthSelector} onPress={onOpenMonthPicker}>
                    <Text
                        style={[
                            styles.monthText,
                            { color: theme.text, fontFamily: FONTS.bold },
                        ]}
                    >
                        {format(selectedDate, 'MMMM yyyy')}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onNextMonth}
                    disabled={isNextDisabled}
                    style={{ opacity: isNextDisabled ? 0.3 : 1 }}
                >
                    <Ionicons name="chevron-forward" size={28} color={theme.text} />
                </TouchableOpacity>
            </View>
        );
    }

    // simple header
    return (
        <View style={styles.header}>
            <View style={{ width: 40 }}>
                {showBack && (
                    <TouchableOpacity onPress={onBackPress}>
                        <Ionicons name="chevron-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                )}
            </View>

            <Text
                style={[
                    styles.titleText,
                    { color: theme.text, fontFamily: FONTS.bold },
                ]}
            >
                {title}
            </Text>

            <View style={{ width: 40, alignItems: 'flex-end' }}>
                {rightIcon && (
                    <TouchableOpacity onPress={onRightPress}>
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    monthText: { fontSize: FONT_SIZES.xl },
    titleText: { fontSize: FONT_SIZES.xl },
});
