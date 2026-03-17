import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useIsFocused } from '@react-navigation/native';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';

export const USER_NAME_KEY = 'pulse_user_name';
export const USER_AVATAR_KEY = 'pulse_user_avatar';

// Keep in sync with EditProfileScreen and UserProfileScreen
const PACE_AVATARS = {
  '1': { name: 'flash', color: '#8CF364' },
  '2': { name: 'leaf', color: '#4ADE80' },
  '3': { name: 'planet', color: '#22D3EE' },
  '4': { name: 'analytics', color: '#FACC15' },
  '5': { name: 'infinite', color: '#A855F7' },
  '6': { name: 'flame', color: '#FB923C' },
  '7': { name: 'diamond', color: '#38BDF8' },
  '8': { name: 'rocket', color: '#F472B6' },
  '9': { name: 'skull', color: '#94A3B8' },
  '10': { name: 'thunderstorm', color: '#818CF8' },
};

export default function PersonalInfoScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const isFocused = useIsFocused();
  const [name, setName] = useState('User');
  const [avatarData, setAvatarData] = useState(null);

  useEffect(() => {
    const loadIdentity = async () => {
      try {
        const savedName = await SecureStore.getItemAsync(USER_NAME_KEY);
        const savedAvatarId = await SecureStore.getItemAsync(USER_AVATAR_KEY);
        if (savedName) setName(savedName);
        setAvatarData(savedAvatarId && PACE_AVATARS[savedAvatarId] ? PACE_AVATARS[savedAvatarId] : null);
      } catch (e) {
        console.error('Load error', e);
      }
    };
    if (isFocused) loadIdentity();
  }, [isFocused]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader mode="simple" theme={theme} title="Identity" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={[styles.identityCard, { backgroundColor: theme.card, borderColor: avatarData ? avatarData.color + '40' : theme.border }]}>
          <View style={[styles.avatarMini, { backgroundColor: avatarData ? avatarData.color + '15' : theme.cardElevated }]}>
            <Ionicons
              name={avatarData ? avatarData.name : 'person'}
              size={28}
              color={avatarData ? avatarData.color : theme.text}
            />
          </View>
          <View style={styles.nameMeta}>
            <Text style={[styles.userName, { color: theme.text, fontFamily: FONTS.bold }]} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.statusBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} />
              <Text style={[styles.statusText, { color: COLORS.primary, fontFamily: FONTS.bold }]}>LOCAL PROFILE</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <Button
            title="Edit Identity"
            variant="primary"
            icon="pencil-outline"
            fullWidth
            onPress={() => navigation.navigate('EditProfile')}
          />
        </View>

        <View style={styles.footerBrandingContainer}>
          <Text style={[styles.megaBrandText, { color: theme.text, opacity: 0.06 }]}>
            Privacy-first{"\n"}Architecture.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 24,
    gap: 14,
  },
  avatarMini: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameMeta: { flex: 1 },
  userName: { fontSize: 18, marginBottom: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 10, letterSpacing: 1 },
  actionContainer: { marginBottom: 40 },
  footerBrandingContainer: { marginTop: 30, paddingHorizontal: 10 },
  megaBrandText: {
    fontSize: 46,
    fontFamily: FONTS.bold,
    letterSpacing: -1,
    lineHeight: 52,
    includeFontPadding: false,
  },
});