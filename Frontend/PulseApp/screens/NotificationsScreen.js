import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import { THEME } from '../constants/Themes';
import ScreenHeader from '../components/ScreenHeader';

const MOCK_NOTIFS = [
    {
        id: '1',
        title: 'New Expense Detected',
        message: 'SMS from HDFC Bank for ₹450 at Starbucks.',
        time: '2m ago',
        isRead: false,
        icon: 'receipt',
    },
    {
        id: '2',
        title: 'Budget Alert',
        message: 'You have reached 80% of your "Dining" budget.',
        time: '5h ago',
        isRead: false,
        icon: 'warning',
    },
    {
        id: '3',
        title: 'Daily Summary Ready',
        message: 'Check your spending breakdown for yesterday.',
        time: 'Yesterday',
        isRead: true,
        icon: 'pie-chart',
    }
];

export default function NotificationsScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [notifications, setNotifications] = useState(MOCK_NOTIFS);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const renderNotifItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notifCard, { borderBottomColor: theme.divider }]}
            onPress={() => markAsRead(item.id)}
            activeOpacity={0.6}
        >
            <View style={[styles.iconBox, { backgroundColor: item.isRead ? theme.cardElevated : theme.primary + '15' }]}>
                <Ionicons
                    name={item.icon}
                    size={16}
                    color={item.isRead ? theme.textTertiary : theme.primary}
                />
            </View>

            <View style={styles.textContent}>
                <View style={styles.headerRow}>
                    <Text numberOfLines={1} style={[styles.title, { color: item.isRead ? theme.textSecondary : theme.text, fontFamily: item.isRead ? FONTS.medium : FONTS.bold }]}>
                        {item.title}
                    </Text>
                    <Text style={[styles.time, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>{item.time}</Text>
                </View>
                <Text numberOfLines={2} style={[styles.message, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                    {item.message}
                </Text>
            </View>

            {!item.isRead && <View style={[styles.dot, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <ScreenHeader
                theme={theme}
                title="Notifications"
                showBack={true}
                onBackPress={() => navigation.goBack()}
                rightIcon={<Text style={{ color: theme.primary, fontSize: 14, fontFamily: FONTS.medium }}>Read All</Text>}
                onRightPress={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
            />

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotifItem}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContainer: { paddingHorizontal: 16 },
    notifCard: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContent: { flex: 1, marginRight: 8 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    title: { fontSize: 14, flex: 1, marginRight: 4 },
    time: { fontSize: 11 },
    message: { fontSize: 13, lineHeight: 18 },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginLeft: 4,
    }
});