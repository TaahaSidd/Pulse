// components/SpendingPulseChart.js
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, endOfWeek } from 'date-fns';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import SegmentedFilter from './SegmentedFilter'; // <-- Added this

const SCREEN_WIDTH = Dimensions.get('window').width;
const BAR_MAX_H = 120;
const X_LABEL_H = 22;

const prepareChartData = (dailyMap, selectedDate, viewMode) => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    // Matching the likely 'Daily' string from your SegmentedFilter
    if (viewMode.toLowerCase() === 'daily') {
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

export default function SpendingPulseChart({ dailyMap, selectedDate, theme }) {
    // Initializing with 'Weekly' to match SegmentedFilter style
    const [viewMode, setViewMode] = useState('Weekly');

    const data = useMemo(
        () => prepareChartData(dailyMap || {}, selectedDate, viewMode),
        [dailyMap, selectedDate, viewMode]
    );

    const hasData = data.some(d => d.value > 0);
    const isWeekly = viewMode.toLowerCase() === 'weekly';
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
            <View style={styles.header}>
                {/* --- Replaced old toggle with SegmentedFilter --- */}
                <View style={{ width: 150 }}>
                    <SegmentedFilter
                        options={['Weekly', 'Daily']}
                        activeFilter={viewMode}
                        onSelect={setViewMode}
                        theme={theme}
                    />
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

            <View style={[styles.chartCard, { backgroundColor: theme.cardElevated }]}>
                {hasData ? (
                    <ScrollView
                        horizontal={!isWeekly}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={!isWeekly}
                    >
                        <View style={styles.chartRow}>
                            <View style={[styles.yCol, { height: BAR_MAX_H }]}>
                                {[...yTicks].reverse().map((tick, i) => (
                                    <Text key={i} style={[styles.yLabel, { color: theme.textTertiary }]}>
                                        {formatY(tick)}
                                    </Text>
                                ))}
                            </View>

                            {data.map((item, i) => {
                                const barH = (item.value / maxVal) * BAR_MAX_H;
                                const intensity = item.value / maxVal;
                                const color =
                                    intensity > 0.7 ? COLORS.primary
                                        : intensity > 0.35 ? COLORS.primary + 'BB'
                                            : COLORS.primary + '66';

                                return (
                                    <View key={i} style={[styles.barCol, { width: BAR_WIDTH, marginRight: GAP }]}>
                                        <View style={{ flex: 1 }} />
                                        <View style={[styles.bar, { height: barH, backgroundColor: color }]} />
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

            {!isWeekly && hasData && (
                <Text style={[styles.hint, { color: theme.textTertiary }]}>Swipe to see all days</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    statSmall: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, marginBottom: 2 },
    statBig: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg },
    chartCard: { borderRadius: 24, padding: 14 },
    chartRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        height: BAR_MAX_H + X_LABEL_H,
    },
    yCol: {
        width: 42,
        justifyContent: 'space-between',
    },
    yLabel: { fontSize: 10, fontFamily: FONTS.regular, textAlign: 'right', paddingRight: 6 },
    barCol: {
        flexDirection: 'column',
    },
    bar: { borderRadius: 6, minHeight: 3 },
    xLabel: { fontSize: 10, fontFamily: FONTS.regular, marginTop: 4, textAlign: 'center', height: X_LABEL_H },
    empty: { height: 160, alignItems: 'center', justifyContent: 'center' },
    emptyText: { fontFamily: FONTS.regular },
    hint: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, textAlign: 'center', marginTop: 8 },
});