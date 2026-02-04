import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { COLORS } from '../constants/Colors';
import Button from './Button';

const TransactionFilterModal = ({ visible, onClose, theme, onApply, onReset }) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.content, { backgroundColor: theme.card }]}>
                            {/* Handle Bar */}
                            <View style={[styles.handle, { backgroundColor: theme.border }]} />

                            <View style={styles.header}>
                                <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                                    Filter Transactions
                                </Text>
                                <TouchableOpacity onPress={onReset}>
                                    <Text style={[styles.resetText, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
                                        Reset
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
                                {/* Time Period Section */}
                                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>
                                    TIME PERIOD
                                </Text>
                                <View style={styles.optionsGrid}>
                                    {['This Month', 'Last Month', 'Last 3 Months', 'Custom'].map((period) => (
                                        <TouchableOpacity
                                            key={period}
                                            style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.bg }]}
                                        >
                                            <Text style={{ color: theme.text, fontFamily: FONTS.medium }}>{period}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Categories Section */}
                                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.semiBold, marginTop: 24 }]}>
                                    CATEGORIES
                                </Text>
                                <View style={styles.optionsGrid}>
                                    {['Shopping', 'Food', 'Transport', 'Bills', 'Health'].map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.bg }]}
                                        >
                                            <Text style={{ color: theme.text, fontFamily: FONTS.medium }}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>

                            <View style={styles.footer}>
                                <Button
                                    title="Apply Filters"
                                    onPress={() => {
                                        onApply();
                                        onClose();
                                    }}
                                    fullWidth
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: FONT_SIZES.xl,
    },
    resetText: {
        fontSize: FONT_SIZES.sm,
    },
    sectionLabel: {
        fontSize: 11,
        letterSpacing: 1.2,
        marginBottom: 12,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    footer: {
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
});

export default TransactionFilterModal;