import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
//import RNNotifListener from 'react-native-android-notification-listener';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

export default function NotificationPermissionScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const [loading, setLoading] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const requestNotificationPermission = async () => {
    setLoading(true);

    try {
      if (Platform.OS === 'android') {
        // Check if notification listener permission is granted
        const status = await RNNotifListener.getPermissionStatus();

        if (status === 'authorized') {
          // Already granted
          console.log('✅ Notification listener already enabled');
          setLoading(false);
          navigation.replace('Home');
        } else {
          // Need to open settings
          setLoading(false);
          Alert.alert(
            'Enable Notification Access',
            'Pulse needs access to your notifications to automatically detect bank transactions.\n\nYou will be redirected to Settings. Please find "Pulse" in the list and enable it.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => setShowManualModal(true)
              },
              {
                text: 'Open Settings',
                onPress: async () => {
                  // Open notification listener settings
                  await RNNotifListener.requestPermission();

                  // After user returns, check status
                  setTimeout(async () => {
                    const newStatus = await RNNotifListener.getPermissionStatus();
                    if (newStatus === 'authorized') {
                      navigation.replace('Home');
                    } else {
                      setShowManualModal(true);
                    }
                  }, 1000);
                }
              }
            ]
          );
        }
      } else {
        // iOS - Notification reading not supported
        setLoading(false);
        setShowManualModal(true);
      }
    } catch (error) {
      setLoading(false);
      console.error('❌ Error requesting notification permission:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  const handleSkip = () => {
    // User clicked "Setup manually later" - show modal
    setShowManualModal(true);
  };

  const handleContinueManual = () => {
    // User accepts manual entry - go to home
    setShowManualModal(false);
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>

      <View style={[StyleSheet.absoluteFill, styles.techBackground]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={[styles.welcomeTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
            Automated Tracking
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Pulse securely reads your bank notifications to log expenses instantly.
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

        {Platform.OS === 'android' ? (
          <Button
            title="Enable Notification Access"
            variant="primary"
            fullWidth
            loading={loading}
            onPress={requestNotificationPermission}
          />
        ) : (
          <Button
            title="Continue to App"
            variant="primary"
            fullWidth
            onPress={handleSkip}
          />
        )}

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.textTertiary }]}>
            {Platform.OS === 'android' ? 'Setup manually later' : 'Manual entry only'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowManualModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalIconCircle, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="create-outline" size={48} color={COLORS.primary} />
            </View>

            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
              Manual Entry Required
            </Text>

            <Text style={[styles.modalMessage, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
              Without notification access, you'll need to manually add all your expenses. You can still track your spending, set budgets, and view insights.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary, { backgroundColor: theme.cardElevated }]}
                onPress={() => {
                  setShowManualModal(false);
                  requestNotificationPermission();
                }}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.primary, fontFamily: FONTS.semiBold }]}>
                  Enable Notifications
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: COLORS.primary }]}
                onPress={handleContinueManual}
              >
                <Text style={[styles.modalButtonTextPrimary, { fontFamily: FONTS.semiBold }]}>
                  Continue Anyway
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const StepItem = ({ icon, title, desc, theme, isLast }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepLeft}>
      <View style={[styles.stepIconContainer, { backgroundColor: theme.cardElevated }]}>
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
  techBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.outerSpace,
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
  stepsContainer: { paddingLeft: 10, marginBottom: 30 },
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  modalTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalButtonPrimary: {},
  modalButtonText: {
    fontSize: 16,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    color: '#000',
  },
});