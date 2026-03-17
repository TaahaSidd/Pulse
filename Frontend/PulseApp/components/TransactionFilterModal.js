import React, { useState, useMemo } from 'react';
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
import { format, parseISO } from 'date-fns';
import { FONTS } from '../constants/Fonts';
import { COLORS } from '../constants/Colors';
import CategoryMapper from '../utils/CategoryMapper';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TransactionFilterModal = ({
    visible,
    onClose,
    theme,
    onApply,
    onReset,
    transactions = [], // ← real tx data passed from parent
    isDarkMode = true,
}) => {
    const [activeTab, setActiveTab] = useState('month');
    const [selectedFilters, setSelectedFilters] = useState({
        month: [],
        category: [],
    });

    // ── Derive real months from transactions ──────────────
    const realMonths = useMemo(() => {
        const seen = new Set();
        transactions.forEach(t => {
            try {
                const label = format(parseISO(t.date), 'MMMM yyyy'); // "March 2026"
                seen.add(label);
            } catch { }
        });
        // Sort newest first
        return Array.from(seen).sort((a, b) => {
            const da = new Date(a);
            const db = new Date(b);
            return db - da;
        });
    }, [transactions]);

    // ── Derive real categories from transactions ──────────
    const realCategories = useMemo(() => {
        const seen = new Set();
        transactions.forEach(t => {
            if (t.category) seen.add(t.category);
        });
        return Array.from(seen).sort();
    }, [transactions]);

    const filterTypes = [
        { key: 'month', label: 'Month', options: realMonths },
        { key: 'category', label: 'Category', options: realCategories },
    ];

    const toggleOption = (option) => {
        setSelectedFilters(prev => {
            const current = prev[activeTab];
            const isSelected = current.includes(option);
            return {
                ...prev,
                [activeTab]: isSelected
                    ? current.filter(i => i !== option)
                    : [...current, option],
            };
        });
    };

    const handleReset = () => {
        setSelectedFilters({ month: [], category: [] });
        onReset();
    };

    const handleApply = () => {
        onApply(selectedFilters);
        onClose();
    };

    const totalSelected = Object.values(selectedFilters).flat().length;

    // ── Left column bg — fix for light mode ──────────────
    const leftColBg = isDarkMode ? theme.bg : theme.cardElevated;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable
                    style={[styles.modalContainer, { backgroundColor: theme.card }]}
                    onPress={e => e.stopPropagation()}
                >
                    {/* Handle */}
                    <View style={styles.handleContainer}>
                        <View style={[styles.handle, { backgroundColor: theme.border }]} />
                    </View>

                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                            Filters
                        </Text>
                        <TouchableOpacity onPress={onClose} hitSlop={12}>
                            <Ionicons name="close" size={22} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.splitView}>
                        {/* Left tabs */}
                        <View style={[styles.leftColumn, { backgroundColor: leftColBg }]}>
                            {filterTypes.map(tab => {
                                const isActive = activeTab === tab.key;
                                const count = selectedFilters[tab.key].length;
                                return (
                                    <Pressable
                                        key={tab.key}
                                        onPress={() => setActiveTab(tab.key)}
                                        style={[
                                            styles.tabItem,
                                            isActive && {
                                                backgroundColor: theme.card,
                                                borderLeftWidth: 3,
                                                borderLeftColor: COLORS.primary,
                                            }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.tabText,
                                            {
                                                color: isActive ? COLORS.primary : theme.textSecondary,
                                                fontFamily: isActive ? FONTS.bold : FONTS.medium,
                                            }
                                        ]}>
                                            {tab.label}
                                            {count > 0 ? ` (${count})` : ''}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Right options */}
                        <View style={styles.rightColumn}>
                            {filterTypes.find(t => t.key === activeTab)?.options.length === 0 ? (
                                <View style={styles.emptyOptions}>
                                    <Text style={{ color: theme.textTertiary, fontFamily: FONTS.regular, fontSize: 13 }}>
                                        No data available
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={filterTypes.find(t => t.key === activeTab)?.options}
                                    keyExtractor={item => item}
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
                                                    <Text
                                                        numberOfLines={1}
                                                        style={[
                                                            styles.optionText,
                                                            { color: isChecked ? theme.text : theme.textSecondary, fontFamily: FONTS.medium }
                                                        ]}
                                                    >
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
                            )}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity
                            onPress={handleReset}
                            style={[styles.footerBtn, { backgroundColor: theme.cardElevated, borderColor: theme.border, borderWidth: 1 }]}
                        >
                            <Text style={{ color: theme.textTertiary, fontSize: 13, fontFamily: FONTS.medium }}>
                                Reset
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleApply}
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
        height: SCREEN_HEIGHT * 0.55,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    handleContainer: { alignItems: 'center', paddingVertical: 8 },
    handle: { width: 36, height: 4, borderRadius: 2, opacity: 0.5 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 16 },
    splitView: { flex: 1, flexDirection: 'row' },
    leftColumn: { width: '30%' },
    rightColumn: { flex: 1, paddingHorizontal: 4 },
    tabItem: { paddingVertical: 14, paddingHorizontal: 12 },
    tabText: { fontSize: 12 },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    optionLabelContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    optionText: { fontSize: 13 },
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
    emptyOptions: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TransactionFilterModal;