import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

export default function HelpCenterScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [search, setSearch] = useState('');

    const faqs = [
        { q: "How does Pulse read my SMS?", a: "Pulse uses a local regex engine to scan for banking keywords. Your messages never leave your phone." },
        { q: "What banks are supported?", a: "We currently support SBI, HDFC, ICICI, Federal Bank, and Axis. More are added weekly." },
        { q: "Is my data backed up?", a: "Only if you enable Cloud Sync in Security settings. Otherwise, it stays on your device." },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color={theme.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Help Center</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="search" size={20} color={theme.textTertiary} />
                    <TextInput
                        placeholder="Search help articles..."
                        placeholderTextColor={theme.textTertiary}
                        style={[styles.searchInput, { color: theme.text }]}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>FREQUENTLY ASKED</Text>
                {faqs.map((faq, index) => (
                    <View key={index} style={[styles.faqCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.faqQ, { color: theme.text, fontFamily: FONTS.semiBold }]}>{faq.q}</Text>
                        <Text style={[styles.faqA, { color: theme.textSecondary }]}>{faq.a}</Text>
                    </View>
                ))}
            </ScrollView>
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