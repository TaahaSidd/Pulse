import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

export const ScrollDateTimePicker = ({
    visible,
    title,
    onClose,
    theme,
    columns
}) => {
    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.pickerSheet, { backgroundColor: theme.card }]}>
                    <View style={styles.pickerHeader}>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[styles.pickerCancel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <Text style={[styles.pickerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[styles.pickerDone, { color: COLORS.primary, fontFamily: FONTS.semiBold }]}>
                                Done
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pickerContent}>
                        {columns.map((col, index) => (
                            <ScrollView key={index} style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                                {col.data.map((item, i) => {
                                    const isSelected = col.selectedValue === item;
                                    const label = col.labelExtractor ? col.labelExtractor(item) : item;

                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => col.onSelect(item)}
                                            style={styles.pickerItem}
                                        >
                                            <Text style={[
                                                styles.pickerItemText,
                                                {
                                                    color: isSelected ? COLORS.primary : theme.text,
                                                    fontFamily: isSelected ? FONTS.bold : FONTS.regular
                                                }
                                            ]}>
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    pickerSheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 30 },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    pickerTitle: { fontSize: FONT_SIZES.lg },
    pickerContent: { flexDirection: 'row', height: 220, paddingHorizontal: 10, paddingTop: 15 },
    pickerColumn: { flex: 1, marginHorizontal: 5 },
    pickerItem: { paddingVertical: 12, alignItems: 'center' },
    pickerItemText: { fontSize: FONT_SIZES.xl },
});