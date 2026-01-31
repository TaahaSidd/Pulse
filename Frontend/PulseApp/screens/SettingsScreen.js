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

import BankPatterns from '../utils/BankPatterns';

export default function SettingsScreen({ navigation, isDarkMode = true, toggleTheme }) {
  const theme = getThemedColors(isDarkMode);
  const { salary, daysUntilSalary } = useSalary();
  const { budget, refresh } = useBudget();


  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('logout');
  const [limitAlerts, setLimitAlerts] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refresh();
    });

    return unsubscribe;
  }, [navigation]);

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleLogout = () => {
    setModalVisible(false); // 1. Close the modal

    // 2. Wipe navigation history and go to Login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const PulseSwitch = ({ value, onValueChange }) => (
    <View style={styles.switchContainer}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#334155', true: COLORS.primary }}
        thumbColor={'#FFFFFF'}
        ios_backgroundColor="#334155"
      />
    </View>
  );

  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true, rightComponent, iconColor = COLORS.primary }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>

      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.settingSubtitle, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightComponent || (showArrow && (
        <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
      ))}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>App Settings</Text>
        </View>

        {/* Budget Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>
            Budget Management
          </Text>

          {/* Main Budget Entry Point */}
          <SettingItem
            icon="stats-chart-outline"
            title="Budget Overview"
            subtitle={salary ? `${daysUntilSalary} days until salary` : 'Set up salary budgets'}
            onPress={() => navigation.navigate('BudgetOverview')}
            theme={theme}
            hasData={!!salary}
          />

          {/* Budget Alerts */}
          <SettingItem
            icon="notifications-outline"
            title="Budget Alerts"
            subtitle="Notify at 80% usage"
            showArrow={false}
            rightComponent={<PulseSwitch value={limitAlerts} onValueChange={setLimitAlerts} />}
            theme={theme}
          />
        </View>


        {/* --- NEW: 2. PULSE PROGRESS (Streaks & Achievements) --- */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Pulse Progress</Text>

          {/* Streak Card */}
          <TouchableOpacity
            style={[styles.streakCard, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}
            onPress={() => navigation.navigate('StreakScreen')}
            activeOpacity={0.8}
          >
            <View style={styles.streakInfo}>
              <Ionicons name="flame" size={28} color={COLORS.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.streakTitle, { color: theme.text, fontFamily: FONTS.bold }]}>12 Day Streak</Text>
                <Text style={[styles.streakSub, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                  You've stayed under budget!
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          <SettingItem
            icon="trophy-outline"
            title="Achievements"
            subtitle="4 of 12 Badges Unlocked"
            onPress={() => navigation.navigate('BadgesScreen')}
          />
        </View>

        {/* 2. Notification Sources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Notification Sources</Text>
          <SettingItem
            icon="library-outline"
            title="Supported Banks"
            subtitle={`${Object.keys(BankPatterns.banks).length} Institutions Active`}
            onPress={() => navigation.navigate('SupportedBanks')}
          />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle={isDarkMode ? 'Enabled' : 'Disabled'}
            showArrow={false}
            rightComponent={<PulseSwitch value={isDarkMode} onValueChange={toggleTheme} />}
          />
          <SettingItem
            icon="eye-off-outline"
            title="Ghost Mode"
            subtitle="Secure on-device processing"
            onPress={() => navigation.navigate('GhostMode')}
          />
        </View>

        {/* 3. General (Simplified List) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>General</Text>
          <View style={[styles.groupedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>

            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]} onPress={() => navigation.navigate('UserProfile')}>
              <Text style={[styles.actionLabel, { color: theme.text, fontFamily: FONTS.semiBold }]}>Account</Text>
              <View style={styles.rowRight}>
                <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]} onPress={() => { }}>
              <Text style={[styles.actionLabel, { color: theme.text, fontFamily: FONTS.semiBold }]}>Export Data</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={() => openModal('logout')}>
              <Text style={[styles.actionLabel, { color: "#EF4444", fontFamily: FONTS.semiBold }]}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.branding}>
          <Text style={[styles.brandText, { color: COLORS.primary, fontFamily: FONTS.bold }]}>Pulse</Text>
          <Text style={[styles.tagline, { color: theme.textTertiary }]}>Version 1.0.0 (MVP)</Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <PulseModal
        visible={modalVisible}
        type={modalType}
        isDarkMode={isDarkMode}
        onPrimaryPress={handleLogout}
        onSecondaryPress={() => setModalVisible(false)}
        onClose={() => setModalVisible(false)}
      />

      <BottomNavBar active="Settings" onNavigate={handleNavigate} isDarkMode={isDarkMode} />
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
});