import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Pressable,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../constants/Fonts';
import { COLORS } from '../constants/Colors';
import Button from './Button';
import CategoryMapper from '../utils/CategoryMapper';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TransactionFilterModal = ({
    visible,
    onClose,
    theme,
    onApply,
    onReset,
}) => {
    const [activeTab, setActiveTab] = useState('month');
    const [selectedFilters, setSelectedFilters] = useState({
        month: [],
        category: [],
        status: [],
        paymentMode: [],
        account: []
    });

    const dynamicCategories = CategoryMapper.getAllCategories();

    const filterTypes = [
        { key: 'month', label: 'Month', options: ['February 2026', 'January 2026', 'December 2025', 'November 2025'] },
        { key: 'category', label: 'Category', options: dynamicCategories },
        { key: 'status', label: 'Status', options: ['Completed', 'Pending', 'Failed'] },
        { key: 'paymentMode', label: 'Mode', options: ['UPI', 'Card', 'Cash'] },
        { key: 'account', label: 'Account', options: ['Savings', 'Credit Card'] },
    ];

    const toggleOption = (option) => {
        setSelectedFilters(prev => {
            const currentItems = prev[activeTab];
            const isSelected = currentItems.includes(option);
            return {
                ...prev,
                [activeTab]: isSelected
                    ? currentItems.filter(item => item !== option)
                    : [...currentItems, option]
            };
        });
    };

    const handleReset = () => {
        setSelectedFilters({ month: [], category: [], status: [], paymentMode: [], account: [] });
        onReset();
    };

    const totalSelected = Object.values(selectedFilters).flat().length;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            {/* The Pressable here detects clicks outside the modal content */}
            <Pressable style={styles.modalOverlay} onPress={onClose}>

                {/* Pressable with null onPress stops click propagation inside the modal */}
                <Pressable style={[styles.modalContainer, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>

                    {/* Grab Handle for UX */}
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: theme.border }]} />
                    </View>

                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Filters</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={12}>
                            <Ionicons name="close" size={22} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.splitView}>
                        {/* Left Column */}
                        <View style={[
                            styles.leftColumn,
                            { backgroundColor: theme.isDarkMode ? theme.card : theme.cardElevated }
                        ]}>
                            {filterTypes.map((tab) => {
                                const isSelected = activeTab === tab.key;
                                return (
                                    <Pressable
                                        key={tab.key}
                                        onPress={() => setActiveTab(tab.key)}
                                        style={[
                                            styles.tabItem,
                                            isSelected && { backgroundColor: theme.card, borderLeftWidth: 3, borderLeftColor: COLORS.primary }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.tabText,
                                            {
                                                color: isSelected ? COLORS.primary : theme.textSecondary,
                                                fontFamily: isSelected ? FONTS.bold : FONTS.medium
                                            }
                                        ]}>
                                            {tab.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Right Column */}
                        <View style={styles.rightColumn}>
                            <FlatList
                                data={filterTypes.find(t => t.key === activeTab)?.options}
                                keyExtractor={(item) => item}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingVertical: 4 }}
                                renderItem={({ item }) => {
                                    const isChecked = selectedFilters[activeTab].includes(item);
                                    const accentColor = activeTab === 'category'
                                        ? CategoryMapper.getCategoryColor(item)
                                        : COLORS.primary;

                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.6}
                                            style={styles.optionRow}
                                            onPress={() => toggleOption(item)}
                                        >
                                            <View style={styles.optionLabelContainer}>
                                                {activeTab === 'category' && (
                                                    <Ionicons
                                                        name={CategoryMapper.getCategoryIcon(item)}
                                                        size={14}
                                                        color={accentColor}
                                                        style={{ marginRight: 8 }}
                                                    />
                                                )}
                                                <Text numberOfLines={1} style={[styles.optionText, { color: isChecked ? theme.text : theme.textSecondary }]}>
                                                    {item}
                                                </Text>
                                            </View>
                                            <View style={[
                                                styles.checkbox,
                                                { borderColor: isChecked ? accentColor : theme.border },
                                                isChecked && { backgroundColor: accentColor }
                                            ]}>
                                                {isChecked && <Ionicons name="checkmark" size={12} color="white" />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity
                            onPress={handleReset}
                            style={[styles.footerBtn, { backgroundColor: theme.cardElevated, borderColor: theme.border, borderWidth: 1 }]}
                        >
                            <Text style={{ color: theme.textTertiary, fontSize: 13, fontFamily: FONTS.medium }}>Reset</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => { onApply(selectedFilters); onClose(); }}
                            style={[styles.footerBtn, { backgroundColor: COLORS.primary }]}
                        >
                            <Text style={{ color: '#000', fontSize: 13, fontFamily: FONTS.bold }}>
                                {`Apply${totalSelected > 0 ? ` (${totalSelected})` : ''}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: SCREEN_HEIGHT * 0.55, // 55% height - perfect for one-thumb reach
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        opacity: 0.5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: FONTS.bold,
    },
    splitView: {
        flex: 1,
        flexDirection: 'row',
    },
    leftColumn: {
        width: '28%',
    },
    rightColumn: {
        flex: 1,
        paddingHorizontal: 4,
    },
    tabItem: {
        paddingVertical: 14,
        paddingHorizontal: 12,
    },
    tabText: {
        fontSize: 12,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    optionLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionText: {
        fontSize: 13,
        fontFamily: FONTS.medium,
    },
    checkbox: {
        width: 16,
        height: 16,
        borderWidth: 1.5,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 28,
        gap: 8,
        borderTopWidth: 1,
    },
    footerBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexButton: {
        flex: 1,
        height: 40,
    }
});

export default TransactionFilterModal;