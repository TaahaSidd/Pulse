import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import ScreenHeader from '../components/ScreenHeader';
import InfoBox from '../components/InfoBox';
import GeneralActionItem from '../components/GeneralActionItem';
import CustomSwitch from '../components/CustomSwitch';

const PREFS_KEY = 'pace_notification_prefs';

const DEFAULT_PREFS = {
    pushEnabled: true,
    transactionAlerts: true,
    budgetAlerts: true,
};

export default function NotificationPreferencesScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [prefs, setPrefs] = useState(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const saved = await AsyncStorage.getItem(PREFS_KEY);
                if (saved) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) });
            } catch (e) {
                console.log('Error loading notification prefs:', e);
            }
            setLoading(false);
        };
        load();
    }, []);

    const updatePref = async (key, value) => {
        const updated = { ...prefs, [key]: value };

        // Master toggle off — disable everything
        if (key === 'pushEnabled' && !value) {
            updated.transactionAlerts = false;
            updated.budgetAlerts = false;
        }

        setPrefs(updated);
        try {
            await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.log('Error saving notification prefs:', e);
        }
    };

    if (loading) return null;

    const subDisabled = !prefs.pushEnabled;

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
                {/* <InfoBox
                    type="info"
                    icon="notifications-circle"
                    text="Pace only sends notifications for transactions parsed on this device. No marketing spam."
                    isDarkMode={isDarkMode}
                /> */}

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
                                value={prefs.pushEnabled}
                                onValueChange={(v) => updatePref('pushEnabled', v)}
                                isDarkMode={isDarkMode}
                            />
                        }
                    />
                </View>

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.bold }]}>TRANSACTION ALERTS</Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, opacity: subDisabled ? 0.5 : 1 }]}>
                    <GeneralActionItem
                        icon="flash-outline"
                        iconColor={COLORS.primary}
                        label="Instant Parse Alerts"
                        subtitle="Notify when an SMS is parsed"
                        theme={theme}
                        isLast={false}
                        rightComponent={
                            <CustomSwitch
                                value={prefs.transactionAlerts}
                                onValueChange={(v) => !subDisabled && updatePref('transactionAlerts', v)}
                                isDarkMode={isDarkMode}
                                disabled={subDisabled}
                            />
                        }
                    />
                    <GeneralActionItem
                        icon="warning-outline"
                        iconColor={COLORS.primary}
                        label="Budget Alerts"
                        subtitle="Alert at 80% and 100% of monthly budget"
                        theme={theme}
                        isLast={true}
                        rightComponent={
                            <CustomSwitch
                                value={prefs.budgetAlerts}
                                onValueChange={(v) => !subDisabled && updatePref('budgetAlerts', v)}
                                isDarkMode={isDarkMode}
                                disabled={subDisabled}
                            />
                        }
                    />
                </View>

                <TouchableOpacity
                    style={styles.systemSettings}
                    onPress={() => Linking.openSettings()}
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
    content: { paddingHorizontal: 16, paddingBottom: 40 },
    sectionLabel: {
        fontSize: 10,
        marginBottom: 8,
        marginTop: 20,
        letterSpacing: 1.5,
        marginLeft: 4,
        opacity: 0.7,
    },
    card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    systemSettings: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        gap: 6,
    },
    systemText: { fontSize: 13 },
});