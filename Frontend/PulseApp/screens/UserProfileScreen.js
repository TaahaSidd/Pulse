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
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import Button from '../components/Button';
import PulseModal from '../components/PulseModal';

export default function UserProfileScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const [modalVisible, setModalVisible] = useState(false);

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const ProfileItem = ({ icon, title, onPress, isLast = false, color = COLORS.primary }) => (
    <TouchableOpacity
      style={[
        styles.profileItem,
        { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: theme.border }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={[styles.itemText, { color: theme.text, fontFamily: FONTS.semiBold }]}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Back & Edit */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.screenTitle, { color: theme.text, fontFamily: FONTS.bold }]}>User Profile</Text>

        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarCircle, { backgroundColor: theme.card }]}>
              <Ionicons name="person" size={60} color={theme.textTertiary} />
            </View>
            <TouchableOpacity style={[styles.cameraBadge, { backgroundColor: theme.bg, borderColor: COLORS.primary }]}>
              <Ionicons name="camera" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text, fontFamily: FONTS.bold }]}>Arjun Sharma</Text>
          <Text style={[styles.userEmail, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>arjun.sharma@example.in</Text>
        </View>

        {/* Account Settings Group */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>ACCOUNT SETTINGS</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ProfileItem icon="person-outline" title="Personal Information" onPress={() => navigation.navigate('PersonalInfo')} />
            <ProfileItem icon="shield-checkmark-outline" title="Security & Privacy" onPress={() => navigation.navigate('SecurityPrivacy')} />
            <ProfileItem icon="notifications-outline" title="Notification Preferences" onPress={() => navigation.navigate('NotificationPreferences')} isLast={true} />
          </View>
        </View>

        {/* Support Group */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>SUPPORT</Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ProfileItem icon="help-circle-outline" title="Help Center" onPress={() => navigation.navigate('HelpCenterScreen')} />
            <ProfileItem icon="chatbubble-ellipses-outline" title="Send Feedback" onPress={() => navigation.navigate('FeedbackScreen')} isLast={true} />
          </View>
        </View>

        {/* Danger Action - Using your new Button component */}
        <View style={styles.dangerContainer}>
          <Button
            title="Hold to Delete Account"
            variant="danger"
            icon="trash-outline"
            holdToTrigger={true}
            holdDuration={2500} // 2.5 seconds
            onPress={() => setModalVisible(true)}
            fullWidth={true}
          />
          <Text style={[styles.hintText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            This action is permanent and clears all local data.
          </Text>
        </View>

        <View style={styles.footerBranding}>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>Pulse MVP Version 1.0.0</Text>
          <View style={styles.madeWithRow}>
            <Text style={[styles.versionText, { color: theme.textTertiary }]}>Made with </Text>
            <Ionicons name="heart" size={12} color="#EF4444" />
            <Text style={[styles.versionText, { color: theme.textTertiary }]}> for Bharat</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Final Confirmation Modal */}
      <PulseModal
        visible={modalVisible}
        type="delete"
        isDarkMode={isDarkMode}
        onClose={() => setModalVisible(false)}
        onPrimaryPress={() => {
          setModalVisible(false);
          // Add actual deletion logic here
          navigation.replace('Onboarding');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, marginBottom: 10 },
  editText: { fontSize: 16 },
  screenTitle: { fontSize: 32, marginBottom: 30 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, padding: 8, borderRadius: 20, borderWidth: 2 },
  userName: { fontSize: 22, marginBottom: 4 },
  userEmail: { fontSize: 14, opacity: 0.7 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  profileItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  itemText: { fontSize: 16 },

  // Danger Section Styles
  dangerContainer: { marginTop: 10, alignItems: 'center' },
  hintText: { fontSize: 12, marginTop: 12, textAlign: 'center', opacity: 0.6 },

  footerBranding: { alignItems: 'center', marginTop: 40 },
  versionText: { fontSize: 12, opacity: 0.6 },
  madeWithRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
});