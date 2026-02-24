import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Modal, Image, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';


export default function BadgesScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [selectedBadge, setSelectedBadge] = useState(null);

    // Updated BADGE_DATA for a real-world financial app
    const BADGE_DATA = [
        {
            id: '1',
            title: 'Fresh Start',
            desc: 'Recorded your first transaction of the month.',
            image: require('../assets/Badges/FreshStart.png'),
            unlocked: true,
            date: '01 Feb 2026',
            category: 'Discipline'
        },
        {
            id: '2',
            title: '7-Day Streak',
            desc: 'Tracked your expenses for 7 consecutive days.',
            image: require('../assets/Badges/FreshStart.png'),
            unlocked: true,
            date: '08 Feb 2026',
            category: 'Consistency'
        },
        {
            id: '3',
            title: 'Under Budget',
            desc: 'Spent 10% less than your monthly budget limit.',
            image: require('../assets/Badges/FreshStart.png'),
            unlocked: true,
            date: '10 Feb 2026',
            category: 'Savings'
        },
        {
            id: '4',
            title: 'Wealth Builder',
            desc: 'Saved your first ₹10,000 using Pulse.',
            image: require('../assets/Badges/FreshStart.png'),
            unlocked: true,
            date: '11 Feb 2026',
            category: 'Milestone'
        },
        {
            id: '5',
            title: 'Debt Crusher',
            desc: 'Cleared a recurring credit card bill or loan.',
            image: require('../assets/Badges/FreshStart.png'),
            unlocked: false,
            category: 'Milestone'
        },
        {
            id: '6',
            title: 'Investment Pro',
            desc: 'Linked an investment or demat account.',
            image: require('../assets/Badges/FreshStart.png'),
            unlocked: false,
            category: 'Wealth'
        },
        {
            id: '7',
            title: 'Zero Waste',
            desc: 'A full week with zero "Uncategorized" expenses.',
            image: require('../assets/Badges/FreshStart.png'),
            unlocked: false,
            category: 'Organization'
        },
        {
            id: '8',
            title: 'Emergency Ready',
            desc: 'Set aside 3 months of expenses in your vault.',
            image: require('../assets/Badges/FreshStart.png'),
            unlocked: false,
            category: 'Security'
        },
    ];

    const renderBadge = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.badgeWrapper,
                { backgroundColor: theme.card, borderColor: item.unlocked ? COLORS.primary + '40' : theme.border }
            ]}
            onPress={() => setSelectedBadge(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconCircle, { backgroundColor: item.unlocked ? COLORS.primary + '15' : theme.bg }]}>
                {/* ✅ REPLACE IONICON WITH IMAGE */}
                <Image
                    source={item.image}
                    style={styles.badgeImage}
                    resizeMode="contain"
                />

                {!item.unlocked && (
                    <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={14} color={theme.textTertiary} />
                    </View>
                )}
            </View>

            <Text style={[styles.badgeTitle, { color: item.unlocked ? theme.text : theme.textTertiary, fontFamily: FONTS.bold }]}>
                {item.title}
            </Text>

            {!item.unlocked && (
                <View style={[styles.lockedBadge, { backgroundColor: theme.bg }]}>
                    <Text style={[styles.lockedText, { color: theme.textTertiary }]}>Locked</Text>
                </View>
            )}
        </TouchableOpacity>
    );


    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color={theme.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Achievements</Text>
            </View> */}

            <ScreenHeader
                mode="simple"
                theme={theme}
                title="Badges"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <FlatList
                data={BADGE_DATA}
                renderItem={renderBadge}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.listPadding}
                ListHeaderComponent={() => (
                    <View style={styles.statsHeader}>
                        <Text style={[styles.statsTitle, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>COLLECTION PROGRESS</Text>
                        <View style={styles.progressRow}>
                            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                <View style={[styles.progressFill, { width: '50%', backgroundColor: COLORS.primary }]} />
                            </View>
                            <Text style={[styles.progressCount, { color: theme.text, fontFamily: FONTS.bold }]}>4/8</Text>
                        </View>
                    </View>
                )}
            />

            {/* --- BADGE DETAIL MODAL --- */}
            <Modal
                visible={!!selectedBadge}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedBadge(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.detailCard, { backgroundColor: theme.cardElevated }]}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedBadge(null)}>
                            <Ionicons name="close" size={24} color={theme.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.detailIconCircle, { backgroundColor: selectedBadge?.unlocked ? COLORS.primary + '15' : theme.bg }]}>
                            <Image
                                source={selectedBadge?.image}
                                style={styles.detailBadgeImage}
                                resizeMode="contain"
                            />
                        </View>

                        <Text style={[styles.detailTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                            {selectedBadge?.title}
                        </Text>

                        <Text style={[styles.detailDesc, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            {selectedBadge?.desc}
                        </Text>

                        {selectedBadge?.unlocked ? (
                            <View style={styles.unlockedInfo}>
                                <Text style={[styles.dateLabel, { color: theme.textTertiary }]}>Unlocked on</Text>
                                <Text style={[styles.dateValue, { color: COLORS.primary, fontFamily: FONTS.bold }]}>{selectedBadge.date}</Text>
                                <Button
                                    title="Share Achievement"
                                    variant="primary"
                                    icon="share-social-outline"
                                    onPress={() => { }}
                                    style={{ marginTop: 25 }}
                                />
                            </View>
                        ) : (
                            <View style={styles.lockedInfo}>
                                <Ionicons name="lock-closed" size={20} color={theme.textTertiary} />
                                <Text style={[styles.lockedDesc, { color: theme.textTertiary }]}>
                                    Complete the requirement above to unlock this badge and earn 50 Pulse Points.
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 10 },
    headerTitle: { fontSize: 20, marginLeft: 12 },
    listPadding: { paddingHorizontal: 15, paddingBottom: 40 },
    statsHeader: { padding: 15, marginBottom: 10 },
    statsTitle: { fontSize: 11, letterSpacing: 1.5, marginBottom: 10 },
    progressRow: { flexDirection: 'row', alignItems: 'center' },
    progressBar: { flex: 1, height: 8, borderRadius: 4, marginRight: 15, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressCount: { fontSize: 16 },

    // Grid Badges
    badgeWrapper: { flex: 1, margin: 8, padding: 20, borderRadius: 28, borderWidth: 1, alignItems: 'center' },
    iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    lockOverlay: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#1E293B', padding: 4, borderRadius: 10, borderWidth: 2, borderColor: '#0F172A' },
    badgeTitle: { fontSize: 14, textAlign: 'center' },
    lockedBadge: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    lockedText: { fontSize: 9, fontFamily: FONTS.bold, textTransform: 'uppercase' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 25 },
    detailCard: { width: '100%', borderRadius: 32, padding: 30, alignItems: 'center' },
    closeBtn: { position: 'absolute', top: 20, right: 20 },
    detailIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    detailTitle: { fontSize: 24, marginBottom: 10 },
    detailDesc: { fontSize: 16, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
    unlockedInfo: { alignItems: 'center', width: '100%' },
    dateLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    dateValue: { fontSize: 16, marginTop: 4 },
    lockedInfo: { alignItems: 'center', marginTop: 10 },
    lockedDesc: { fontSize: 13, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },


    //Image
    badgeImage: {
        width: 60,
        height: 60,
    },
    detailBadgeImage: {
        width: 120,
        height: 120,
    },
});