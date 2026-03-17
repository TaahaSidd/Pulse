import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import BudgetDB from '../database/BudgetDB';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../components/Button';
import PulseModal from '../components/PulseModal';
import ScreenHeader from '../components/ScreenHeader';
import InfoBox from '../components/InfoBox';
import GeneralActionItem from '../components/GeneralActionItem';

export default function SecurityPrivacyScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const [modalVisible, setModalVisible] = useState(false);

  const handleWipeData = async () => {
    try {
      await BudgetDB.deleteAllData();
      await AsyncStorage.clear();
      setModalVisible(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      console.error("Wipe failed", error);
    }
  };

  const TrustCard = ({ title, description }) => (
    <View style={[styles.trustCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.trustTitle, { color: theme.text, fontFamily: FONTS.bold }]}>{title}</Text>
      <Text style={[styles.trustDesc, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>{description}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader
        mode="simple"
        theme={theme}
        title="Security & Privacy"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* <InfoBox
          type="success"
          icon="shield-checkmark"
          text="Your financial data is stored locally and never leaves this device."
          isDarkMode={isDarkMode}
        /> */}

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>DATA PROTECTION</Text>

        <TrustCard
          title="On-Device Parsing"
          description="Pace processes SMS locally using a secure sandbox. Raw message content is never uploaded to any cloud."
        />

        <TrustCard
          title="Bank-Grade Storage"
          description="Your local database is encrypted using industry-standard AES-256 encryption protocols."
        />

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>LEGAL & TRANSPARENCY</Text>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <GeneralActionItem
            label="Privacy Policy"
            theme={theme}
            rightComponent={<Ionicons name="open-outline" size={16} color={theme.textTertiary} />}
            onPress={() => Linking.openURL('https://doc-hosting.flycricket.io/pace-privacy-policy/d4166815-f8ba-4bb9-a2f8-dd3a22c6e0d8/privacy')}
          />
          <GeneralActionItem
            label="Terms of Service"
            theme={theme}
            isLast={true}
            rightComponent={<Ionicons name="open-outline" size={16} color={theme.textTertiary} />}
            onPress={() => Linking.openURL('https://doc-hosting.flycricket.io/pace-privacy-policy/d4166815-f8ba-4bb9-a2f8-dd3a22c6e0d8/privacy')}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: '#FF5252', fontFamily: FONTS.bold }]}>DATA MANAGEMENT</Text>

        <View style={[styles.dangerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.dangerTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Reset All Data</Text>
          <Text style={[styles.dangerDesc, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
            This wipes all transactions, budgets, and settings. This cannot be undone.
          </Text>

          <Button
            title="Hold to Wipe Data"
            variant="danger"
            icon="trash-outline"
            holdToTrigger={true}
            holdDuration={3000}
            onPress={() => setModalVisible(true)}
            fullWidth={true}
          />
        </View>

        {/* 🆕 SYSTEM INFO (Added value for offline users) */}
        {/* <View style={styles.systemInfo}>
          <Text style={[styles.systemText, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
            Storage: Local SQLite Database
          </Text>
          <Text style={[styles.systemText, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
            Pulse Version 1.0.0 (Stable)
          </Text>
        </View> */}

        <View style={{ height: 40 }} />
      </ScrollView>

      <PulseModal
        visible={modalVisible}
        type="delete"
        title="Final Warning"
        message="This will wipe your entire local history. This action cannot be undone."
        onClose={() => setModalVisible(false)}
        onPrimaryPress={handleWipeData}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 10, marginBottom: 8, marginTop: 22, letterSpacing: 1.2, marginLeft: 4 },

  // Compact Trust Card
  trustCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10
  },
  trustTitle: { fontSize: 15, marginBottom: 4 },
  trustDesc: { fontSize: 12, lineHeight: 18, opacity: 0.8 },

  // Compact Legal Group
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },

  // Compact Danger Card
  dangerCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  dangerTitle: { fontSize: 15, marginBottom: 2 },
  dangerDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
    opacity: 0.7,
  },

  // System Info Section
  systemInfo: {
    marginTop: 30,
    alignItems: 'center',
    gap: 4
  },
  systemText: {
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  }
});