// screens/CategoryBreakdownScreen.js - CUSTOM DONUT WITH SKIA 🔥
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, Path, Skia, Text as SkiaText } from '@shopify/react-native-skia';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const { width } = Dimensions.get('window');

function DonutChart({ categories, totalExpenses, theme, isDarkMode }) {
    // --- 1. Adjust these for size ---
    const size = 180;           // Smaller overall diameter
    const strokeWidth = 16;     // Much thinner line
    // --------------------------------

    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    const segments = useMemo(() => {
        let currentAngle = -90;
        return categories.map(cat => {
            const percentage = (cat.amount / totalExpenses);
            const sweepAngle = percentage * 360;
            const segment = {
                ...cat,
                percentage: (percentage * 100).toFixed(0),
                startAngle: currentAngle,
                sweepAngle: sweepAngle,
            };
            currentAngle += sweepAngle;
            return segment;
        });
    }, [categories, totalExpenses]);

    const createArc = (startAngle, sweepAngle) => {
        const path = Skia.Path.Make();
        path.addArc(
            { x: center - radius, y: center - radius, width: radius * 2, height: radius * 2 },
            startAngle,
            sweepAngle
        );
        return path;
    };

    const getLabelStyle = (startAngle, sweepAngle) => {
        const angle = (startAngle + sweepAngle / 2) * (Math.PI / 180);
        // labelRadius + 15 moves the text slightly outside the thin ring
        const labelRadius = radius + 22;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);

        return {
            position: 'absolute',
            left: x - 15,
            top: y - 10,
            width: 30,
            textAlign: 'center',
        };
    };

    return (
        <View style={{ width: size, height: size }}>
            <Canvas style={StyleSheet.absoluteFill}>
                {segments.map((segment, index) => (
                    <Path
                        key={index}
                        path={createArc(segment.startAngle, segment.sweepAngle)}
                        color={segment.color}
                        style="stroke"
                        strokeWidth={strokeWidth}
                        strokeCap="round"
                    />
                ))}
            </Canvas>

            {segments.map((segment, index) => (
                <Text
                    key={`label-${index}`}
                    style={[
                        getLabelStyle(segment.startAngle, segment.sweepAngle),
                        {
                            color: theme.textSecondary, // Subtle color for small labels
                            fontFamily: FONTS.medium,
                            fontSize: 9,
                        }
                    ]}
                >
                    {segment.percentage}%
                </Text>
            ))}
        </View>
    );
}
export default function CategoryBreakdownScreen({ route, navigation }) {
    const { categories = [], totalExpenses = 0, isDarkMode = true } = route.params || {};
    const theme = getThemedColors(isDarkMode);

    if (!categories || categories.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>No data provided</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: COLORS.primary, marginTop: 10 }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                    Category Split
                </Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 🎨 CUSTOM DONUT CHART */}
                <View style={styles.chartContainer}>
                    <DonutChart
                        categories={categories}
                        totalExpenses={totalExpenses}
                        theme={theme}
                        isDarkMode={isDarkMode}
                    />

                    {/* CENTER TOTAL */}
                    <View style={styles.totalOverlay}>
                        <Text style={[styles.totalLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            TOTAL
                        </Text>
                        <Text style={[styles.totalValue, { color: theme.text, fontFamily: FONTS.bold }]}>
                            ₹{totalExpenses.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* 📊 CATEGORY LIST */}
                <View style={styles.listSection}>
                    <Text style={[styles.listTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                        Breakdown
                    </Text>

                    {categories.map((cat, i) => {
                        const percentage = ((cat.amount / totalExpenses) * 100).toFixed(1);

                        return (
                            <View key={i} style={[styles.row, { backgroundColor: theme.cardElevated }]}>
                                {/* Icon */}
                                <View style={[styles.iconBox, { backgroundColor: cat.color + '20' }]}>
                                    <Ionicons name={cat.icon} size={20} color={cat.color} />
                                </View>

                                {/* Name & Percentage */}
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.name, { color: theme.text, fontFamily: FONTS.medium }]}>
                                        {cat.name}
                                    </Text>
                                    <View style={styles.percentageRow}>
                                        <View style={[styles.percentageBar, { backgroundColor: theme.border }]}>
                                            <View style={[
                                                styles.percentageFill,
                                                {
                                                    width: `${percentage}%`,
                                                    backgroundColor: cat.color
                                                }
                                            ]} />
                                        </View>
                                        <Text style={[styles.percentageText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                                            {percentage}%
                                        </Text>
                                    </View>
                                </View>

                                {/* Amount */}
                                <Text style={[styles.amount, { color: theme.text, fontFamily: FONTS.bold }]}>
                                    ₹{cat.amount.toLocaleString()}
                                </Text>
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    headerTitle: { fontSize: FONT_SIZES.lg },
    scrollContent: {
        paddingHorizontal: 20,
    },

    // 🎨 CHART STYLES
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30,
        position: 'relative',
    },
    totalOverlay: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalLabel: {
        fontSize: FONT_SIZES.xs,
        letterSpacing: 1,
        marginBottom: 4,
    },
    totalValue: {
        fontSize: FONT_SIZES.xxl,
    },

    // 📊 LIST STYLES
    listSection: {
        marginTop: 10,
    },
    listTitle: {
        fontSize: FONT_SIZES.base,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    name: {
        fontSize: FONT_SIZES.base,
        marginBottom: 6,
    },
    percentageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    percentageBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    percentageFill: {
        height: '100%',
        borderRadius: 3,
    },
    percentageText: {
        fontSize: FONT_SIZES.xs,
        minWidth: 40,
        textAlign: 'right',
    },
    amount: {
        fontSize: FONT_SIZES.base,
        marginLeft: 10,
    },
});