// screens/VerifyOTPScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import { useAuth } from '../context/AuthContext';

export default function VerifyOTPScreen({ route, navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const { email } = route.params;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);

    const { verifyOTP, sendOTP } = useAuth();
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleOTPChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all 6 digits entered
        if (newOtp.every(digit => digit !== '') && text) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (code) => {
        setLoading(true);
        setError('');

        const { data, error: verifyError } = await verifyOTP(email, code || otp.join(''));

        setLoading(false);

        if (verifyError) {
            setError('Invalid or expired code');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            return;
        }

        // Check if user has a name
        const hasName = data.user?.user_metadata?.name;

        if (!hasName) {
            // New user - ask for name
            navigation.replace('SetupProfile', { email });
        }else{
            navigation.replace('Home');
        }
        // Existing user - navigation happens via AuthContext
    };

    const handleResend = async () => {
        setResendLoading(true);
        await sendOTP(email);
        setResendLoading(false);
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                        <Ionicons name="mail-open-outline" size={32} color={COLORS.primary} />
                    </View>
                    <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                        Check your email
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                        We sent a code to{'\n'}
                        <Text style={{ color: COLORS.primary, fontFamily: FONTS.semiBold }}>{email}</Text>
                    </Text>
                </View>

                {/* Error */}
                {error ? (
                    <View style={[styles.errorBox, { backgroundColor: '#FF3B3020' }]}>
                        <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* OTP Inputs */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={[
                                styles.otpInput,
                                {
                                    backgroundColor: theme.card,
                                    color: theme.text,
                                    borderColor: digit ? COLORS.primary : theme.border,
                                }
                            ]}
                            value={digit}
                            onChangeText={(text) => handleOTPChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            selectTextOnFocus
                        />
                    ))}
                </View>

                {/* Loading */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={COLORS.primary} />
                        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                            Verifying...
                        </Text>
                    </View>
                )}

                {/* Resend */}
                <View style={styles.resendContainer}>
                    {timer > 0 ? (
                        <Text style={[styles.timerText, { color: theme.textTertiary }]}>
                            Resend code in {timer}s
                        </Text>
                    ) : (
                        <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                            <Text style={[styles.resendText, { color: COLORS.primary }]}>
                                {resendLoading ? 'Sending...' : 'Resend Code'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
    backButton: { marginBottom: 20 },
    header: { alignItems: 'center', marginBottom: 40 },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: { fontSize: 28, marginBottom: 12 },
    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    errorText: { flex: 1, color: '#FF3B30', fontFamily: FONTS.medium, fontSize: 14 },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    otpInput: {
        width: 50,
        height: 60,
        borderRadius: 12,
        borderWidth: 2,
        textAlign: 'center',
        fontSize: 24,
        fontFamily: FONTS.bold,
    },
    loadingContainer: { alignItems: 'center', marginVertical: 20 },
    loadingText: { fontFamily: FONTS.medium, marginTop: 8 },
    resendContainer: { alignItems: 'center', marginTop: 20 },
    timerText: { fontFamily: FONTS.regular },
    resendText: { fontFamily: FONTS.semiBold, fontSize: 16 },
});