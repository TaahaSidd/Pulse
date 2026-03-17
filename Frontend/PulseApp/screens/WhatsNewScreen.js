import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import ScreenHeader from '../components/ScreenHeader';

const CHANGELOG = [
    {
        version: '1.0.0',
        label: 'Current',
        date: 'March 2026',
        items: [
            'Auto SMS transaction detection',
            'Support for 25+ Indian banks & UPI apps',
            'Monthly budget tracking',
            'Spending insights & category breakdown',
            'Biometric lock',
            'Transaction history with search & filters',
            'Notification alerts for budgets',
        ],
    },
];

const ROADMAP = [
    {
        phase: 'Coming Soon',
        color: COLORS.primary,
        items: [
            'Custom categories',
            'CSV / PDF export',
            'Recurring payments & subscription tracker',
            'Split expenses with contacts',
        ],
    },
    {
        phase: 'Down the Road',
        color: '#A78BFA',
        items: [
            'Multi-currency support',
            'Bank balance tracking',
            'Widgets for home screen',
            'Cloud backup (optional, encrypted)',
        ],
    },
    {
        phase: 'Big Ideas',
        color: '#FB923C',
        items: [
            'On-device AI spending assistant',
            'Smart savings suggestions',
            'Family / shared budgets',
        ],
    },
];

export default function WhatsNewScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScreenHeader
                mode="simple"
                theme={theme}
                title="What's New"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Changelog */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>
                    RELEASES
                </Text>

                {CHANGELOG.map((release) => (
                    <View key={release.version} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.releaseHeader}>
                            <View style={styles.releaseLeft}>
                                <Text style={[styles.releaseVersion, { color: theme.text, fontFamily: FONTS.bold }]}>
                                    v{release.version}
                                </Text>
                                <Text style={[styles.releaseDate, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                                    {release.date}
                                </Text>
                            </View>
                            <View style={[styles.labelBadge, { backgroundColor: COLORS.primary + '20' }]}>
                                <Text style={[styles.labelBadgeText, { color: COLORS.primary, fontFamily: FONTS.bold }]}>
                                    {release.label}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        {release.items.map((item, i) => (
                            <View key={i} style={styles.itemRow}>
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginTop: 1 }} />
                                <Text style={[styles.itemText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Roadmap */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.semiBold, marginTop: 24 }]}>
                    ROADMAP
                </Text>

                {ROADMAP.map((phase) => (
                    <View key={phase.phase} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.phaseHeader}>
                            <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
                            <Text style={[styles.phaseTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                                {phase.phase}
                            </Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        {phase.items.map((item, i) => (
                            <View key={i} style={styles.itemRow}>
                                <Ionicons name="time-outline" size={16} color={phase.color} style={{ marginTop: 1 }} />
                                <Text style={[styles.itemText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                    {item}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Footer note */}
                <Text style={[styles.footerNote, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                    Have a feature idea? Send us feedback from Settings → Send Feedback.
                </Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 16, paddingBottom: 40 },
    sectionLabel: {
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 8,
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        marginBottom: 12,
    },
    releaseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    releaseLeft: { gap: 2 },
    releaseVersion: { fontSize: 17 },
    releaseDate: { fontSize: 12 },
    labelBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    labelBadgeText: { fontSize: 11 },
    phaseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    phaseDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    phaseTitle: { fontSize: 15 },
    divider: { height: 1, marginBottom: 12 },
    itemRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    itemText: { fontSize: 14, flex: 1, lineHeight: 20 },
    footerNote: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        marginTop: 8,
        opacity: 0.7,
    },
});