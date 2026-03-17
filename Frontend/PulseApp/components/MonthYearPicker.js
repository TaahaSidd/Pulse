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
import { FONTS } from '../constants/Fonts';

const START_YEAR = 2020;

export default function MonthYearPicker({ visible, onClose, selectedDate, onSelect, theme }) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

    useEffect(() => {
        if (!visible) return;
        setViewYear(selectedDate.getFullYear());
    }, [visible]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const changeYear = (offset) => {
        const next = viewYear + offset;
        if (next < START_YEAR || next > currentYear) return;
        setViewYear(next);
    };

    const handleMonthSelect = (monthIndex) => {
        const newDate = setMonth(setYear(new Date(), viewYear), monthIndex);
        if (isAfter(startOfMonth(newDate), startOfMonth(today))) return;
        onSelect(newDate);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={[styles.content, { backgroundColor: theme.card }]} onPress={e => e.stopPropagation()}>

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>
                            Select Period
                        </Text>
                        <View style={[styles.yearControls, { backgroundColor: theme.cardElevated }]}>
                            <TouchableOpacity
                                onPress={() => changeYear(-1)}
                                disabled={viewYear <= START_YEAR}
                                style={styles.arrowContainer}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name="chevron-back"
                                    size={18}
                                    color={viewYear <= START_YEAR ? theme.textTertiary : theme.text}
                                />
                            </TouchableOpacity>

                            <Text style={[styles.yearText, { color: theme.text, fontFamily: FONTS.bold }]}>
                                {viewYear}
                            </Text>

                            <TouchableOpacity
                                onPress={() => changeYear(1)}
                                disabled={viewYear >= currentYear}
                                style={styles.arrowContainer}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={viewYear >= currentYear ? theme.textTertiary : theme.text}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

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
                                        isFuture && { opacity: 0.15 },
                                    ]}
                                >
                                    <Text style={[
                                        styles.monthText,
                                        {
                                            color: isSelected ? '#000' : theme.text,
                                            fontFamily: isSelected ? FONTS.bold : FONTS.medium,
                                        }
                                    ]}>
                                        {month}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

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
        paddingHorizontal: 12,
        minWidth: 60,
        textAlign: 'center',
    },
    arrowContainer: { padding: 8 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 10,
    },
    monthItem: {
        width: '22%',
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    monthText: { fontSize: 14 },
});