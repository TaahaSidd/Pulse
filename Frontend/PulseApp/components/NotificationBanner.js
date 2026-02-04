// components/NotificationBanner.jsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const NotificationBanner = ({ onPress, isDarkMode = true }) => {
    const theme = getThemedColors(isDarkMode);

    return (
        <TouchableOpacity
            style={[styles.banner, { backgroundColor: theme.card, borderColor: COLORS.warning + '20' }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.iconContainer}>
                <Image
                    source={require('../assets/Notif.png')}
                    style={styles.icon}
                    resizeMode="contain"  // ← ADDED THIS
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]}>Enable Auto-Track</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Bank SMS → Instant expenses</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    iconContainer: {
        width: 58,
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        backgroundColor: COLORS.warning + '10',
        borderRadius: 16,
    },
    icon: {
        width: 40,
        height: 40,
        flex: 1,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontFamily: FONTS.semiBold,
    },
    subtitle: {
        fontSize: 12,            // ← Less text, smaller font
        marginTop: 1,
        lineHeight: 16,
    },
});

export default NotificationBanner;
