import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/Themes';
import { FONTS } from '../constants/Fonts';
import CategoryMapper from '../utils/CategoryMapper';

export default function CategoryFilterGrid({ selectedCategory, onSelect, theme }) {
    const categories = CategoryMapper.getAllCategories();

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.textTertiary, fontFamily: FONTS.bold }]}>
                CATEGORIES
            </Text>
            <View style={styles.grid}>
                {categories.map((cat) => {
                    const details = CategoryMapper.getCategoryDetails(cat);
                    const isSelected = selectedCategory === cat;

                    return (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => onSelect(isSelected ? null : cat)}
                            activeOpacity={0.7}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: isSelected ? details.color + '20' : theme.card,
                                    borderColor: isSelected ? details.color : theme.border,
                                    // Use 8pt grid radius from your THEME
                                    borderRadius: THEME.borderRadius.md,
                                }
                            ]}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: isSelected ? details.color : theme.bg + '50' }]}>
                                <Ionicons
                                    name={details.icon}
                                    size={THEME.sizes.icon.xs}
                                    color={isSelected ? '#FFF' : theme.textTertiary}
                                />
                            </View>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.chipText,
                                    {
                                        color: isSelected ? theme.text : theme.textSecondary,
                                        fontFamily: isSelected ? FONTS.bold : FONTS.medium,
                                        fontSize: THEME.fontSize.xs
                                    }
                                ]}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: THEME.spacing.small,
    },
    label: {
        fontSize: THEME.fontSize.micro,
        letterSpacing: 1.2,
        marginBottom: THEME.spacing[2],
        paddingHorizontal: THEME.spacing[1],
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: THEME.spacing[1], // 8px gap
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: THEME.spacing[1],
        paddingRight: THEME.spacing[2],
        height: THEME.sizes.buttonHeight.sm, // 40px
        borderWidth: 1,
        minWidth: '31%', // Fits 3 items per row roughly
        marginBottom: THEME.spacing[1],
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: THEME.spacing[1],
    },
    chipText: {
        flex: 1,
    }
});