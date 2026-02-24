import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import InputField from '../components/InputField';

export default function EditProfileScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader
        mode="simple"
        theme={theme}
        title="Edit Profile"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profilePicContainer}>
          <TouchableOpacity style={[styles.picCircle, { borderColor: theme.border, backgroundColor: theme.card }]}>
            <Ionicons name="camera" size={28} color={COLORS.primary} />
            <Text style={[styles.changeText, { color: theme.text }]}>CHANGE</Text>
          </TouchableOpacity>
          <Text style={[styles.picLabel, { color: theme.textTertiary }]}>PROFILE PICTURE</Text>
        </View>

        <View style={styles.form}>
          <InputField
            label="Full Name"
            placeholder="e.g. Arjun Sharma"
            leftIcon="person-outline"
            defaultValue="Arjun Sharma"
            isDarkMode={isDarkMode}
          />

          <InputField
            label="Email Address"
            placeholder="name@example.com"
            leftIcon="mail-outline"
            keyboardType="email-address"
            defaultValue="arjun.sharma@example.in"
            isDarkMode={isDarkMode}
          />

          <InputField
            label="Phone Number"
            placeholder="+91 XXXXX XXXXX"
            leftIcon="call-outline"
            keyboardType="phone-pad"
            defaultValue="+91 98765 43210"
            isDarkMode={isDarkMode}
          />

          <InputField
            label="Location"
            placeholder="City, State"
            leftIcon="location-outline"
            defaultValue="Mumbai, Maharashtra"
            isDarkMode={isDarkMode}
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Save Changes"
            onPress={() => navigation.goBack()}
          />
          <Button
            title="Discard Changes"
            variant="secondary"
            style={{ marginTop: 12 }}
            onPress={() => navigation.goBack()}
          />
        </View>

        <Text style={[styles.securityText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
          PULSE PRIVATE SECURITY{"\n"}
          Data is encrypted and stored locally on your device.
        </Text>

        <View style={{ height: 40 }} />
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerLink: {
    fontSize: 16,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  picCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
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
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  form: {
    gap: 12,
  },
  buttonGroup: {
    marginTop: 30,
  },
  securityText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 30,
    opacity: 0.6,
  },
});