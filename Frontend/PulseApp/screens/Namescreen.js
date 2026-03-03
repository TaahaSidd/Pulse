import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

export const USER_NAME_KEY = 'pulse_user_name';

export default function NameScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    // Subtle shake animation for empty submit
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleContinue = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            shake();
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        try {
            await SecureStore.setItemAsync(USER_NAME_KEY, trimmed);
            navigation.replace('NotificationPermissionScreen');
        } catch (e) {
            console.error('Failed to save name:', e);
        } finally {
            setLoading(false);
        }
    };

    const firstName = name.trim().split(' ')[0];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <View style={styles.topSection}>
                    <Text style={[styles.emoji]}>👋</Text>
                    <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {firstName ? `Hey, ${firstName}!` : "What's your name?"}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                        We'll use this to personalise your experience.
                    </Text>
                </View>

                <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: shakeAnim }] }]}>
                    <TextInput
                        ref={inputRef}
                        value={name}
                        onChangeText={setName}
                        placeholder="Your name"
                        placeholderTextColor={theme.textTertiary + '60'}
                        autoFocus
                        autoCapitalize="words"
                        returnKeyType="done"
                        onSubmitEditing={handleContinue}
                        style={[
                            styles.input,
                            {
                                color: theme.text,
                                fontFamily: FONTS.bold,
                                borderBottomColor: name.trim() ? COLORS.primary : theme.border,
                            }
                        ]}
                    />
                </Animated.View>

                <View style={styles.footer}>
                    <Button
                        title="Continue"
                        variant="primary"
                        fullWidth
                        loading={loading}
                        disabled={!name.trim()}
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
    input: {
        fontSize: 28,
        paddingVertical: 12,
        borderBottomWidth: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 32,
        right: 32,
    },
});