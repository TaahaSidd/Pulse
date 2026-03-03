import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import ScreenHeader from '../components/ScreenHeader';

export default function AppearanceScreen({ navigation, isDarkMode, toggleTheme }) {
    const theme = getThemedColors(isDarkMode);

    const ThemeOption = ({ label, active, onPress, mode }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            style={[
                styles.optionCard,
                { backgroundColor: theme.card, borderColor: active ? COLORS.primary : theme.border }
            ]}
            onPress={onPress}
        >
            <View style={[styles.previewBox, mode === 'dark' ? styles.previewDark : styles.previewLight]}>
                <View style={[styles.previewLine, { backgroundColor: mode === 'dark' ? '#333' : '#E0E0E0', width: '60%' }]} />
                <View style={[styles.previewLine, { backgroundColor: mode === 'dark' ? '#444' : '#F0F0F0', width: '40%' }]} />
                {active && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} style={styles.checkIcon} />}
            </View>
            <Text style={[styles.optionLabel, { color: theme.text, fontFamily: active ? FONTS.bold : FONTS.medium }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <SafeAreaView style={{ flex: 1 }}>
                <ScreenHeader
                    title="Appearance"
                    theme={theme}
                    showBack={true}
                    onBackPress={() => navigation.goBack()}
                />

                <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>
                        THEME MODE
                    </Text>

                    <View style={styles.row}>
                        <ThemeOption
                            label="Light"
                            active={!isDarkMode}
                            onPress={() => isDarkMode && toggleTheme()}
                            mode="light"
                        />
                        <ThemeOption
                            label="Dark"
                            active={isDarkMode}
                            onPress={() => !isDarkMode && toggleTheme()}
                            mode="dark"
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold, marginTop: 32 }]}>
                        ACCENT COLOR
                    </Text>

                    {/* Upcoming Accent Color Section */}
                    <View style={[styles.premiumCard, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
                        <View style={styles.premiumHeader}>
                            <View style={[styles.accentCircle, { backgroundColor: COLORS.primary }]} />
                            <View style={[styles.accentCircle, { backgroundColor: '#8B5CF6' }]} />
                            <View style={[styles.accentCircle, { backgroundColor: '#10B981' }]} />
                            <View style={[styles.accentCircle, { backgroundColor: '#F59E0B' }]} />

                            <View style={[styles.upcomingBadge, { backgroundColor: theme.border }]}>
                                <Text style={[styles.upcomingBadgeText, { color: theme.textSecondary }]}>UPCOMING</Text>
                            </View>
                        </View>

                        <View style={styles.premiumContent}>
                            <Text style={[styles.premiumTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                                Custom Accent Colors
                            </Text>
                            <Text style={[styles.premiumSubtitle, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                                Soon you'll be able to pick your own signature color for buttons, icons, and charts.
                            </Text>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollBody: { padding: 20 },
    sectionTitle: { fontSize: 11, letterSpacing: 1.5, marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    optionCard: { width: '48%', borderRadius: 20, borderWidth: 2, padding: 8 },
    previewBox: { height: 90, borderRadius: 14, padding: 14, justifyContent: 'center', marginBottom: 10, position: 'relative' },
    previewLight: { backgroundColor: '#F3F4F6' },
    previewDark: { backgroundColor: '#1F2937' },
    previewLine: { height: 6, borderRadius: 3, marginBottom: 8 },
    optionLabel: { textAlign: 'center', fontSize: 14 },
    checkIcon: { position: 'absolute', top: 10, right: 10 },

    premiumCard: {
        width: '100%',
        borderRadius: 24,
        borderWidth: 1,
        padding: 20,
        overflow: 'hidden',
    },
    premiumHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    accentCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: -10, // Tighter overlap
        borderWidth: 2,
        borderColor: 'transparent',
    },
    upcomingBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 'auto',
    },
    upcomingBadgeText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    premiumContent: {
        marginTop: 4,
    },
    premiumTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    premiumSubtitle: {
        fontSize: 13,
        lineHeight: 20,
    },
});