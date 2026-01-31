import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import InfoBox from '../components/InfoBox';

export default function SecurityPrivacyScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);

  const TrustCard = ({ icon, title, description }) => (
    <View style={[styles.trustCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <View style={styles.trustContent}>
        <Text style={[styles.trustTitle, { color: theme.text, fontFamily: FONTS.bold }]}>{title}</Text>
        <Text style={[styles.trustDesc, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>{description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Security & Privacy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <InfoBox
          type="success"
          icon="shield-checkmark"
          text="Your financial data is encrypted and stored only on your device. We cannot see your balances or transactions."
          isDarkMode={isDarkMode}
        />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>HOW WE PROTECT YOU</Text>

        <TrustCard
          icon="lock-closed-outline"
          title="On-Device Processing"
          description="Pulse parses your SMS messages locally using our sandbox engine. No raw message text ever reaches our servers."
        />

        <TrustCard
          icon="key-outline"
          title="Bank-Grade Encryption"
          description="Local databases are protected with AES-256 encryption, the same standard used by global financial institutions."
        />

        <TrustCard
          icon="server-outline"
          title="Zero-Knowledge Sync"
          description="If you enable cloud sync, your data is encrypted with your own master key before being uploaded."
        />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>LEGAL & TRANSPARENCY</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://yourwebsite.com/privacy')}>
            <Text style={[styles.menuText, { color: theme.text, fontFamily: FONTS.medium }]}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openURL('https://yourwebsite.com/terms')}>
            <Text style={[styles.menuText, { color: theme.text, fontFamily: FONTS.medium }]}>Terms of Service</Text>
            <Ionicons name="open-outline" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

  
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 20, marginLeft: 10 },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  sectionLabel: { fontSize: 11, marginBottom: 12, marginTop: 25, letterSpacing: 1.5 },

  // Trust Card Styles
  trustCard: { flexDirection: 'row', padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  trustContent: { flex: 1 },
  trustTitle: { fontSize: 16, marginBottom: 4 },
  trustDesc: { fontSize: 13, lineHeight: 18 },

  // Menu styles
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  menuText: { fontSize: 15 },
  line: { height: 1, width: '100%' },

  // Danger Zone
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    backgroundColor: '#FF3B30' + '10'
  },
  dangerText: { color: '#FF3B30', fontSize: 14 },
  dangerSub: { color: '#888', fontSize: 11, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 }
});