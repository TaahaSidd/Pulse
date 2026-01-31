import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemedColors } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

export default function InfoBox({ text, icon = "information-circle", type = "info", isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);

    const getTypeStyles = () => {
        switch (type) {
            case 'warning':
                return {
                    bg: '#FF9500' + '15',
                    border: '#FF9500' + '30',
                    iconColor: '#FF9500',
                };
            case 'error':
                return {
                    bg: '#FF3B30' + '15',
                    border: '#FF3B30' + '30',
                    iconColor: '#FF3B30',
                };
            case 'success':
                return {
                    bg: '#34C759' + '15',
                    border: '#34C759' + '30',
                    iconColor: '#34C759',
                };
            case 'info':
            default:
                return {
                    bg: COLORS.primary + '15',
                    border: COLORS.primary + '30',
                    iconColor: COLORS.primary,
                };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <View style={[styles.infoBox, { backgroundColor: typeStyles.bg, borderColor: typeStyles.border }]}>
            <Ionicons name={icon} size={20} color={typeStyles.iconColor} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        gap: 12,
        borderWidth: 1,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        fontFamily: FONTS.medium, // Pulse typography
    },
});