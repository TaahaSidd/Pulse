import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setYear, setMonth, isAfter, startOfMonth } from 'date-fns';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

export default function MonthYearPicker({ visible, onClose, selectedDate, onSelect, theme }) {
    const START_YEAR = 2026;
    const today = new Date();
    const currentYear = today.getFullYear();

    const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

    useEffect(() => {
        const year = selectedDate.getFullYear();
        setViewYear(year < START_YEAR ? START_YEAR : year);
    }, [selectedDate, visible]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const handleMonthSelect = (monthIndex) => {
        const newDate = setMonth(setYear(new Date(selectedDate), viewYear), monthIndex);
        if (isAfter(startOfMonth(newDate), startOfMonth(today)) || newDate.getFullYear() < START_YEAR) return;
        onSelect(newDate);
        onClose();
    };

    const changeYear = (offset) => {
        const nextYear = viewYear + offset;
        if (nextYear < START_YEAR || nextYear > currentYear) return;
        setViewYear(nextYear);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={[styles.content, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>

                    {/* Compact Year Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textSecondary }]}>Select Period</Text>
                        <View style={[styles.yearControls, { backgroundColor: theme.isDarkMode ? theme.card : theme.cardElevated }]}>
                            <TouchableOpacity
                                onPress={() => changeYear(-1)}
                                disabled={viewYear <= START_YEAR}
                                style={styles.arrowContainer}
                            >
                                <Ionicons name="chevron-back" size={18} color={viewYear <= START_YEAR ? theme.textTertiary : theme.text} />
                            </TouchableOpacity>

                            <Text style={[styles.yearText, { color: theme.text }]}>{viewYear}</Text>

                            <TouchableOpacity
                                onPress={() => changeYear(1)}
                                disabled={viewYear >= currentYear}
                                style={styles.arrowContainer}
                            >
                                <Ionicons name="chevron-forward" size={18} color={viewYear >= currentYear ? theme.textTertiary : theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tight Month Grid */}
                    <View style={styles.grid}>
                        {months.map((month, index) => {
                            const itemDate = setMonth(setYear(new Date(), viewYear), index);
                            const isFuture = isAfter(startOfMonth(itemDate), startOfMonth(today));
                            const isSelected = selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === index;

                            return (
                                <TouchableOpacity
                                    key={month}
                                    disabled={isFuture}
                                    onPress={() => handleMonthSelect(index)}
                                    style={[
                                        styles.monthItem,
                                        isSelected && { backgroundColor: COLORS.primary },
                                        isFuture && { opacity: 0.1 }
                                    ]}
                                >
                                    <Text style={[
                                        styles.monthText,
                                        { color: isSelected ? '#000' : theme.text },
                                        isSelected && { fontFamily: FONTS.bold }
                                    ]}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Bottom Safe Area Spacer */}
                    <View style={{ height: 30 }} />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 14,
        fontFamily: FONTS.semiBold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    yearControls: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    yearText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        paddingHorizontal: 12,
        minWidth: 60,
        textAlign: 'center',
    },
    arrowContainer: {
        padding: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    monthItem: {
        width: '22%', // 4 items per row for maximum vertical compactness
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    monthText: {
        fontSize: 14,
        fontFamily: FONTS.medium,
    },
});