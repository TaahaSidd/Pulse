import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import InfoBox from '../components/InfoBox';
import GeneralActionItem from '../components/GeneralActionItem';
import CustomSwitch from '../components/CustomSwitch';

export const BIOMETRIC_KEY = 'pulse_biometric_enabled';

export default function GhostModeScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);

    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [appBlurEnabled, setAppBlurEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const biometric = await SecureStore.getItemAsync(BIOMETRIC_KEY);
            // const blur = await SecureStore.getItemAsync(APP_BLUR_KEY);
            setBiometricEnabled(biometric === 'true');
            // setAppBlurEnabled(blur === 'true');
            setLoading(false);
        };
        load();
    }, []);

    const handleBiometric = async (val) => {
        setBiometricEnabled(val);
        await SecureStore.setItemAsync(BIOMETRIC_KEY, val ? 'true' : 'false');
    };

    // const handleAppBlur = async (val) => {
    //     setAppBlurEnabled(val);
    //     await SecureStore.setItemAsync(APP_BLUR_KEY, val ? 'true' : 'false');
    // };

    if (loading) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScreenHeader
                mode="simple"
                theme={theme}
                title="Hide your Pace"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.heroSection}>
                    <View style={[styles.iconCircle, { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }]}>
                        <Ionicons name="eye-off" size={36} color={COLORS.primary} />
                    </View>
                    <Text style={[styles.heroText, { color: theme.text, fontFamily: FONTS.bold }]}>
                        Your data, hidden
                    </Text>
                    <Text style={[styles.heroSub, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                        Keep your finances private from prying eyes.
                    </Text>
                </View>

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>
                    APP LOCK
                </Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <GeneralActionItem
                        icon="finger-print-outline"
                        iconColor={COLORS.primary}
                        label="Biometric Lock"
                        subtitle="Require fingerprint or Face ID after 5 min"
                        theme={theme}
                        isLast={true}
                        rightComponent={
                            <CustomSwitch
                                value={biometricEnabled}
                                onValueChange={handleBiometric}
                                isDarkMode={isDarkMode}
                            />
                        }
                    />
                </View>

                {/* <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>
                    PRIVACY
                </Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <GeneralActionItem
                        icon="browsers-outline"
                        iconColor={COLORS.primary}
                        label="App Switcher Blur"
                        subtitle="Blur Pace when switching apps"
                        theme={theme}
                        isLast={true}
                        rightComponent={
                            <CustomSwitch
                                value={appBlurEnabled}
                                onValueChange={handleAppBlur}
                                isDarkMode={isDarkMode}
                            />
                        }
                    />
                </View> */}

                <View style={{ marginTop: 24 }}>
                    <InfoBox
                        type="info"
                        icon="shield-checkmark"
                        text="Pace processes everything on-device. No financial data ever leaves your phone."
                        isDarkMode={isDarkMode}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 16 },
    heroSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    heroText: { fontSize: 22, marginBottom: 4 },
    heroSub: {
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 18,
        fontSize: 13,
        opacity: 0.8,
    },
    sectionLabel: {
        fontSize: 10,
        marginBottom: 8,
        marginTop: 20,
        letterSpacing: 1.5,
        marginLeft: 4,
        opacity: 0.7,
    },
    card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
});