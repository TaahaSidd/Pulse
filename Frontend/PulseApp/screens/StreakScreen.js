import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import InfoBox from '../components/InfoBox';

const { width } = Dimensions.get('window');

export default function StreakScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);

    // Mock data for the week
    const weeklyProgress = [
        { day: 'M', status: 'completed' },
        { day: 'T', status: 'completed' },
        { day: 'W', status: 'completed' },
        { day: 'T', status: 'missed' },
        { day: 'F', status: 'completed' },
        { day: 'S', status: 'current' },
        { day: 'S', status: 'upcoming' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Pulse Streak</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Main Streak Hero */}
                <View style={styles.heroSection}>
                    <View style={[styles.glowCircle, { shadowColor: COLORS.primary }]}>
                        <Ionicons name="flame" size={80} color={COLORS.primary} />
                        <Text style={[styles.streakNumber, { color: theme.text, fontFamily: FONTS.bold }]}>12</Text>
                        <Text style={[styles.streakUnit, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>DAYS</Text>
                    </View>
                    <Text style={[styles.heroText, { color: theme.text, fontFamily: FONTS.semiBold }]}>You're on fire!</Text>
                    <Text style={[styles.heroSub, { color: theme.textTertiary }]}>Stay under budget for 3 more days to hit your 15-day milestone.</Text>
                </View>

                {/* Weekly Calendar View */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.cardLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>THIS WEEK</Text>
                    <View style={styles.calendarRow}>
                        {weeklyProgress.map((item, index) => (
                            <View key={index} style={styles.dayCol}>
                                <View style={[
                                    styles.dayCircle,
                                    item.status === 'completed' && { backgroundColor: COLORS.primary },
                                    item.status === 'missed' && { backgroundColor: '#FF3B30' + '20', borderWidth: 1, borderColor: '#FF3B30' },
                                    item.status === 'current' && { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary },
                                    item.status === 'upcoming' && { backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border }
                                ]}>
                                    {item.status === 'completed' && <Ionicons name="checkmark" size={16} color="#000" />}
                                    {item.status === 'missed' && <Ionicons name="close" size={16} color="#FF3B30" />}
                                </View>
                                <Text style={[styles.dayText, { color: theme.textTertiary }]}>{item.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Info & Stats */}
                <InfoBox
                    type="success"
                    icon="trending-up"
                    text="Your longest streak is 24 days. You're halfway to beating your personal best!"
                    isDarkMode={isDarkMode}
                />

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>UPCOMING REWARDS</Text>
                <TouchableOpacity style={[styles.rewardCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.rewardIcon}>
                        <Ionicons name="gift-outline" size={24} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.rewardTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Bronze Parser Badge</Text>
                        <Text style={[styles.rewardSub, { color: theme.textTertiary }]}>Unlocks at 15 days</Text>
                    </View>
                    <View style={styles.progressContainer}>
                        <Text style={[styles.progressText, { color: COLORS.primary }]}>80%</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 10 },
    headerTitle: { fontSize: 20, marginLeft: 12 },
    content: { paddingHorizontal: 20, paddingBottom: 40 },

    // Hero Section
    heroSection: { alignItems: 'center', paddingVertical: 40 },
    glowCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(0, 255, 157, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 157, 0.2)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        marginBottom: 25
    },
    streakNumber: { fontSize: 48, marginTop: -10 },
    streakUnit: { fontSize: 14, letterSpacing: 2 },
    heroText: { fontSize: 24, marginBottom: 8 },
    heroSub: { fontSize: 13, textAlign: 'center', paddingHorizontal: 30, lineHeight: 18 },

    // Calendar Card
    card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
    cardLabel: { fontSize: 11, letterSpacing: 1.5, marginBottom: 20 },
    calendarRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dayCol: { alignItems: 'center' },
    dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    dayText: { fontSize: 12, fontFamily: FONTS.bold },

    // Rewards
    sectionLabel: { fontSize: 11, letterSpacing: 1.5, marginBottom: 12, marginTop: 10 },
    rewardCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1 },
    rewardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rewardTitle: { fontSize: 15 },
    rewardSub: { fontSize: 12, marginTop: 2 },
    progressText: { fontFamily: FONTS.bold, fontSize: 14 }
});