import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

export default function BadgesScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [selectedBadge, setSelectedBadge] = useState(null);

    const BADGE_DATA = [
        { id: '1', title: 'First Pulse', desc: 'Parsed your first SMS', icon: 'flash', unlocked: true, date: '12 Jan 2026' },
        { id: '2', title: 'Saver Mode', desc: 'Stayed under budget for 7 days', icon: 'leaf', unlocked: true, date: '18 Jan 2026' },
        { id: '3', title: 'Clean Slate', desc: 'Categorized 50 transactions', icon: 'checkmark-done', unlocked: true, date: '20 Jan 2026' },
        { id: '4', title: 'Ghost', desc: 'Used Ghost Mode for 24 hours', icon: 'eye-off', unlocked: true, date: '22 Jan 2026' },
        { id: '5', title: 'Centurion', desc: 'Logged 100 transactions', icon: 'shield-checkmark', unlocked: false },
        { id: '6', title: 'Budget King', desc: '3 months of zero overspending', icon: 'trophy', unlocked: false },
        { id: '7', title: 'Night Owl', desc: 'Parsed a txn after midnight', icon: 'moon', unlocked: false },
        { id: '8', title: 'Master Sync', desc: 'Backup your data to Cloud', icon: 'cloud-done', unlocked: false },
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
                <Ionicons name={item.icon} size={32} color={item.unlocked ? COLORS.primary : theme.textTertiary} />
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
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={28} color={theme.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Achievements</Text>
            </View>

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
                            <Ionicons
                                name={selectedBadge?.icon}
                                size={60}
                                color={selectedBadge?.unlocked ? COLORS.primary : theme.textTertiary}
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
    lockedDesc: { fontSize: 13, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 }
});