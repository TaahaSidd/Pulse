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
import { THEME } from '../constants/Themes';
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

                            {/* Handle Bar - Using layout.bottomSheetHandle */}
                            <View style={[styles.handle, { backgroundColor: theme.border }]} />

                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text, fontWeight: THEME.fontWeight.bold }]}>
                                    Add Category
                                </Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={THEME.sizes.icon.lg} color={theme.textTertiary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={styles.modalScroll}
                                contentContainerStyle={{ paddingBottom: THEME.spacing[5] }}
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
                                                <Ionicons name={details.icon} size={THEME.sizes.icon.md} color={details.color} />
                                            </View>

                                            <Text style={[styles.categoryOptionText, { color: theme.text, fontWeight: THEME.fontWeight.semibold }]}>
                                                {categoryName}
                                            </Text>

                                            <View style={[styles.addButton, { backgroundColor: COLORS.primary + '90' }]}>
                                                <Ionicons name="add" size={THEME.sizes.icon.sm} color={COLORS.textTertiary} />
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
        borderTopLeftRadius: THEME.borderRadius['2xl'], // 32px
        borderTopRightRadius: THEME.borderRadius['2xl'], // 32px
        paddingHorizontal: THEME.layout.screenPadding, // 16px
        maxHeight: '80%',
    },
    handle: {
        width: THEME.layout.bottomSheetHandle, // 24px
        height: 5,
        borderRadius: THEME.borderRadius.pill,
        alignSelf: 'center',
        marginTop: THEME.spacing[1] + 4, // 12px
        marginBottom: THEME.spacing[3], // 24px
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing[3] + 1, // ~25px
    },
    modalTitle: {
        fontSize: THEME.fontSize.xl, // 22px
    },
    modalScroll: {
        marginBottom: THEME.spacing[1] + 2, // ~10px
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: THEME.spacing[2] - 2, // 14px
        borderRadius: THEME.borderRadius['2xl'] - 12, // 20px
        marginBottom: THEME.spacing[1] + 4, // 12px
        borderWidth: 1,
        gap: THEME.spacing[2] - 1, // 15px
    },
    categoryOptionIcon: {
        width: THEME.sizes.avatar.md, // 48px
        height: THEME.sizes.avatar.md, // 48px
        borderRadius: THEME.borderRadius.lg - 2, // 14px
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryOptionText: {
        flex: 1,
        fontSize: THEME.fontSize.sm + 1, // ~16px
    },
    addButton: {
        width: THEME.sizes.avatar.xs, // 32px
        height: THEME.sizes.avatar.xs, // 32px
        borderRadius: THEME.borderRadius.md - 2, // 10px
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategorySelectionModal;