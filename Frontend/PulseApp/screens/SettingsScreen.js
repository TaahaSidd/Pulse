import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import { useBudget } from '../hooks/useBudget';
import { StreakService } from '../utils/Streak';

import BottomNavBar from '../components/BottomNavBar';
import GeneralActionItem from '../components/GeneralActionItem';
import BankPatterns from '../utils/BankPatterns';

// ── App version constant ──────────────────────────────────
const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

export default function SettingsScreen({ navigation, isDarkMode = true, toggleTheme }) {
  const theme = getThemedColors(isDarkMode);
  const { budget, refresh } = useBudget();
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refresh();
      loadStreakData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadStreakData = async () => {
    const data = await StreakService.getStreak();
    setStreakCount(data.count);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>Settings</Text>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Account</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="person-outline"
              label="Profile"
              subtitle="Edit your name and details"
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('UserProfile')}
            />
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Budget</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="stats-chart-outline"
              label="Budget Overview"
              subtitle={budget ? `₹${budget.total_amount?.toLocaleString()} this month` : 'Set up monthly budget'}
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('BudgetOverview')}
            />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="color-palette-outline"
              label="Appearance"
              subtitle={isDarkMode ? 'Dark Mode' : 'Light Mode'}
              theme={theme}
              onPress={() => navigation.navigate('Appearance')}
            />
            <GeneralActionItem
              icon="notifications-outline"
              label="Notifications"
              subtitle="Transaction and budget alerts"
              theme={theme}
              onPress={() => navigation.navigate('NotificationPreferences')}
            />
            <GeneralActionItem
              icon="eye-off-outline"
              label="Hide your Pace"
              subtitle="Biometric lock and privacy"
              theme={theme}
              onPress={() => navigation.navigate('GhostMode')}
            />
            <GeneralActionItem
              icon="library-outline"
              label="Supported Banks"
              subtitle="Works with most Indian banks"
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('SupportedBanks')}
            />
          </View>
        </View>

        {/* Help */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Support</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="sparkles-outline"
              label="What's New"
              subtitle="Changelog & upcoming features"
              theme={theme}
              onPress={() => navigation.navigate('WhatsNew')}
            />
            <GeneralActionItem
              icon="help-circle-outline"
              label="Help Center"
              subtitle="FAQs and guides"
              theme={theme}
              onPress={() => navigation.navigate('HelpCenterScreen')}
            />
            <GeneralActionItem
              icon="chatbubble-outline"
              label="Send Feedback"
              subtitle="Help us improve Pace"
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('FeedbackScreen')}
            />
          </View>
        </View>

        {/* Footer branding */}
        <View style={styles.footerBrandingContainer}>
          <Text style={[styles.megaBrandText, { color: theme.text, opacity: 0.06 }]}>
            Your finances,{"\n"}in sync.
          </Text>
          <View style={styles.footerInfo}>
            <Text style={[styles.versionText, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
              PACE v{APP_VERSION} ({BUILD_NUMBER})
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar active="Settings" onNavigate={(screen) => navigation.navigate(screen)} isDarkMode={isDarkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginTop: 60, marginBottom: 30 },
  title: { fontSize: 32 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  footerBrandingContainer: {
    marginTop: 30,
    paddingHorizontal: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  megaBrandText: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    letterSpacing: -1,
    textAlign: 'left',
    lineHeight: 52,
    includeFontPadding: false,
  },
  footerInfo: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  versionText: {
    fontSize: 10,
    letterSpacing: 2,
    opacity: 0.5,
    textTransform: 'uppercase',
  },
});