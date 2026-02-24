import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import PulseModal from '../components/PulseModal';
import GeneralActionItem from '../components/GeneralActionItem';
import GeneralInfoCard from '../components/GeneralInfoCard';

import { useAuth } from '../context/AuthContext';

export default function UserProfileScreen({ navigation, isDarkMode = true }) {
  const { user, loading } = useAuth();

  const theme = getThemedColors(isDarkMode);
  const [modalVisible, setModalVisible] = useState(false);

  const displayName = user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    'Guest';

  const email = user?.email || 'No email';

  console.log('User data', user);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <ScreenHeader
        mode="simple"
        theme={theme}
        title="Account"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.card }]}>
              <Ionicons name="person" size={60} color={theme.textTertiary} />
            </View>
          </View>
          <Text style={[styles.userName, { color: theme.text, fontFamily: FONTS.bold }]}>{displayName}</Text>
          <Text style={[styles.userEmail, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>{email}</Text>
        </View>

        {/* Account Settings Group */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>ACCOUNT SETTINGS</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="person-outline"
              label="Personal Information"
              theme={theme}
              onPress={() => navigation.navigate('PersonalInfo')}
            />
            <GeneralActionItem
              icon="shield-checkmark-outline"
              label="Security & Privacy"
              theme={theme}
              onPress={() => navigation.navigate('SecurityPrivacy')}
            />
            <GeneralActionItem
              icon="notifications-outline"
              label="Notification Preferences"
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('NotificationPreferences')}
            />
          </View>
        </View>

        {/* Support Group */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>SUPPORT</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <GeneralActionItem
              icon="help-circle-outline"
              label="Help Center"
              theme={theme}
              onPress={() => navigation.navigate('HelpCenterScreen')}
            />
            <GeneralActionItem
              icon="chatbubble-ellipses-outline"
              label="Send Feedback"
              theme={theme}
              isLast={true}
              onPress={() => navigation.navigate('FeedbackScreen')}
            />
          </View>
        </View>

        {/* Danger Action */}
        {/* <View style={styles.dangerContainer}>
          <Button
            title="Hold to Delete Account"
            variant="danger"
            icon="trash-outline"
            holdToTrigger={true}
            holdDuration={2500}
            onPress={() => setModalVisible(true)}
            fullWidth={true}
          />
          <Text style={[styles.hintText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            This action is permanent and clears all local data.
          </Text>
        </View> */}

        <View style={{ height: 120 }} />
      </ScrollView>

      <PulseModal
        visible={modalVisible}
        type="delete"
        isDarkMode={isDarkMode}
        onClose={() => setModalVisible(false)}
        onPrimaryPress={() => {
          setModalVisible(false);
          navigation.replace('Onboarding');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  userName: { fontSize: 22, marginBottom: 4 },
  userEmail: { fontSize: 14, opacity: 0.7 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  dangerContainer: { marginTop: 10, alignItems: 'center' },
  hintText: { fontSize: 12, marginTop: 12, textAlign: 'center', opacity: 0.6 },
  footerBranding: { alignItems: 'center', marginTop: 40 },
  versionText: { fontSize: 12, opacity: 0.6 },
  madeWithRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});