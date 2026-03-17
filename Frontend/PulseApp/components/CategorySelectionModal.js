import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
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
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={[styles.sheet, { backgroundColor: theme.card }]}
                    onPress={e => e.stopPropagation()}
                >
                    {/* Handle */}
                    <View style={[styles.handle, { backgroundColor: theme.border }]} />

                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                            Add Category
                        </Text>
                        <TouchableOpacity onPress={onClose} hitSlop={12}>
                            <Ionicons name="close" size={22} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                    >
                        {availableCategories.length === 0 ? (
                            <Text style={[styles.emptyText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                                All categories already added.
                            </Text>
                        ) : (
                            availableCategories.map((categoryName) => {
                                const details = CategoryMapper.getCategoryDetails(categoryName);
                                return (
                                    <TouchableOpacity
                                        key={categoryName}
                                        activeOpacity={0.6}
                                        style={[styles.row, { borderBottomColor: theme.border }]}
                                        onPress={() => onSelectCategory(categoryName)}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: details.color + '20' }]}>
                                            <Ionicons name={details.icon} size={20} color={details.color} />
                                        </View>

                                        <Text style={[styles.categoryName, { color: theme.text, fontFamily: FONTS.medium }]}>
                                            {categoryName}
                                        </Text>

                                        <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                                    </TouchableOpacity>
                                );
                            })
                        )}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 16,
        maxHeight: '75%',
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
    },
    list: {
        paddingTop: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        gap: 14,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        flex: 1,
        fontSize: 15,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 14,
    },
});

export default CategorySelectionModal;