import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
// ❌ REMOVED: import { Canvas, Points, vec } from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

export default function NotificationPermissionScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const [loading, setLoading] = useState(false);

  // ❌ REMOVED: grid generation code

  const handleEnable = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Home');
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* ✅ SIMPLE TECH BACKGROUND - NO CRASHES */}
      <View style={[
        StyleSheet.absoluteFill,
        styles.techBackground,
        {
          backgroundColor: isDarkMode
            ? 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 50%, #F1F5F9 100%)'
        }
      ]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={[styles.welcomeTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
            Automated Tracking
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Pulse securely scans your bank notifications to log expenses instantly.
            No manual entry, no forgotten spend.
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <StepItem
            icon="notifications-outline"
            title="Notification Received"
            desc="Listen for transaction alerts from any bank"
            theme={theme}
          />
          <StepItem
            icon="shield-checkmark-outline"
            title="Local Processing"
            desc="Data is parsed securely on your device"
            theme={theme}
          />
          <StepItem
            icon="bar-chart-outline"
            title="Automatic Insights"
            desc="Instant categorization and reporting"
            theme={theme}
            isLast
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={14} color={COLORS.primary} />
          <Text style={[styles.privacyText, { color: theme.textTertiary }]}>
            100% PRIVATE • NO DATA LEAVES YOUR PHONE
          </Text>
        </View>

        <Button
          title="Enable Permissions"
          variant="primary"
          fullWidth
          loading={loading}
          onPress={handleEnable}
        />

        <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.textTertiary }]}>Setup manually later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StepItem component stays the same...
const StepItem = ({ icon, title, desc, theme, isLast }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepLeft}>
      <View style={[styles.stepIconContainer, { backgroundColor: theme.bg }]}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      {!isLast && <View style={[styles.stepLine, { backgroundColor: theme.divider }]} />}
    </View>

    <View style={styles.stepRight}>
      <Text style={[styles.stepTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
        {title}
      </Text>
      <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
        {desc}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  // ✅ NEW TECH BACKGROUND
  techBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: { paddingHorizontal: 30, paddingTop: 80, paddingBottom: 40 },
  heroSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7
  },
  stepsContainer: { paddingLeft: 10 },
  stepRow: { flexDirection: 'row' },
  stepLeft: { alignItems: 'center', marginRight: 20 },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepLine: { width: 1.5, height: 50, marginTop: -5, marginBottom: -5 },
  stepRight: {
    flex: 1,
    paddingBottom: 35,
    justifyContent: 'flex-start',
    paddingTop: 8
  },
  stepTitle: { fontSize: 17, marginBottom: 4 },
  stepDesc: { fontSize: 14, opacity: 0.8 },
  footer: { paddingHorizontal: 30, paddingBottom: 40, paddingTop: 10 },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  privacyText: { fontSize: 11, letterSpacing: 1, fontWeight: 'bold' },
  skipButton: { marginTop: 20, alignItems: 'center' },
  skipText: { fontSize: 14 },
});
