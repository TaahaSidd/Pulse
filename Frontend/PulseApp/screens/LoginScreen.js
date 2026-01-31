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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming you use Expo
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';
import InputField from '../components/InputField';

export default function LoginScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);

    // --- Form State ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    // --- UI Handlers ---
    const handleLogin = () => {
        // Basic UI Validation
        if (!email || !password) {
            setErrors({
                email: !email ? 'Enter your email' : null,
                password: !password ? 'Enter your password' : null,
            });
            return;
        }
        // Placeholder for future logic
        console.log("Login Attempt:", { email, password });
        navigation.replace('Home');
    };

    const handleGoogleLogin = () => {
        console.log("Google Login Triggered");
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
                    {/* Pulse Brand Logo/Icon */}
                    <View style={styles.header}>
                        <Text style={[styles.brandText, { color: theme.text, fontFamily: FONTS.bold }]}>Pulse</Text>
                        <Text style={[styles.tagline, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            Every beat of your spending, tracked.
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.inputSection}>
                        <InputField
                            label="Email Address"
                            placeholder="e.g. name@email.com"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setErrors({}); }}
                            leftIcon="mail-outline"
                            error={errors.email}
                            isDarkMode={isDarkMode}
                        />

                        <InputField
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            leftIcon="lock-closed-outline"
                            secureTextEntry
                            error={errors.password}
                            isDarkMode={isDarkMode}
                        />

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={[styles.forgotText, { color: COLORS.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <Button
                        title="Log In"
                        variant="primary"
                        fullWidth
                        onPress={handleLogin}
                    />

                    <View style={styles.separatorContainer}>
                        <View style={[styles.line, { backgroundColor: theme.border }]} />
                        <Text style={[styles.separatorText, { color: theme.textTertiary }]}>OR CONNECT WITH</Text>
                        <View style={[styles.line, { backgroundColor: theme.border }]} />
                    </View>

                    <Button
                        title="Continue with Google"
                        variant="outline"
                        icon="logo-google"
                        textStyle={{ color: theme.text }}
                        fullWidth
                        onPress={handleGoogleLogin}
                    />

                    {/* Bottom Link */}
                    <View style={styles.signupContainer}>
                        <Text style={[styles.signupText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={[styles.signupLink, { color: COLORS.primary, fontFamily: FONTS.bold }]}>
                                {" "}Sign Up
                            </Text>
                        </TouchableOpacity>
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
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        // Add a slight glow effect for Pulse brand
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    brandText: { fontSize: 32, letterSpacing: -1 },
    tagline: { fontSize: 14, textAlign: 'center', marginTop: 8, opacity: 0.7 },
    inputSection: { marginBottom: 30 },
    forgotPassword: { alignSelf: 'flex-end', marginTop: 10 },
    forgotText: { fontSize: 13, fontWeight: '600' },
    mainBtn: { marginBottom: 20 },
    separatorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
    line: { flex: 1, height: 1 },
    separatorText: {
        marginHorizontal: 15,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2
    },
    googleButton: { borderWidth: 1, height: 56 },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40
    },
    signupText: { fontSize: 15 },
    signupLink: { fontSize: 15 },
});