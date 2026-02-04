import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../constants/Fonts';

const GeneralActionItem = ({
    label,
    subtitle,      // 🆕 Added
    icon,          // 🆕 Added
    iconColor,     // 🆕 Added
    onPress,
    isLast = false,
    isDestructive = false,
    theme,
    rightComponent
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.actionRow,
                { borderBottomColor: theme.border },
                !isLast && styles.borderBottom,
            ]}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={styles.leftContainer}>
                {icon && (
                    <View style={[styles.iconWrapper, { backgroundColor: (iconColor || theme.text) + '15' }]}>
                        <Ionicons name={icon} size={20} color={iconColor || theme.text} />
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Text style={[
                        styles.actionLabel,
                        { color: isDestructive ? "#EF4444" : theme.text, fontFamily: FONTS.semiBold }
                    ]}>
                        {label}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.rightSide}>
                {rightComponent ? (
                    rightComponent
                ) : (
                    !isDestructive && (
                        <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
                    )
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        minHeight: 64,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    borderBottom: {
        borderBottomWidth: 1,
    },
    actionLabel: {
        fontSize: 16,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    rightSide: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    }
});

export default GeneralActionItem;