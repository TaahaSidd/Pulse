import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../../constants/Fonts';

const BentoTile = ({
    title,
    value,
    subText,
    icon,
    color,
    style,
    theme,
    onPress,
    isLarge = false
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[
                styles.tile,
                style,
                { backgroundColor: color || theme.cardElevated }
            ]}
        >
            <View style={styles.header}>
                <Ionicons name={icon} size={isLarge ? 22 : 18} color={color ? '#FFF' : theme.textSecondary} />
                <Text style={[styles.label, { color: color ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                    {title}
                </Text>
            </View>

            <Text style={[
                isLarge ? styles.valueLarge : styles.valueSmall,
                { color: color ? '#FFF' : theme.text }
            ]}>
                {value}
            </Text>

            <Text style={[
                styles.subText,
                { color: color ? 'rgba(255,255,255,0.7)' : theme.textSecondary }
            ]}>
                {subText}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tile: {
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    label: {
        fontSize: 10,
        fontFamily: FONTS.bold,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    valueLarge: { fontSize: 32, fontFamily: FONTS.bold, marginBottom: 4 },
    valueSmall: { fontSize: 20, fontFamily: FONTS.bold, marginBottom: 4 },
    subText: { fontSize: 12, fontFamily: FONTS.medium, lineHeight: 16 },
});

export default BentoTile;