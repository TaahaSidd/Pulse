import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

export default function PersonalInfoScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);

  const InfoGroup = ({ label, value }) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
      <Text style={[styles.infoLabel, { color: theme.textTertiary, fontFamily: FONTS.semiBold }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: theme.text, fontFamily: FONTS.medium }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={[styles.headerLink, { color: COLORS.primary, fontFamily: FONTS.semiBold }]}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.screenTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Personal Information</Text>

        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.card }]}>
            <Ionicons name="person" size={50} color={theme.textTertiary} />
          </View>
          <Text style={[styles.userName, { color: theme.text, fontFamily: FONTS.bold }]}>Arjun Sharma</Text>
          <Text style={[styles.userId, { color: theme.textTertiary }]}>Profile ID: PLS-49210</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <InfoGroup label="FULL NAME" value="Arjun Sharma" />
          <InfoGroup label="EMAIL ADDRESS" value="arjun.sharma@example.in" />
          <InfoGroup label="PHONE NUMBER" value="+91 98765 43210" />
          <InfoGroup label="DATE OF BIRTH" value="14 May, 1992" />
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 20 }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>LOCATION</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>Mumbai, Maharashtra, India</Text>
          </View>
        </View>

        <Button
          title="Edit Profile"
          icon="pencil"
          style={{ marginTop: 30 }}
          onPress={() => navigation.navigate('EditProfile')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLink: {
    fontSize: 16,
  },
  screenTitle: {
    fontSize: 32,
    marginBottom: 30,
  },

  // --- PERSONAL INFO SPECIFIC ---
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  userName: {
    fontSize: 22,
    marginBottom: 4,
  },
  userId: {
    fontSize: 13,
    opacity: 0.6,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    padding: 20,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
  },

  // --- EDIT PROFILE SPECIFIC ---
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  picCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  changeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    marginTop: 4,
  },
  picLabel: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },

  // Custom Notched Input Styles
  inputWrapper: {
    marginBottom: 25,
    position: 'relative',
  },
  labelTag: {
    position: 'absolute',
    top: -10,
    left: 15,
    zIndex: 2,
    paddingHorizontal: 8,
  },
  labelText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  inputContainer: {
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  textInput: {
    fontSize: 16,
    fontFamily: FONTS.medium,
  },

  buttonGroup: {
    marginTop: 20,
  },
  securityText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 30,
    opacity: 0.5,
  },
});