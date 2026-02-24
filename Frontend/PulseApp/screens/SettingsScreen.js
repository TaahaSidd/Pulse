import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

import { useBudget } from '../hooks/useBudget';
import { useSalary } from '../hooks/useSalary';
import { format } from 'date-fns';

import BottomNavBar from '../components/BottomNavBar';
import PulseModal from '../components/PulseModal';
import GeneralActionItem from '../components/GeneralActionItem';
import CustomSwitch from '../components/CustomSwitch';

import BankPatterns from '../utils/BankPatterns';

import { useAuth } from '../context/AuthContext';
import { StreakService } from '../utils/Streak';

export default function SettingsScreen({ navigation, isDarkMode = true, toggleTheme }) {
  const theme = getThemedColors(isDarkMode);
  const { budget, refresh } = useBudget();

  const { signOut } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('logout');
  const [limitAlerts, setLimitAlerts] = useState(true);

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


  // const handleLogout = async () => {
  //   setModalVisible(false);

  //   const { error } = await signOut();

  //   if (error) {
  //     console.error('Logout error ', error);
  //     return;
  //   }

  //   navigation.reset({
  //     index: 0,
  //     routes: [{ name: 'Login' }],
  //   });
  // };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>App Settings</Text>
        </View>

        {/* 1. Budget Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Budget Management</Text>
          <View style={[styles.groupedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="stats-chart-outline"
              label="Budget Overview"
              subtitle={budget ? `Monthly budget: ₹${budget.total_amount?.toLocaleString()}` : 'Set up monthly budget'}
              theme={theme}
              onPress={() => navigation.navigate('BudgetOverview')}
            />
            <GeneralActionItem
              icon="notifications-outline"
              label="Budget Alerts"
              subtitle="Notify at 80% usage"
              theme={theme}
              isLast={true}
              rightComponent={
                <CustomSwitch
                  value={limitAlerts}
                  onValueChange={setLimitAlerts}
                  isDarkMode={isDarkMode}
                />
              }
            />
          </View>
        </View>

        {/* 2. Pulse Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Pulse Progress</Text>

          <TouchableOpacity
            style={[styles.streakCard, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}
            onPress={() => navigation.navigate('StreakScreen')}
            activeOpacity={0.8}
          >
            <View style={styles.streakInfo}>
              <Ionicons name="flame" size={28} color={COLORS.primary} />
              <View style={{ marginLeft: 12 }}>
                {/* 3. Use the dynamic streakCount state here */}
                <Text style={[styles.streakTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                  {streakCount} Day Streak
                </Text>
                <Text style={[styles.streakSub, { color: theme.textTertiary }]}>
                  {streakCount > 0 ? "You're on fire!" : "Start your journey today"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={[styles.groupedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="trophy-outline"
              label="Achievements"
              subtitle="4 of 12 Badges Unlocked"
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('BadgesScreen')}
            />
          </View>
        </View>

        {/* 3. Notification Sources & UI */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Preferences</Text>
          <View style={[styles.groupedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="library-outline"
              label="Supported Banks"
              subtitle={`${Object.keys(BankPatterns.banks).length} Institutions Active`}
              theme={theme}
              onPress={() => navigation.navigate('SupportedBanks')}
            />
            <GeneralActionItem
              icon="moon-outline"
              label="Dark Mode"
              subtitle={isDarkMode ? 'Enabled' : 'Disabled'}
              theme={theme}
              rightComponent={
                <CustomSwitch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  isDarkMode={isDarkMode}
                />
              }
            />
            <GeneralActionItem
              icon="eye-off-outline"
              label="Ghost Mode"
              subtitle="Secure on-device processing"
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('GhostMode')}
            />
          </View>
        </View>

        {/* 4. General */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>General</Text>
          <View style={[styles.groupedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              label="Account"
              subtitle="Profile and Security"
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('UserProfile')}
            />
            {/* <GeneralActionItem
              label="Export Data"
              subtitle="Download your history (CSV)"
              theme={theme}
              onPress={() => { }}
            /> */}
            {/* <GeneralActionItem
              label="Log Out"
              theme={theme}
              isLast={true}
              isDestructive={true}
              onPress={() => {
                setModalType('logout');
                setModalVisible(true);
              }}
            /> */}
          </View>
        </View>

        {/* Updated Hero Branding */}
        <View style={styles.fullWidthBranding}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.megaBrandText, { color: theme.text, opacity: 0.04 }]}
          >
            Your finances, in sync.
          </Text>

          <View style={styles.footerInfo}>
            <Text style={[styles.tagline, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
              VERSION 1.0.0
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* <PulseModal
        visible={modalVisible}
        type={modalType}
        isDarkMode={isDarkMode}
        onPrimaryPress={handleLogout}
        onSecondaryPress={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      /> */}

      <BottomNavBar active="Settings" onNavigate={(screen) => navigation.navigate(screen)} isDarkMode={isDarkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginTop: 60, marginBottom: 30 },
  title: { fontSize: 32 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  groupedCard: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16 },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  actionLabel: { fontSize: 16 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 14, marginRight: 8 },
  branding: { alignItems: 'center', marginVertical: 20 },
  brandText: { fontSize: 24 },
  tagline: { fontSize: 12, opacity: 0.5, marginTop: 4 },
  switchContainer: { transform: [{ scale: 0.9 }] },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 12,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 18,
  },
  streakSub: {
    fontSize: 12,
  },


  fullWidthBranding: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  megaBrandText: {
    fontSize: 120,
    fontFamily: FONTS.bold,
    letterSpacing: -2,
    textAlign: 'center',
    width: '110%',
    lineHeight: 180,
    includeFontPadding: false,
  },
  footerInfo: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 3,
    opacity: 0.5,
  },
});