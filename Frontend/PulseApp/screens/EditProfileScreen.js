import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import InputField from '../components/InputField';

export const USER_NAME_KEY = 'pulse_user_name';
export const USER_AVATAR_KEY = 'pulse_user_avatar';

const PACE_AVATARS = [
  { id: '1', name: 'flash',          color: '#8CF364' },
  { id: '2', name: 'leaf',           color: '#4ADE80' },
  { id: '3', name: 'planet',         color: '#22D3EE' },
  { id: '4', name: 'analytics',      color: '#FACC15' },
  { id: '5', name: 'infinite',       color: '#A855F7' },
  { id: '6', name: 'flame',          color: '#FB923C' },
  { id: '7', name: 'diamond',        color: '#38BDF8' },
  { id: '8', name: 'rocket',         color: '#F472B6' },
  { id: '9', name: 'skull',          color: '#94A3B8' },
  { id: '10', name: 'thunderstorm',  color: '#818CF8' },
];

export default function EditProfileScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const savedName = await SecureStore.getItemAsync(USER_NAME_KEY);
        const savedAvatar = await SecureStore.getItemAsync(USER_AVATAR_KEY);
        if (savedName) setName(savedName);
        if (savedAvatar) setSelectedAvatar(savedAvatar);
      } catch (e) {
        console.error('Failed to load identity', e);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Missing Name', 'Please enter a name.');
      return;
    }
    setLoading(true);
    try {
      await SecureStore.setItemAsync(USER_NAME_KEY, trimmedName);
      await SecureStore.setItemAsync(USER_AVATAR_KEY, selectedAvatar);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setLoading(false);
    }
  };

  const renderAvatarOption = ({ item }) => {
    const isSelected = selectedAvatar === item.id;
    return (
      <TouchableOpacity
        onPress={() => setSelectedAvatar(item.id)}
        style={[
          styles.avatarOption,
          {
            backgroundColor: isSelected ? item.color + '18' : theme.card,
            borderColor: isSelected ? item.color : theme.border,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
      >
        <Ionicons name={item.name} size={26} color={item.color} />
        {isSelected && (
          <View style={[styles.selectedCheck, { backgroundColor: theme.bg }]}>
            <Ionicons name="checkmark-circle" size={16} color={item.color} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader
        mode="simple"
        theme={theme}
        title="Edit Identity"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>Choose your avatar</Text>
          <FlatList
            data={PACE_AVATARS}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderAvatarOption}
            keyExtractor={item => item.id}
            contentContainerStyle={{ gap: 10 }}
          />
        </View>

        <View style={styles.form}>
          <InputField
            label="Display Name"
            placeholder="Your name"
            leftIcon="person-outline"
            value={name}
            onChangeText={setName}
            isDarkMode={isDarkMode}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.buttonGroup}>
          <Button
            title="Save"
            variant="primary"
            fullWidth
            loading={loading}
            onPress={handleSave}
          />
          <Button
            title="Discard"
            variant="ghost"
            style={{ marginTop: 8 }}
            onPress={() => navigation.goBack()}
          />
        </View>

        <View style={styles.securityTag}>
          <Ionicons name="lock-closed-outline" size={12} color={theme.textTertiary} />
          <Text style={[styles.securityText, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
            ENCRYPTED LOCAL STORAGE
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20 },
  section: { marginBottom: 32 },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
  },
  form: { marginBottom: 40 },
  buttonGroup: { gap: 4 },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 40,
    opacity: 0.4,
  },
  securityText: { fontSize: 9, letterSpacing: 2 },
});