import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { FONT_SIZES, FONTS } from '../constants/Fonts';

export default function ScreenHeader({

    mode = 'simple',
    theme,
    title,
    showBack = false,
    onBackPress,
    rightIcon,
    onRightPress,

    // month mode
    selectedDate,
    onOpenMonthPicker,
}) {
    if (mode === 'month') {
        return (
            <View style={styles.header}>
                {/* Left Spacer for alignment */}
                <View style={{ width: 28 }} />

                <TouchableOpacity
                    style={styles.monthSelector}
                    onPress={onOpenMonthPicker}
                    activeOpacity={0.7}
                >
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

                {/* Right Spacer for alignment */}
                <View style={{ width: 28 }} />
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
        paddingBottom: 20,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        // Optional: add a slight background or border if you want it to look more like a button
    },
    monthText: { fontSize: FONT_SIZES.xl },
    titleText: { fontSize: FONT_SIZES.xl },
});