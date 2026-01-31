import React, { useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

export default function FeedbackScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [feedback, setFeedback] = useState('');
    const [type, setType] = useState('Bug');

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color={theme.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Send Feedback</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>FEEDBACK TYPE</Text>
                    <View style={styles.typeRow}>
                        {['Bug', 'Suggestion', 'Bank Support'].map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                style={[styles.typeChip, { backgroundColor: type === t ? COLORS.primary : theme.card }]}
                            >
                                <Text style={{ color: type === t ? '#000' : theme.textTertiary, fontFamily: FONTS.bold, fontSize: 12 }}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.label, { color: theme.textSecondary }]}>MESSAGE</Text>
                    <TextInput
                        multiline
                        numberOfLines={6}
                        style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                        placeholder="Tell us what's on your mind..."
                        placeholderTextColor={theme.textTertiary}
                        value={feedback}
                        onChangeText={setFeedback}
                    />

                    <Button
                        title="Submit Feedback"
                        onPress={() => {
                            alert("Thanks! Our team will look into this.");
                            navigation.goBack();
                        }}
                        style={{ marginTop: 20 }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        marginLeft: 12,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 56,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 25,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontFamily: FONTS.medium,
    },
    sectionLabel: {
        fontSize: 11,
        letterSpacing: 1.5,
        marginBottom: 16,
        marginLeft: 4,
    },
    faqCard: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 16,
    },
    faqQ: {
        fontSize: 16,
        marginBottom: 8,
        lineHeight: 22,
    },
    faqA: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    // Feedback specific styles (if you combine them)
    label: {
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: 10,
        marginTop: 20,
        fontFamily: FONTS.bold,
    },
    typeRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    textArea: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 16,
        height: 150,
        textAlignVertical: 'top', // Crucial for Android multiline
        fontSize: 16,
        fontFamily: FONTS.regular,
    }
});