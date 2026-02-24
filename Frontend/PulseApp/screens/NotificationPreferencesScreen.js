import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import InfoBox from '../components/InfoBox';
import GeneralActionItem from '../components/GeneralActionItem';
import CustomSwitch from '../components/CustomSwitch'; // 1. Import CustomSwitch

export default function NotificationPreferencesScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);

    // Notification States
    const [pushEnabled, setPushEnabled] = useState(true);
    const [transactionAlerts, setTransactionAlerts] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);
    const [budgetAlerts, setBudgetAlerts] = useState(true);

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <ScreenHeader
                mode="simple"
                theme={theme}
                title="Notifications"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <InfoBox
                    type="info"
                    icon="notifications-circle"
                    text="Pulse only sends notifications for transactions parsed on this device. No marketing spam."
                    isDarkMode={isDarkMode}
                />

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>SYSTEM</Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <GeneralActionItem
                        icon="notifications-outline"
                        iconColor={COLORS.primary}
                        label="Master Notifications"
                        subtitle="Enable or disable all alerts"
                        theme={theme}
                        isLast={true}
                        rightComponent={
                            <CustomSwitch
                                value={pushEnabled}
                                onValueChange={setPushEnabled}
                                isDarkMode={isDarkMode}
                            />
                        }
                    />
                </View>

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>TRANSACTION ALERTS</Text>
                <View style={[
                    styles.card,
                    { backgroundColor: theme.card, borderColor: theme.border, opacity: pushEnabled ? 1 : 0.5 }
                ]}>
                    <GeneralActionItem
                        icon="flash-outline"
                        iconColor={COLORS.primary}
                        label="Instant Parse Alerts"
                        subtitle="Notify when an SMS is parsed"
                        theme={theme}
                        rightComponent={
                            <CustomSwitch
                                value={transactionAlerts}
                                onValueChange={setTransactionAlerts}
                                isDarkMode={isDarkMode}
                                disabled={!pushEnabled}
                            />
                        }
                    />
                    <GeneralActionItem
                        icon="stats-chart-outline"
                        iconColor={COLORS.primary}
                        label="Daily Summary"
                        subtitle="A morning recap of yesterday"
                        theme={theme}
                        rightComponent={
                            <CustomSwitch
                                value={dailySummary}
                                onValueChange={setDailySummary}
                                isDarkMode={isDarkMode}
                                disabled={!pushEnabled}
                            />
                        }
                    />
                    <GeneralActionItem
                        icon="warning-outline"
                        iconColor={COLORS.primary}
                        label="Budget Exceeded"
                        subtitle="Alert at 80% of limit"
                        theme={theme}
                        isLast={true}
                        rightComponent={
                            <CustomSwitch
                                value={budgetAlerts}
                                onValueChange={setBudgetAlerts}
                                isDarkMode={isDarkMode}
                                disabled={!pushEnabled}
                            />
                        }
                    />
                </View>

                <TouchableOpacity
                    style={styles.systemSettings}
                    onPress={() => {/* Logic to open OS Settings */ }}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.systemText, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
                        Open System Settings
                    </Text>
                    <Ionicons name="open-outline" size={14} color={COLORS.primary} />
                </TouchableOpacity>

                <View style={{ height: 50 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 16, paddingBottom: 40 }, // Compact padding
    sectionLabel: {
        fontSize: 10,
        marginBottom: 8,
        marginTop: 20,
        letterSpacing: 1.5,
        marginLeft: 4,
        opacity: 0.7
    },
    card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' }, // Tighter radius
    systemSettings: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        gap: 6
    },
    systemText: { fontSize: 13 }
});