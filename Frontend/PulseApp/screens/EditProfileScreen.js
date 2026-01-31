import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

export default function EditProfileScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);

  const CustomInput = ({ label, value, placeholder }) => (
    <View style={styles.inputWrapper}>
      <View style={[styles.labelTag, { backgroundColor: theme.bg }]}>
        <Text style={[styles.labelText, { color: COLORS.primary }]}>{label}</Text>
      </View>
      <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.textInput, { color: theme.text }]}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.headerLink, { color: COLORS.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.screenTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Edit Profile</Text>

        <View style={styles.profilePicContainer}>
          <TouchableOpacity style={[styles.picCircle, { borderColor: theme.border }]}>
            <Ionicons name="camera" size={28} color={COLORS.primary} />
            <Text style={[styles.changeText, { color: theme.text }]}>CHANGE</Text>
          </TouchableOpacity>
          <Text style={[styles.picLabel, { color: theme.textTertiary }]}>PROFILE PICTURE</Text>
        </View>

        <CustomInput label="Full Name" value="Arjun Sharma" />
        <CustomInput label="Email Address" value="arjun.sharma@example.in" />
        <CustomInput label="Phone Number" value="+91 98765 43210" />
        <CustomInput label="Location" value="Mumbai, Maharashtra" />
        <CustomInput label="Primary UPI ID" value="arjun@upi" />

        <View style={styles.buttonGroup}>
          <Button title="Save Changes" onPress={() => navigation.goBack()} />
          <Button title="Discard Changes" variant="secondary" style={{ marginTop: 12 }} onPress={() => navigation.goBack()} />
        </View>

        <Text style={[styles.securityText, { color: theme.textTertiary }]}>
          PULSE PRIVATE SECURITY{"\n"}
          Data is encrypted and stored locally in Bharat
        </Text>
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