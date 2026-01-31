import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import InfoBox from '../components/InfoBox';

export default function GhostModeScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);

  // States for different privacy layers
  const [isGhostEnabled, setIsGhostEnabled] = useState(false);
  const [blurSnapshot, setBlurSnapshot] = useState(true);
  const [hideBalances, setHideBalances] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);

  const GhostOption = ({ title, subtitle, value, onValueChange, icon }) => (
    <View style={[styles.optionCard, { backgroundColor: theme.cardElevated }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text style={[styles.optionTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>{title}</Text>
        <Text style={[styles.optionSub, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.border, true: COLORS.primary + '80' }}
        thumbColor={value ? COLORS.primary : '#f4f3f4'}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Ghost Mode</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={[styles.ghostIconCircle, { borderColor: COLORS.primary }]}>
             <Ionicons name="eye-off" size={50} color={COLORS.primary} />
          </View>
          <Text style={[styles.heroText, { color: theme.text, fontFamily: FONTS.bold }]}>Pulse Ghost</Text>
          <Text style={[styles.heroSub, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            Activate a layer of invisibility for your financial data.
          </Text>
        </View>

        <GhostOption
                  icon="finger-print-outline"
                  title="Biometric Shield"
                  subtitle="Require Fingerprint/FaceID to open Pulse"
                  value={useBiometrics}
                  onValueChange={setUseBiometrics}
        />

        <GhostOption
          icon="录-outline"
          title="Master Ghost Switch"
          subtitle="Enable all privacy features at once"
          value={isGhostEnabled}
          onValueChange={(val) => {
            setIsGhostEnabled(val);
            setBlurSnapshot(val);
            setHideBalances(val);
          }}
        />

        <View style={styles.divider} />

        <GhostOption
          icon="browsers-outline"
          title="App Switcher Blur"
          subtitle="Blurs app content in multitasking view"
          value={blurSnapshot}
          onValueChange={setBlurSnapshot}
        />

        <GhostOption
          icon="beaker-outline"
          title="Stealth Balances"
          subtitle="Hide balance amounts on Home screen"
          value={hideBalances}
          onValueChange={setHideBalances}
        />

        <InfoBox
          type="info"
          icon="shield-checkmark"
          text="Pulse Ghost ensures 100% on-device processing. No data ever leaves this phone."
          isDarkMode={isDarkMode}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 30 },
  headerTitle: { fontSize: FONT_SIZES.lg },
  content: { paddingHorizontal: 20 },
  heroSection: { alignItems: 'center', marginBottom: 40 },
  ghostIconCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  heroText: { fontSize: 24, marginBottom: 10 },
  heroSub: { textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionTitle: { fontSize: 16, marginBottom: 2 },
  optionSub: { fontSize: 12, lineHeight: 16 },
  divider: { height: 1, width: '100%', marginVertical: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  infoBox: { flexDirection: 'row', padding: 16, borderRadius: 16, marginTop: 20, gap: 10 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 }
});