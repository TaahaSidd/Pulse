import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import Button from '../components/Button';
import SMSService from '../services/SMSListener';
import { useDatabase } from '../context/DatabaseContext';

const { height, width } = Dimensions.get('window');

export default function NotificationPermissionScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const { db } = useDatabase();
  const [loading, setLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const goHome = () => navigation.replace('Home');

  const requestSMSPermission = async (fromModal = false) => {
    // If coming from modal and they click "Allow SMS Access",
    // close modal first then try — but if denied again just go Home
    if (fromModal) setShowManualModal(false);

    setLoading(true);
    try {
      const granted = await SMSService.requestPermissions();

      if (granted) {
        await SMSService.initialize(db, (newTx) => {
          console.log('New transaction detected:', newTx.merchant);
        });
        setLoading(false);
        goHome();
      } else {
        setLoading(false);
        if (fromModal) {
          // Already showed the warning once — don't loop, just go Home
          // User can enable from Settings later
          goHome();
        } else {
          setShowManualModal(true);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('Error requesting SMS permission:', error);
      if (fromModal) {
        goHome();
      } else {
        Alert.alert('Error', 'Failed to request permissions. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* Centered image + text */}
      <View style={styles.center}>
        <Image
          source={require('../assets/mobile-mockup.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
          Automated Tracking
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
          Pace reads your bank SMS to log expenses instantly — no manual entry, no forgotten spend.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={13} color={COLORS.primary} />
          <Text style={[styles.privacyText, { color: theme.textTertiary }]}>
            100% PRIVATE • NO DATA LEAVES YOUR PHONE
          </Text>
        </View>

        {Platform.OS === 'android' ? (
          <Button
            title="Allow SMS Access"
            variant="primary"
            fullWidth
            loading={loading}
            onPress={() => requestSMSPermission(false)}
          />
        ) : (
          <Button
            title="Continue to App"
            variant="primary"
            fullWidth
            onPress={goHome}
          />
        )}

        <TouchableOpacity onPress={() => setShowManualModal(true)} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            {Platform.OS === 'android' ? 'Setup manually later' : 'Manual entry only'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Warning modal */}
      <Modal
        visible={showManualModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowManualModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: COLORS.error + '15' }]}>
              <Ionicons name="warning-outline" size={40} color={COLORS.error} />
            </View>

            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
              Missing out
            </Text>

            <Text style={[styles.modalMessage, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
              Without SMS access, every transaction needs to be added manually.{'\n\n'}
              You can enable it anytime from Settings.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                onPress={() => requestSMSPermission(true)}
              >
                <Text style={[styles.modalButtonTextPrimary, { fontFamily: FONTS.bold }]}>
                  Allow SMS Access
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.cardElevated, borderWidth: 1, borderColor: theme.border }]}
                onPress={goHome}
              >
                <Text style={[styles.modalButtonText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                  I'll enter manually
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 20,
  },
  heroImage: {
    width: width * 0.8,
    height: height * 0.28,
  },
  title: { fontSize: 26, textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 22, opacity: 0.75, textAlign: 'center' },
  footer: { paddingHorizontal: 28, paddingBottom: 36 },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  privacyText: { fontSize: 10, letterSpacing: 1, fontWeight: 'bold' },
  skipButton: { marginTop: 18, alignItems: 'center' },
  skipText: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 24, textAlign: 'center', marginBottom: 12 },
  modalMessage: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  modalButtons: { width: '100%', gap: 12 },
  modalButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonText: { fontSize: 16 },
  modalButtonTextPrimary: { fontSize: 16, color: '#000' },
});