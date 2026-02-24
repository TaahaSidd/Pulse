import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../constants/Fonts';
import { COLORS } from '../constants/Colors';
import Button from './Button';
import CategoryMapper from '../utils/CategoryMapper'; // Ensure path is correct

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

    // Dynamically fetch categories from your Mapper
    const dynamicCategories = CategoryMapper.getAllCategories();

    const filterTypes = [
        { key: 'month', label: 'Month', options: ['February 2026', 'January 2026', 'December 2025', 'November 2025'] },
        { key: 'category', label: 'Category', options: dynamicCategories },
        { key: 'status', label: 'Status', options: ['Completed', 'Pending', 'Failed'] },
        { key: 'paymentMode', label: 'Payment mode', options: ['UPI', 'Card', 'Cash'] },
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
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>

                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Filter</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={28} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.splitView}>
                        {/* Left Column: Fixed Dark Mode Logic */}
                        <View style={[
                            styles.leftColumn,
                            { backgroundColor: theme.isDarkMode ? '#121212' : 'rgb(45, 45, 45)' }
                        ]}>
                            {filterTypes.map((tab) => {
                                const isSelected = activeTab === tab.key;
                                return (
                                    <Pressable
                                        key={tab.key}
                                        onPress={() => setActiveTab(tab.key)}
                                        style={[
                                            styles.tabItem,
                                            isSelected && {
                                                backgroundColor: theme.card, // Matches modal bg
                                                borderLeftWidth: 4,
                                                borderLeftColor: COLORS.primary
                                            }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.tabText,
                                            {
                                                color: isSelected ? COLORS.primary : (theme.isDarkMode ? '#888' : theme.textSecondary),
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
                                renderItem={({ item }) => {
                                    const isChecked = selectedFilters[activeTab].includes(item);

                                    // Get dynamic colors for categories if the active tab is 'category'
                                    const categoryColor = activeTab === 'category'
                                        ? CategoryMapper.getCategoryColor(item)
                                        : COLORS.primary;

                                    return (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={styles.optionRow}
                                            onPress={() => toggleOption(item)}
                                        >
                                            <View style={styles.optionLabelContainer}>
                                                {activeTab === 'category' && (
                                                    <Ionicons
                                                        name={CategoryMapper.getCategoryIcon(item)}
                                                        size={18}
                                                        color={categoryColor}
                                                        style={{ marginRight: 10 }}
                                                    />
                                                )}
                                                <Text style={[
                                                    styles.optionText,
                                                    { color: isChecked ? theme.text : theme.textSecondary }
                                                ]}>
                                                    {item}
                                                </Text>
                                            </View>

                                            <View style={[
                                                styles.checkbox,
                                                { borderColor: isChecked ? categoryColor : theme.border },
                                                isChecked && { backgroundColor: categoryColor }
                                            ]}>
                                                {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }}
                            />
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.border, borderTopWidth: 1 }]}>
                        <Button
                            title="Clear all"
                            variant="ghost"
                            onPress={handleReset}
                            style={styles.flexButton}
                            textStyle={{ color: theme.textSecondary }}
                        />
                        <Button
                            title={`Apply ${totalSelected > 0 ? `(${totalSelected})` : ''}`}
                            variant="primary"
                            onPress={() => { onApply(selectedFilters); onClose(); }}
                            style={styles.flexButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: '85%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: FONTS.bold,
    },
    splitView: {
        flex: 1,
        flexDirection: 'row',
    },
    leftColumn: {
        width: '35%',
    },
    rightColumn: {
        flex: 1,
        paddingHorizontal: 10,
    },
    tabItem: {
        paddingVertical: 22,
        paddingHorizontal: 16,
        justifyContent: 'center',
    },
    tabText: {
        fontSize: 15,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 15,
    },
    optionLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 34,
        gap: 12,
    },
    flexButton: {
        flex: 1,
    }
});

export default TransactionFilterModal;