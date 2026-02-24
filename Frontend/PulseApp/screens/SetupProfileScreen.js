// screens/SetupProfileScreen.js
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { useAuth } from '../context/AuthContext';

export default function SetupProfileScreen({ route, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const { email } = route.params;

    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { updateProfile } = useAuth();

    const handleComplete = async () => {
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        setLoading(true);
        setError('');

        const { error: updateError } = await updateProfile(name.trim());

        setLoading(false);

        if (updateError) {
            setError(updateError.message);
            return;
        }

        // Success! Navigation happens via AuthContext
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
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                            <Ionicons name="person-outline" size={32} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                            What's your name?
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            We'll use this to personalize your experience
                        </Text>
                    </View>

                    {/* Error */}
                    {error ? (
                        <View style={[styles.errorBox, { backgroundColor: '#FF3B3020' }]}>
                            <Ionicons name="alert-circle" size={20} color="#FF3B30" />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    {/* Name Input */}
                    <View style={styles.inputSection}>
                        <InputField
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={name}
                            onChangeText={setName}
                            leftIcon="person-outline"
                            isDarkMode={isDarkMode}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Submit Button */}
                    <Button
                        title={loading ? "Setting up..." : "Get Started"}
                        variant="primary"
                        fullWidth
                        onPress={handleComplete}
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
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: { fontSize: 28, marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center' },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    errorText: { flex: 1, color: '#FF3B30', fontFamily: FONTS.medium, fontSize: 14 },
    inputSection: { marginBottom: 30 },
    privacyBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary + '10',
        padding: 16,
        borderRadius: 12,
        marginTop: 24,
        gap: 12,
    },
    privacyText: { flex: 1, fontSize: 14, fontFamily: FONTS.regular, lineHeight: 20 },
});
