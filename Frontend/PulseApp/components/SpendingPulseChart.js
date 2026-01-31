// components/SpendingPulseChart.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, endOfWeek } from 'date-fns';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BAR_MAX_H = 120; // tallest a bar can be
const X_LABEL_H = 22;  // space for x-axis labels below bars

// ─── Data ────────────────────────────────────────────────────
const prepareChartData = (dailyMap, selectedDate, viewMode) => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    if (viewMode === 'daily') {
        return eachDayOfInterval({ start: monthStart, end: monthEnd }).map(day => ({
            label: day.getDate().toString(),
            value: dailyMap[day.getDate()] || 0,
        }));
    }

    const weeks = eachWeekOfInterval(
        { start: monthStart, end: monthEnd },
        { weekStartsOn: 1 }
    );

    return weeks.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        let total = 0;
        eachDayOfInterval({
            start: weekStart > monthStart ? weekStart : monthStart,
            end: weekEnd < monthEnd ? weekEnd : monthEnd,
        }).forEach(day => {
            total += dailyMap[day.getDate()] || 0;
        });
        return { label: `W${index + 1}`, value: total };
    });
};

// ─── Component ───────────────────────────────────────────────
export default function SpendingPulseChart({ dailyMap, selectedDate, theme }) {
    const [viewMode, setViewMode] = useState('weekly');

    const data = useMemo(
        () => prepareChartData(dailyMap || {}, selectedDate, viewMode),
        [dailyMap, selectedDate, viewMode]
    );

    const hasData = data.some(d => d.value > 0);
    const isWeekly = viewMode === 'weekly';
    const maxVal = Math.max(...data.map(d => d.value), 1);

    const statValue = isWeekly
        ? Math.round(data.reduce((s, d) => s + d.value, 0) / (data.length || 1))
        : Math.max(...data.map(d => d.value), 0);

    const yTicks = [0, 1, 2, 3].map(i => Math.round((maxVal / 3) * i));
    const formatY = (v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : v === 0 ? '₹0' : `₹${v}`);

    const BAR_WIDTH = isWeekly ? 38 : 22;
    const GAP = isWeekly ? 14 : 8;

    return (
        <View style={styles.container}>
            {/* Toggle + stat */}
            <View style={styles.header}>
                <View style={[styles.toggle, { backgroundColor: theme.card }]}>
                    {['weekly', 'daily'].map(mode => (
                        <TouchableOpacity
                            key={mode}
                            onPress={() => setViewMode(mode)}
                            style={[styles.toggleBtn, viewMode === mode && { backgroundColor: COLORS.primary }]}
                        >
                            <Text style={[styles.toggleText, { color: viewMode === mode ? '#000' : theme.textSecondary }]}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.statSmall, { color: theme.textTertiary }]}>
                        {isWeekly ? 'Avg/week' : 'Peak day'}
                    </Text>
                    <Text style={[styles.statBig, { color: COLORS.primary }]}>
                        ₹{statValue.toLocaleString()}
                    </Text>
                </View>
            </View>

            {/* Chart card */}
            <View style={[styles.chartCard, { backgroundColor: theme.cardElevated }]}>
                {hasData ? (
                    <ScrollView
                        horizontal={!isWeekly}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={!isWeekly}
                    >
                        {/* Single row: [Y labels] [bars] */}
                        <View style={styles.chartRow}>

                            {/* Y-axis labels — 4 labels spaced to match bar height */}
                            <View style={[styles.yCol, { height: BAR_MAX_H }]}>
                                {[...yTicks].reverse().map((tick, i) => (
                                    <Text key={i} style={[styles.yLabel, { color: theme.textTertiary }]}>
                                        {formatY(tick)}
                                    </Text>
                                ))}
                            </View>

                            {/* Bars — each is a column: spacer on top, bar on bottom, label below */}
                            {data.map((item, i) => {
                                const barH = (item.value / maxVal) * BAR_MAX_H;
                                const intensity = item.value / maxVal;
                                const color =
                                    intensity > 0.7 ? COLORS.primary
                                        : intensity > 0.35 ? COLORS.primary + 'BB'
                                            : COLORS.primary + '66';

                                return (
                                    <View key={i} style={[styles.barCol, { width: BAR_WIDTH, marginRight: GAP }]}>
                                        {/* This pushes the bar down so it grows from bottom */}
                                        <View style={{ flex: 1 }} />
                                        {/* The actual bar */}
                                        <View style={[styles.bar, { height: barH, backgroundColor: color }]} />
                                        {/* X label below */}
                                        <Text style={[styles.xLabel, { color: theme.textTertiary }]}>{item.label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                ) : (
                    <View style={styles.empty}>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No spending this month</Text>
                    </View>
                )}
            </View>

            {/* Swipe hint */}
            {!isWeekly && hasData && (
                <Text style={[styles.hint, { color: theme.textTertiary }]}>Swipe to see all days</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    toggle: { flexDirection: 'row', borderRadius: 14, padding: 4 },
    toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
    toggleText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm },
    statSmall: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, marginBottom: 2 },
    statBig: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg },

    chartCard: { borderRadius: 24, padding: 14 },

    // Row that holds Y labels + all bars side by side
    chartRow: {
        flexDirection: 'row',
        alignItems: 'stretch', // all children same height
        height: BAR_MAX_H + X_LABEL_H, // explicit total height
    },

    // Y labels column — matches BAR_MAX_H, not the full row height
    yCol: {
        width: 42,
        justifyContent: 'space-between',
        // no paddingBottom — height is exactly BAR_MAX_H so labels align with bars
    },
    yLabel: { fontSize: 10, fontFamily: FONTS.regular, textAlign: 'right', paddingRight: 6 },

    // Each bar column: flex column, height = full row height
    barCol: {
        flexDirection: 'column',
        // height comes from parent's alignItems: stretch
    },
    bar: { borderRadius: 6, minHeight: 3 },

    // X label sits below the bar area
    xLabel: { fontSize: 10, fontFamily: FONTS.regular, marginTop: 4, textAlign: 'center', height: X_LABEL_H },

    empty: { height: 160, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontFamily: FONTS.regular },
    hint: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 8 },
});