import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import ScreenHeader from '../components/ScreenHeader';
import NotificationService from '../services/NotificationService';

const TYPE_ICON = {
    transaction: 'receipt-outline',
    budget_80: 'warning-outline',
    budget_exceeded: 'alert-circle-outline',
    general: 'notifications-outline',
};

const TYPE_COLOR = {
    transaction: COLORS.primary,
    budget_80: '#FACC15',
    budget_exceeded: '#F87171',
    general: COLORS.primary,
};

export default function NotificationsScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const isFocused = useIsFocused();
    const [notifications, setNotifications] = useState([]);

    // Reload every time screen is focused
    const loadHistory = useCallback(async () => {
        const history = await NotificationService.getHistory();
        setNotifications(history);
    }, []);

    React.useEffect(() => {
        if (isFocused) loadHistory();
    }, [isFocused]);

    const handleMarkRead = async (id) => {
        await NotificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleMarkAllRead = async () => {
        await NotificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const formatTime = (isoString) => {
        try {
            return formatDistanceToNow(new Date(isoString), { addSuffix: true });
        } catch {
            return '';
        }
    };

    const renderItem = ({ item }) => {
        const iconName = TYPE_ICON[item.type] || TYPE_ICON.general;
        const iconColor = item.isRead ? theme.textTertiary : (TYPE_COLOR[item.type] || COLORS.primary);
        const bgColor = item.isRead ? theme.cardElevated : (TYPE_COLOR[item.type] + '18' || COLORS.primary + '18');

        return (
            <TouchableOpacity
                style={[styles.notifCard, { borderBottomColor: theme.border }]}
                onPress={() => handleMarkRead(item.id)}
                activeOpacity={0.6}
            >
                <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
                    <Ionicons name={iconName} size={16} color={iconColor} />
                </View>

                <View style={styles.textContent}>
                    <View style={styles.headerRow}>
                        <Text
                            numberOfLines={1}
                            style={[
                                styles.title,
                                {
                                    color: item.isRead ? theme.textSecondary : theme.text,
                                    fontFamily: item.isRead ? FONTS.medium : FONTS.bold,
                                }
                            ]}
                        >
                            {item.title}
                        </Text>
                        <Text style={[styles.time, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                            {formatTime(item.time)}
                        </Text>
                    </View>
                    <Text numberOfLines={2} style={[styles.message, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                        {item.message}
                    </Text>
                </View>

                {!item.isRead && <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />}
            </TouchableOpacity>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: FONTS.bold }]}>No notifications yet</Text>
            <Text style={[styles.emptySub, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                Transaction and budget alerts will appear here.
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <ScreenHeader
                theme={theme}
                title="Notifications"
                showBack
                onBackPress={() => navigation.goBack()}
                rightIcon={
                    notifications.some(n => !n.isRead)
                        ? <Text style={{ color: COLORS.primary, fontSize: 14, fontFamily: FONTS.medium }}>Read All</Text>
                        : null
                }
                onRightPress={handleMarkAllRead}
            />

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={[
                    styles.listContainer,
                    notifications.length === 0 && styles.emptyList,
                ]}
                ListEmptyComponent={<EmptyState />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContainer: { paddingHorizontal: 16 },
    emptyList: { flex: 1, justifyContent: 'center' },
    notifCard: {
        flexDirection: 'row',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
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
    dot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
    emptyContainer: { alignItems: 'center', gap: 10 },
    emptyTitle: { fontSize: 18, marginTop: 12 },
    emptySub: { fontSize: 14, textAlign: 'center', opacity: 0.6, paddingHorizontal: 40 },
});