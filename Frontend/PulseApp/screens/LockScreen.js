import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

export default function LockScreen({ onUnlock, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');
    const [authType, setAuthType] = useState('fingerprint');

    useEffect(() => {
        const init = async () => {
            const savedName = await SecureStore.getItemAsync('pulse_user_name');
            if (savedName) setUserName(savedName.split(' ')[0]);

            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setAuthType('face');
            }

            triggerAuth();
        };
        init();
    }, []);

    const triggerAuth = async () => {
        setError('');
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Pace',
                fallbackLabel: 'Use PIN',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });
            if (result.success) {
                onUnlock();
            } else {
                setError('Authentication failed. Tap to try again.');
            }
        } catch (e) {
            setError('Biometric not available.');
        }
    };

    const icon = authType === 'face' ? 'scan-outline' : 'finger-print-outline';

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <View style={styles.top}>
                <Text style={[styles.appName, { color: theme.text, fontFamily: FONTS.bold }]}>
                    Pace
                </Text>
                {userName ? (
                    <Text style={[styles.welcome, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                        Welcome back, {userName}
                    </Text>
                ) : null}
            </View>

            <View style={styles.middle}>
                <TouchableOpacity
                    style={[styles.authButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                    onPress={triggerAuth}
                    activeOpacity={0.8}
                >
                    <Ionicons name={icon} size={48} color={COLORS.primary} />
                </TouchableOpacity>

                <Text style={[styles.tapText, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
                    Tap to unlock
                </Text>

                {error ? (
                    <Text style={[styles.errorText, { color: COLORS.error, fontFamily: FONTS.regular }]}>
                        {error}
                    </Text>
                ) : null}
            </View>

            <Text style={[styles.tagline, { color: theme.textTertiary, fontFamily: FONTS.bold }]}>
                Your finances, in sync.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 80,
    },
    top: {
        alignItems: 'center',
        gap: 10,
    },
    appName: {
        fontSize: 38,
        letterSpacing: -1,
    },
    welcome: {
        fontSize: 16,
        opacity: 0.8,
    },
    middle: {
        alignItems: 'center',
        gap: 16,
    },
    authButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tapText: {
        fontSize: 14,
        letterSpacing: 0.5,
    },
    errorText: {
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    tagline: {
        fontSize: 13,
        opacity: 0.3,
        letterSpacing: 0.3,
    },
});