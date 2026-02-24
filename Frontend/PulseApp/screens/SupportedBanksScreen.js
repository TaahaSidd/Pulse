import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

import BankPatterns from '../utils/BankPatterns';
import { BANK_LOGOS, getBankLogo } from '../constants/BankLogos';

import ScreenHeader from '../components/ScreenHeader';
import InfoBox from '../components/InfoBox';


export default function SupportedBanksScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);

  // Helper to render the grid items
  const InstitutionGrid = ({ data, typeIcon }) => (
    <View style={styles.grid}>
      {Object.keys(data).map((key) => {
        const logoAsset = BANK_LOGOS[key];

        return (
          <View key={key} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[
              styles.iconBox,
              { backgroundColor: logoAsset ? 'transparent' : COLORS.primary + '15' }
            ]}>
              {logoAsset ? (
                <Image
                  source={logoAsset}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name={typeIcon} size={20} color={COLORS.primary} />
              )}
            </View>
            <Text style={[styles.cardTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
              {key.replace('_', ' ')}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>

        {/*HEADER*/}
        <ScreenHeader
          mode="simple"
          theme={theme}
          title="Supported Banks"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          <Text style={[styles.description, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            Pulse uses advanced local parsing to securely read transaction notifications from these institutions.
          </Text>

          <Text style={[styles.sectionHeader, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>Traditional Banks</Text>
          <InstitutionGrid data={BankPatterns.banks} typeIcon="business-outline" />

          <Text style={[styles.sectionHeader, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>UPI & Digital Apps</Text>
          <InstitutionGrid data={BankPatterns.upi} typeIcon="flash-outline" />

          <InfoBox
            type="info"
            icon="shield-checkmark"
            text="Don't see your bank? Our generic engine will still attempt to track it securely. We are constantly adding support for new banks based on user demand."
            isDarkMode={isDarkMode}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20,
    position: 'relative'
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 60,
    zIndex: 10
  },
  title: {
    fontSize: FONT_SIZES.xl,
    textAlign: 'center'
  },
  scrollBody: { paddingHorizontal: 20 },
  description: { fontSize: FONT_SIZES.sm, marginBottom: 30, lineHeight: 20 },
  sectionHeader: { fontSize: FONT_SIZES.xs, textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  card: { width: '48%', borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 15, alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  cardTitle: { fontSize: FONT_SIZES.base, textAlign: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#4ADE8020', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4ADE80', marginRight: 5 },
  statusText: { fontSize: 8, color: '#4ADE80', fontWeight: '800' },
  infoFooter: { padding: 20, borderRadius: 24, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 15 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 }
});