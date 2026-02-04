import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setYear, setMonth, isAfter, startOfMonth } from 'date-fns';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

export default function MonthYearPicker({ visible, onClose, selectedDate, onSelect, theme }) {
    const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
    const today = new Date();

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const handleMonthSelect = (monthIndex) => {
        const newDate = setMonth(setYear(new Date(selectedDate), viewYear), monthIndex);

        // Final safety check: don't select if it's somehow clicked
        if (isAfter(startOfMonth(newDate), startOfMonth(today))) return;

        onSelect(newDate);
        onClose();
    };

    const changeYear = (offset) => setViewYear(prev => prev + offset);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={[styles.content, { backgroundColor: theme.cardElevated }]}>

                    {/* YEAR SELECTOR */}
                    <View style={styles.yearHeader}>
                        <TouchableOpacity onPress={() => changeYear(-1)} style={styles.arrowBtn}>
                            <Ionicons name="chevron-back" size={24} color={theme.text} />
                        </TouchableOpacity>

                        <Text style={[styles.yearText, { color: theme.text }]}>{viewYear}</Text>

                        {/* Disable forward year if viewYear is already current year */}
                        <TouchableOpacity
                            onPress={() => changeYear(1)}
                            style={[styles.arrowBtn, viewYear >= today.getFullYear() && { opacity: 0.2 }]}
                            disabled={viewYear >= today.getFullYear()}
                        >
                            <Ionicons name="chevron-forward" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* MONTH GRID */}
                    <View style={styles.grid}>
                        {months.map((month, index) => {
                            const itemDate = setMonth(setYear(new Date(), viewYear), index);
                            const isFuture = isAfter(startOfMonth(itemDate), startOfMonth(today));
                            const isSelected =
                                selectedDate.getFullYear() === viewYear &&
                                selectedDate.getMonth() === index;

                            return (
                                <TouchableOpacity
                                    key={month}
                                    disabled={isFuture}
                                    style={[
                                        styles.monthItem,
                                        isSelected && { backgroundColor: COLORS.primary },
                                        isFuture && { opacity: 0.15 } // Faded out for future months
                                    ]}
                                    onPress={() => handleMonthSelect(index)}
                                >
                                    <Text style={[
                                        styles.monthText,
                                        { color: isSelected ? '#000' : theme.textSecondary },
                                        isSelected && { fontFamily: FONTS.bold }
                                    ]}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={[styles.separator, { backgroundColor: theme.border, opacity: 0.1 }]} />

                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Text style={[styles.closeText, { color: theme.textTertiary }]}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '85%',
        borderRadius: 32,
        padding: 20,
    },
    yearHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    yearText: {
        fontSize: 22,
        fontFamily: FONTS.bold,
    },
    arrowBtn: {
        padding: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    monthItem: {
        width: '30%',
        aspectRatio: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
    },
    monthText: {
        fontSize: FONT_SIZES.sm,
        fontFamily: FONTS.medium,
    },
    separator: {
        height: 1,
        width: '100%',
        marginTop: 16,
    },
    closeBtn: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 8,
    },
    closeText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZES.sm,
    }
});