// screens/EmailLoginScreen.js (rename from LoginScreen.js)
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';
import InputField from '../components/InputField';

import { useAuth } from '../context/AuthContext';

export default function EmailLoginScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const { sendOTP } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOTP = async () => {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        const { error: otpError } = await sendOTP(email.trim().toLowerCase());

        setLoading(false);

        if (otpError) {
            setError(otpError.message);
            return;
        }

        // Success! Navigate to OTP screen
        navigation.navigate('VerifyOTP', { email: email.trim().toLowerCase() });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Pulse Brand Logo */}
                    <View style={styles.header}>
                        <Text style={[styles.brandText, { color: theme.text, fontFamily: FONTS.bold }]}>
                            Pulse
                        </Text>
                        <Text style={[styles.tagline, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            Every beat of your spending, tracked.
                        </Text>
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View style={[styles.errorBox, { backgroundColor: '#FF3B3020' }]}>
                            <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Email Input */}
                    <View style={styles.inputSection}>
                        <InputField
                            label="Email Address"
                            placeholder="name@email.com"
                            value={email}
                            onChangeText={setEmail}
                            leftIcon="mail-outline"
                            isDarkMode={isDarkMode}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Send Code Button */}
                    <Button
                        title={loading ? "Sending..." : "Send Code"}
                        variant="primary"
                        fullWidth
                        onPress={handleSendOTP}
                        disabled={loading}
                    />

                    {/* Privacy Notice */}
                    <View style={styles.privacyBox}>
                        <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
                        <Text style={[styles.privacyText, { color: theme.textSecondary }]}>
                            Your financial data stays on your device. We never see your transactions.
                        </Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: { paddingHorizontal: 30, paddingTop: 80, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 50 },
    brandText: { fontSize: 32, letterSpacing: -1 },
    tagline: { fontSize: 14, textAlign: 'center', marginTop: 8, opacity: 0.7 },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    errorText: {
        flex: 1,
        color: '#FF3B30',
        fontFamily: FONTS.medium,
        fontSize: 14,
    },
    inputSection: { marginBottom: 30 },
    privacyBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary + '10',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        gap: 12,
    },
    privacyText: {
        flex: 1,
        fontSize: 14,
        fontFamily: FONTS.regular,
        lineHeight: 20,
    },
});