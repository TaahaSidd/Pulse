import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import InfoBox from '../components/InfoBox';

export default function NotificationPreferencesScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);

    // Notification States
    const [pushEnabled, setPushEnabled] = useState(true);
    const [transactionAlerts, setTransactionAlerts] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);
    const [budgetAlerts, setBudgetAlerts] = useState(true);

    const PrefRow = ({ icon, title, subtitle, value, onValueChange, isLast = false }) => (
        <View style={[styles.row, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
                <Ionicons name={icon} size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.semiBold }]}>{title}</Text>
                <Text style={[styles.subtitle, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>{subtitle}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: theme.border, true: COLORS.primary + '80' }}
                thumbColor={value ? COLORS.primary : '#f4f3f4'}
                disabled={!pushEnabled && title !== "Master Notifications"}
            />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Notifications</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <InfoBox
                    type="info"
                    icon="notifications-circle"
                    text="Pulse only sends notifications for transactions parsed on this device. We never send marketing spam."
                    isDarkMode={isDarkMode}
                />

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>SYSTEM</Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <PrefRow
                        icon="notifications-outline"
                        title="Master Notifications"
                        subtitle="Enable or disable all alerts"
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        isLast={true}
                    />
                </View>

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>TRANSACTION ALERTS</Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: pushEnabled ? 1 : 0.5 }]}>
                    <PrefRow
                        icon="flash-outline"
                        title="Instant Parse Alerts"
                        subtitle="Notify when an SMS is successfully parsed"
                        value={transactionAlerts}
                        onValueChange={setTransactionAlerts}
                    />
                    <PrefRow
                        icon="stats-chart-outline"
                        title="Daily Summary"
                        subtitle="A morning recap of yesterday's spends"
                        value={dailySummary}
                        onValueChange={setDailySummary}
                    />
                    <PrefRow
                        icon="warning-outline"
                        title="Budget Exceeded"
                        subtitle="Alert when you cross 80% of your limit"
                        value={budgetAlerts}
                        onValueChange={setBudgetAlerts}
                        isLast={true}
                    />
                </View>

                <TouchableOpacity
                    style={styles.systemSettings}
                    onPress={() => {/* Logic to open OS Settings */ }}
                >
                    <Text style={[styles.systemText, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
                        Open System Settings
                    </Text>
                    <Ionicons name="open-outline" size={16} color={COLORS.primary} />
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 20 },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionLabel: { fontSize: 11, marginBottom: 10, marginTop: 25, letterSpacing: 1.5 },
    card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    title: { fontSize: 15, marginBottom: 2 },
    subtitle: { fontSize: 12, lineHeight: 16 },
    systemSettings: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, gap: 8 },
    systemText: { fontSize: 14 }
});