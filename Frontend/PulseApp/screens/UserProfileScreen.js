import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useIsFocused } from '@react-navigation/native';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import PulseModal from '../components/PulseModal';
import GeneralActionItem from '../components/GeneralActionItem';

export const USER_NAME_KEY = 'pulse_user_name';
export const USER_AVATAR_KEY = 'pulse_user_avatar';

export const PACE_AVATARS = {
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

export default function UserProfileScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const isFocused = useIsFocused();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('Guest');
  const [avatarData, setAvatarData] = useState(null);

  useEffect(() => {
    const loadIdentity = async () => {
      try {
        const savedName = await SecureStore.getItemAsync(USER_NAME_KEY);
        const savedAvatarId = await SecureStore.getItemAsync(USER_AVATAR_KEY);
        if (savedName) setName(savedName);
        setAvatarData(savedAvatarId && PACE_AVATARS[savedAvatarId] ? PACE_AVATARS[savedAvatarId] : null);
      } catch (e) {
        console.log('Error loading local profile', e);
      }
    };
    if (isFocused) loadIdentity();
  }, [isFocused]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScreenHeader mode="simple" theme={theme} title="Account" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.card, borderColor: avatarData ? avatarData.color + '40' : theme.border }]}>
            <Ionicons
              name={avatarData ? avatarData.name : 'person'}
              size={60}
              color={avatarData ? avatarData.color : theme.textTertiary}
            />
          </View>
          <Text style={[styles.userName, { color: theme.text, fontFamily: FONTS.bold }]}>{name}</Text>
          <Text style={[styles.userSub, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>Local Profile</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>ACCOUNT</Text>
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
              isLast
              onPress={() => navigation.navigate('SecurityPrivacy')}
            />
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <PulseModal
        visible={modalVisible}
        type="delete"
        isDarkMode={isDarkMode}
        onClose={() => setModalVisible(false)}
        onPrimaryPress={() => { setModalVisible(false); navigation.replace('Onboarding'); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  avatarCircle: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, marginBottom: 15 },
  userName: { fontSize: 22, marginBottom: 4 },
  userSub: { fontSize: 14, opacity: 0.7 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, marginBottom: 12, marginLeft: 4, letterSpacing: 1 },
  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
});