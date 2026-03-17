import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

export const ONBOARDING_BUDGET_KEY = 'pulse_onboarding_budget';

export default function BudgetSetupScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleChange = (text) => {
        // Only allow numbers
        const numeric = text.replace(/[^0-9]/g, '');
        setBudget(numeric);
    };

    const handleContinue = async () => {
        const amount = parseInt(budget) || 0;
        if (amount < 1000) {
            shake();
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        try {
            await SecureStore.setItemAsync(ONBOARDING_BUDGET_KEY, budget);
            navigation.replace('Home');
        } catch (e) {
            console.error('Failed to save budget:', e);
        } finally {
            setLoading(false);
        }
    };

    // Format number with commas for display
    const displayValue = budget
        ? parseInt(budget).toLocaleString('en-IN')
        : '';

    const amount = parseInt(budget) || 0;
    const isValid = amount >= 1000;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <View style={styles.topSection}>
                    <Text style={styles.emoji}>💰</Text>
                    <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {isValid
                            ? `₹${displayValue} / month`
                            : "What's your monthly budget?"
                        }
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                        Set a spending limit for the month. You can always change this later.
                    </Text>
                </View>

                <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: shakeAnim }] }]}>
                    <View style={styles.inputRow}>
                        <Text style={[styles.currency, {
                            color: budget ? theme.text : theme.textTertiary,
                            fontFamily: FONTS.bold,
                        }]}>₹</Text>
                        <TextInput
                            ref={inputRef}
                            value={budget}
                            onChangeText={handleChange}
                            placeholder="50000"
                            placeholderTextColor={theme.textTertiary + '40'}
                            keyboardType="numeric"
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleContinue}
                            style={[
                                styles.input,
                                {
                                    color: theme.text,
                                    fontFamily: FONTS.bold,
                                    borderBottomColor: isValid ? COLORS.primary : budget ? COLORS.error : theme.border,
                                }
                            ]}
                        />
                    </View>
                    {budget && !isValid && (
                        <Text style={[styles.hint, { color: COLORS.error, fontFamily: FONTS.regular }]}>
                            Minimum budget is ₹1,000
                        </Text>
                    )}
                </Animated.View>

                <View style={styles.footer}>
                    <Button
                        title="Let's Go"
                        variant="primary"
                        fullWidth
                        loading={loading}
                        disabled={!isValid}
                        onPress={handleContinue}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: {
        flex: 1,
        paddingHorizontal: 32,
        justifyContent: 'center',
    },
    topSection: {
        marginBottom: 48,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        lineHeight: 40,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.7,
    },
    inputWrapper: {
        marginBottom: 48,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    currency: {
        fontSize: 28,
        paddingBottom: 14,
    },
    input: {
        flex: 1,
        fontSize: 28,
        paddingVertical: 12,
        borderBottomWidth: 2,
    },
    hint: {
        fontSize: 13,
        marginTop: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 32,
        right: 32,
    },
});