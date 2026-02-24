import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import ScreenHeader from '../components/ScreenHeader';
import TransactionItem from '../components/TransactionItem';

const { width } = Dimensions.get('window');

function DonutChart({ categories, totalExpenses, theme, isDarkMode }) {
    const size = 180;
    const strokeWidth = 20;
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

    const getLabelStyle = (startAngle, sweepAngle, percentage) => {
        if (percentage < 5) return null;

        const angle = (startAngle + sweepAngle / 2) * (Math.PI / 180);
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

            {segments.map((segment, index) => {
                const labelStyle = getLabelStyle(segment.startAngle, segment.sweepAngle, parseFloat(segment.percentage));

                if (!labelStyle) return null;

                return (
                    <Text
                        key={`label-${index}`}
                        style={[
                            labelStyle,
                            {
                                color: theme.textSecondary,
                                fontFamily: FONTS.medium,
                                fontSize: 9,
                            }
                        ]}
                    >
                        {segment.percentage}%
                    </Text>
                );
            })}
        </View>
    );
}

export default function CategoryBreakdownScreen({ route, navigation }) {
    const {
        categories = [],
        totalExpenses = 0,
        isDarkMode = true,
        type = 'category'
    } = route.params || {};

    const showDonut = type === 'category';
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
            <ScreenHeader
                theme={theme}
                title={route.params?.title || 'Category Split'}
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 🎨 DONUT CHART (Categories only) */}
                {showDonut && (
                    <View style={styles.chartContainer}>
                        <DonutChart
                            categories={categories}
                            totalExpenses={totalExpenses}
                            theme={theme}
                            isDarkMode={isDarkMode}
                        />

                        <View style={styles.totalOverlay}>
                            <Text style={[styles.totalLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                TOTAL
                            </Text>
                            <Text style={[styles.totalValue, { color: theme.text, fontFamily: FONTS.bold }]}>
                                ₹{totalExpenses.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                )}

                {/* 📊 LIST - Using TransactionItem */}
                <View style={styles.listSection}>
                    <Text style={[styles.listTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                        Breakdown
                    </Text>

                    {categories.map((cat, i) => {
                        const percentage = ((cat.amount / totalExpenses) * 100).toFixed(1);

                        // ✅ Transform data to match TransactionItem format
                        const itemData = {
                            merchant: cat.name,
                            category: `${percentage}% of total`,
                            amount: cat.amount,
                            type: 'debit',
                            icon: cat.icon,
                            color: cat.color
                        };

                        return (
                            <TransactionItem
                                key={i}
                                item={itemData}
                                index={i}
                                isLast={i === categories.length - 1}
                                theme={theme}
                                showSubtitle={true}
                                onDelete={null}
                                onPress={() => {
                                }}
                                isDarkMode={isDarkMode}
                            />
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
    scrollContent: {
        paddingHorizontal: 0, // ✅ Changed: TransactionItem has its own padding
    },
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
    listSection: {
        marginTop: 10,
    },
    listTitle: {
        fontSize: FONT_SIZES.base,
        marginBottom: 15,
        paddingHorizontal: 20, // ✅ Add padding to title
    },
});