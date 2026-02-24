import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import { StreakService } from '../utils/Streak'; // Adjust this path to your util file
import InfoBox from '../components/InfoBox';
import ScreenHeader from '../components/ScreenHeader';

export default function StreakScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [streak, setStreak] = useState(0);
    const [weeklyProgress, setWeeklyProgress] = useState([]);

    // Animation Refs
    const checkmarkScale = useRef(new Animated.Value(0)).current;
    const numberOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadStreakWithAnimation();
    }, []);

    const loadStreakWithAnimation = async () => {
        // 1. Get existing data BEFORE we record today's hit
        const oldData = await StreakService.getStreak();
        const today = new Date().toLocaleDateString('en-CA');

        if (oldData.lastDate !== today) {
            // SHOW THE OLD DATA FIRST
            setStreak(oldData.count);
            generateWeeklyUI(oldData.history, false);

            // 2. Record today's activity (increments the streak)
            const newData = await StreakService.recordActivity();

            // 3. Trigger the "Pop" Animation after a short delay
            setTimeout(() => {
                // Fade number pulse
                Animated.sequence([
                    Animated.timing(numberOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
                    Animated.timing(numberOpacity, { toValue: 1, duration: 200, useNativeDriver: true })
                ]).start();

                setStreak(newData.count);
                generateWeeklyUI(newData.history, true);

                // Spring the checkmark
                Animated.spring(checkmarkScale, {
                    toValue: 1,
                    friction: 4,
                    tension: 40,
                    useNativeDriver: true
                }).start();
            }, 800);
        } else {
            // Already checked in today, just show the final state
            setStreak(oldData.count);
            generateWeeklyUI(oldData.history, true);
            checkmarkScale.setValue(1);
        }
    };

    const generateWeeklyUI = (history, includeToday) => {
        const daysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const todayIdx = new Date().getDay();
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - todayIdx);

        const progress = daysShort.map((day, index) => {
            const dateObj = new Date(startOfWeek);
            dateObj.setDate(startOfWeek.getDate() + index);
            const dateStr = dateObj.toLocaleDateString('en-CA');
            const isToday = index === todayIdx;
            const isCompleted = history.includes(dateStr);

            let status = 'upcoming';
            if (isCompleted) status = 'completed';
            else if (isToday) status = 'current';
            else if (index < todayIdx) status = 'missed';

            return { day, status, isToday };
        });
        setWeeklyProgress(progress);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScreenHeader
                mode="simple"
                theme={theme}
                title="Pulse Streak"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={styles.glowWrapper}>
                        <View style={[styles.glowCircle, { shadowColor: COLORS.primary }]} />
                        <Ionicons name="flame" size={80} color={COLORS.primary} />
                        <Animated.Text style={[styles.streakNumber, { color: theme.text, fontFamily: FONTS.bold, opacity: numberOpacity }]}>
                            {streak}
                        </Animated.Text>
                        <Text style={[styles.streakUnit, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>DAYS</Text>
                    </View>
                    <Text style={[styles.heroText, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                        {streak > 0 ? "You're on fire!" : "Start your streak!"}
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.cardLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>THIS WEEK</Text>
                    <View style={styles.calendarRow}>
                        {weeklyProgress.map((item, index) => (
                            <View key={index} style={styles.dayCol}>
                                <View style={[
                                    styles.dayCircle,
                                    item.status === 'completed' && { backgroundColor: COLORS.primary },
                                    item.status === 'missed' && { backgroundColor: '#FF3B3020', borderWidth: 1, borderColor: '#FF3B30' },
                                    item.status === 'current' && { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary },
                                    item.status === 'upcoming' && { backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border }
                                ]}>
                                    {item.status === 'completed' && (
                                        <Animated.View style={item.isToday ? { transform: [{ scale: checkmarkScale }] } : {}}>
                                            <Ionicons name="checkmark" size={16} color="#000" />
                                        </Animated.View>
                                    )}
                                    {item.status === 'missed' && <Ionicons name="close" size={16} color="#FF3B30" />}
                                </View>
                                <Text style={[styles.dayText, { color: theme.textTertiary }]}>{item.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <InfoBox
                    type="success"
                    icon="trending-up"
                    text="Every day you check your Pulse, you're one step closer to financial freedom."
                    isDarkMode={isDarkMode}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20 },
    heroSection: { alignItems: 'center', paddingVertical: 30 },
    glowWrapper: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    glowCircle: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: COLORS.primary + '10', shadowOpacity: 0.3, shadowRadius: 20, elevation: 5 },
    streakNumber: { fontSize: 48, marginTop: -5 },
    streakUnit: { fontSize: 14, letterSpacing: 2, marginTop: -5 },
    heroText: { fontSize: 24, marginBottom: 8 },
    card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
    cardLabel: { fontSize: 10, letterSpacing: 1.5, marginBottom: 20 },
    calendarRow: { flexDirection: 'row', justifyContent: 'space-between' },
    dayCol: { alignItems: 'center' },
    dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    dayText: { fontSize: 11, fontFamily: FONTS.bold },
});