import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking } from 'react-native';
import { getThemedColors } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import Button from '../components/Button';

export default function HelpCenterScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [search, setSearch] = useState('');

    const allFaqs = [
        {
            q: "How does Pace read my SMS?",
            a: "Pace uses a local regex engine to scan for banking keywords. Your private messages never leave your phone or reach our servers."
        },
        {
            q: "What banks are supported?",
            a: "We support major banks like SBI, HDFC, ICICI, Federal Bank, and Axis. We are constantly updating our engine to include more regional banks."
        },
        {
            q: "Is my data backed up?",
            a: "Pace is offline-first. Your data is stored only in your phone's secure storage. We recommend exporting a backup if you plan to switch phones."
        },
        {
            q: "Is Pace free to use?",
            a: "Yes, Pace is currently free. We believe privacy-first finance should be accessible to everyone."
        },
        {
            q: "Why do you need SMS permissions?",
            a: "We need this to automatically detect transactions. Pace only filters for financial alerts and ignores your personal conversations."
        },
        {
            q: "Can I manually add transactions?",
            a: "Yes. If an SMS is missed or you spend cash, you can tap the '+' button on the Home screen to log a transaction manually."
        },
        {
            q: "What if a transaction is categorized wrongly?",
            a: "You can tap on any transaction and select 'Edit' to change the category. Pace will learn from your changes over time."
        },
        {
            q: "How do I delete all my data?",
            a: "Go to Account > Security & Privacy > Data Management. You can wipe all local data and reset the app to its original state."
        },
        {
            q: "Does Pace require an internet connection?",
            a: "No. Pace is designed to work fully offline. Internet is only required if you choose to use the 'Send Feedback' or 'Update' features."
        },
        {
            q: "Is my bank account at risk?",
            a: "Never. Pace is a read-only app. We can't move money, access your bank login, or see your full account number."
        }
    ];
    
    const filteredFaqs = allFaqs.filter(faq =>
        faq.q.toLowerCase().includes(search.toLowerCase()) ||
        faq.a.toLowerCase().includes(search.toLowerCase())
    );

    // Reuse the Compact Style from SecurityPrivacyScreen
    const FAQCard = ({ question, answer }) => (
        <View style={[styles.compactCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text, fontFamily: FONTS.bold }]}>{question}</Text>
            <Text style={[styles.cardDesc, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>{answer}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScreenHeader
                mode="simple"
                theme={theme}
                title="Help Center"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.searchSection}>
                <SearchBar
                    theme={theme}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search questions..."
                    containerStyle={styles.searchOverride}
                />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>
                    {search ? 'SEARCH RESULTS' : 'FREQUENTLY ASKED'}
                </Text>

                {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, index) => (
                        <FAQCard key={index} question={faq.q} answer={faq.a} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
                            No matching questions found.
                        </Text>
                    </View>
                )}

                {/* Optional: Need more help? */}
                {!search && (
                    <View style={[styles.footerSection, { borderTopColor: theme.border }]}>
                        <Text style={[styles.footerText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                            Still have questions?
                        </Text>
                        <View style={styles.buttonWrapper}>
                            <Button
                                title="Contact Support"
                                variant="secondary"
                                onPress={() => Linking.openURL('mailto:hello.spicalabs@gmail.com')}
                                fullWidth={true}
                            />
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchSection: { marginTop: 10 },
    searchOverride: { marginHorizontal: 20 },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionLabel: {
        fontSize: 10,
        letterSpacing: 1.2,
        marginBottom: 12,
        marginTop: 20,
        marginLeft: 4
    },
    // Compact Styling matched to Security Screen
    compactCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10
    },
    cardTitle: {
        fontSize: 15,
        marginBottom: 4,
        lineHeight: 20
    },
    cardDesc: {
        fontSize: 12,
        lineHeight: 18,
        opacity: 0.8
    },
    emptyState: { alignItems: 'center', marginTop: 40 },
    emptyText: { fontSize: 14 },
    footerSection: {
        marginTop: 40,
        paddingTop: 30,
        borderTopWidth: 1,
        width: '100%',
    },
    footerText: {
        fontSize: 13,
        marginBottom: 20,
        opacity: 0.7,
        textAlign: 'center',
    },
    buttonWrapper: {
        width: '100%',
        paddingHorizontal: 10,
    },
});