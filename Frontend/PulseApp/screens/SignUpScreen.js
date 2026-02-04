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
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';
import InputField from '../components/InputField';

export default function SignUpScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);

    // --- Form State ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const handleSignUp = () => {
        // Simple Validation
        if (!name || !email || !password) {
            setErrors({
                name: !name ? 'Full name is required' : null,
                email: !email ? 'Email is required' : null,
                password: !password ? 'Password is required' : null,
            });
            return;
        }
        console.log("Account Creation:", { name, email, password });
        navigation.replace('Home');
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
                        <Text style={[styles.brandText, { color: theme.text, fontFamily: FONTS.bold }]}>
                            Create Account
                        </Text>
                        <Text style={[styles.tagline, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            Join Pulse and start tracking your financial rhythm.
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.inputSection}>
                        <InputField
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={(text) => { setName(text); setErrors({}); }}
                            leftIcon="person-outline"
                            error={errors.name}
                            isDarkMode={isDarkMode}
                        />

                        <InputField
                            label="Email Address"
                            placeholder="name@email.com"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setErrors({}); }}
                            leftIcon="mail-outline"
                            error={errors.email}
                            isDarkMode={isDarkMode}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <InputField
                            label="Password"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChangeText={setPassword}
                            leftIcon="lock-closed-outline"
                            secureTextEntry
                            error={errors.password}
                            isDarkMode={isDarkMode}
                        />
                    </View>

                    <Button
                        title="Create Account"
                        variant="primary"
                        fullWidth
                        onPress={handleSignUp}
                    />

                    <View style={styles.separatorContainer}>
                        <View style={[styles.line, { backgroundColor: theme.border }]} />
                        <Text style={[styles.separatorText, { color: theme.textTertiary }]}>
                            OR SIGN UP WITH
                        </Text>
                        <View style={[styles.line, { backgroundColor: theme.border }]} />
                    </View>

                    <Button
                        title="Sign up with Google"
                        variant="outline"
                        icon="logo-google"
                        fullWidth
                        onPress={() => console.log("Google Sign Up")}
                    />

                    {/* Bottom Link */}
                    <View style={styles.loginContainer}>
                        <Text style={[styles.loginText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.loginLink, { color: COLORS.primary, fontFamily: FONTS.bold }]}>
                                {" "}Log In
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
    scrollContent: { paddingHorizontal: 30, paddingTop: 60 },
    header: { alignItems: 'flex-start', marginBottom: 20 },
    brandText: { fontSize: 32, letterSpacing: -1 },
    tagline: { fontSize: 14, marginTop: 8, opacity: 0.7 },
    inputSection: { marginBottom: 20 },
    separatorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
    line: { flex: 1, height: 1 },
    separatorText: {
        marginHorizontal: 15,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.2
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40
    },
    loginText: { fontSize: 15 },
    loginLink: { fontSize: 15 },
});