import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS } from '../constants/Fonts';

const GeneralActionItem = ({
    label,
    subtitle,
    icon,
    iconColor,
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
                    <View style={[styles.iconWrapper, { backgroundColor: (iconColor || theme.text) + '10' }]}>
                        <Ionicons name={icon} size={18} color={iconColor || theme.text} />
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Text
                        numberOfLines={1}
                        style={[
                            styles.actionLabel,
                            { color: isDestructive ? "#EF4444" : theme.text, fontFamily: FONTS.semiBold }
                        ]}
                    >
                        {label}
                    </Text>
                    {subtitle && (
                        <Text
                            numberOfLines={1}
                            style={[styles.subtitle, { color: theme.textTertiary, fontFamily: FONTS.regular }]}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.rightSide}>
                {rightComponent || (onPress && !isDestructive && (
                    <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} opacity={0.5} />
                ))}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12, // Reduced from 16
        paddingHorizontal: 14, // Tighter horizontal fit
        minHeight: 52, // Reduced from 64
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 30, // Reduced from 36
        height: 30, // Reduced from 36
        borderRadius: 8, // Slightly tighter radius
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    borderBottom: {
        borderBottomWidth: StyleSheet.hairlineWidth, // Thinner, cleaner line
    },
    actionLabel: {
        fontSize: 15, // Slightly smaller for professional look
    },
    subtitle: {
        fontSize: 11, // Reduced from 12
        marginTop: 0, // Tightened spacing
    },
    rightSide: {
        marginLeft: 8,
    }
});

export default GeneralActionItem;