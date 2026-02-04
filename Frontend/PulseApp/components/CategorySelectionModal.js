import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import CategoryMapper from '../utils/CategoryMapper';

const CategorySelectionModal = ({
    visible,
    onClose,
    onSelectCategory,
    availableCategories,
    theme
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>

                            {/* Handle Bar - Consistency with Filter Modal */}
                            <View style={[styles.handle, { backgroundColor: theme.border }]} />

                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                                    Add Category
                                </Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={28} color={theme.textTertiary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={styles.modalScroll}
                                contentContainerStyle={{ paddingBottom: 40 }}
                            >
                                {availableCategories.map((categoryName) => {
                                    const details = CategoryMapper.getCategoryDetails(categoryName);
                                    return (
                                        <TouchableOpacity
                                            key={categoryName}
                                            activeOpacity={0.7}
                                            style={[styles.categoryOption, { backgroundColor: theme.bg, borderColor: theme.border }]}
                                            onPress={() => onSelectCategory(categoryName)}
                                        >
                                            <View style={[styles.categoryOptionIcon, { backgroundColor: details.color + '15' }]}>
                                                <Ionicons name={details.icon} size={24} color={details.color} />
                                            </View>

                                            <Text style={[styles.categoryOptionText, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                                {categoryName}
                                            </Text>

                                            <View style={[styles.addButton, { backgroundColor: COLORS.primary + '90' }]}>
                                                <Ionicons name="add" size={20} color={COLORS.textTertiary} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32, // Increased for that smoother curve
        borderTopRightRadius: 32,
        paddingHorizontal: 20,
        maxHeight: '80%', // Slightly more room for category lists
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: {
        fontSize: FONT_SIZES.xl
    },
    modalScroll: {
        marginBottom: 10
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20, // Chonkier corners
        marginBottom: 12,
        borderWidth: 1, // Added border to match action cards
        gap: 15,
    },
    categoryOptionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryOptionText: {
        flex: 1,
        fontSize: 16,
    },

    addButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategorySelectionModal;