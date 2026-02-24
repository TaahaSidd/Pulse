import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import InfoBox from '../components/InfoBox';
import GeneralActionItem from '../components/GeneralActionItem';
import CustomSwitch from '../components/CustomSwitch'; // 1. Import CustomSwitch

export default function GhostModeScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);

  // States for different privacy layers
  const [isGhostEnabled, setIsGhostEnabled] = useState(false);
  const [blurSnapshot, setBlurSnapshot] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);

  const handleMasterToggle = (val) => {
    setIsGhostEnabled(val);
    setBlurSnapshot(val);
    setHideBalances(val);
    setUseBiometrics(val);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader
        mode="simple"
        theme={theme}
        title="Ghost Mode"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.ghostIconCircle, { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }]}>
            <Ionicons name="eye-off" size={36} color={COLORS.primary} />
          </View>
          <Text style={[styles.heroText, { color: theme.text, fontFamily: FONTS.bold }]}>Pulse Ghost</Text>
          <Text style={[styles.heroSub, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            Activate a layer of invisibility for your financial data.
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>MASTER CONTROL</Text>
        <View style={[styles.groupedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <GeneralActionItem
            icon="shield-half-outline"
            iconColor={COLORS.primary}
            label="Master Ghost Switch"
            subtitle="Enable all privacy features"
            theme={theme}
            isLast={true}
            rightComponent={
              <CustomSwitch
                value={isGhostEnabled}
                onValueChange={handleMasterToggle}
                isDarkMode={isDarkMode}
              />
            }
          />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>PRIVACY LAYERS</Text>
        <View style={[styles.groupedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <GeneralActionItem
            icon="finger-print-outline"
            iconColor={COLORS.primary}
            label="Biometric Shield"
            subtitle="Require FaceID to open Pulse"
            theme={theme}
            rightComponent={
              <CustomSwitch
                value={useBiometrics}
                onValueChange={setUseBiometrics}
                isDarkMode={isDarkMode}
              />
            }
          />
          <GeneralActionItem
            icon="browsers-outline"
            iconColor={COLORS.primary}
            label="App Switcher Blur"
            subtitle="Blur content in multitasking view"
            theme={theme}
            rightComponent={
              <CustomSwitch
                value={blurSnapshot}
                onValueChange={setBlurSnapshot}
                isDarkMode={isDarkMode}
              />
            }
          />
          <GeneralActionItem
            icon="beaker-outline"
            iconColor={COLORS.primary}
            label="Stealth Balances"
            subtitle="Hide balances on Home screen"
            theme={theme}
            isLast={true}
            rightComponent={
              <CustomSwitch
                value={hideBalances}
                onValueChange={setHideBalances}
                isDarkMode={isDarkMode}
              />
            }
          />
        </View>

        <View style={{ marginTop: 24 }} >
          <InfoBox
            type="info"
            icon="shield-checkmark"
            text="Pulse Ghost ensures 100% on-device processing. No data ever leaves this phone."
            isDarkMode={isDarkMode}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 }, // Tightened from 20
  heroSection: { alignItems: 'center', marginBottom: 20, marginTop: 5 },
  ghostIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  heroText: { fontSize: 22, marginBottom: 4 },
  heroSub: { textAlign: 'center', paddingHorizontal: 20, lineHeight: 18, fontSize: 13, opacity: 0.8 },
  sectionLabel: { fontSize: 10, marginBottom: 8, marginTop: 20, letterSpacing: 1.5, marginLeft: 4, opacity: 0.7 },
  groupedCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' }, // Tighter radius
});