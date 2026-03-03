import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

export const FormRow = ({
    icon,
    children,
    onPress,
    showChevron = true,
    theme,
    isLast = false,
    customIcon = null // For the Category preview circle
}) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <>
            <Container style={styles.inputWrapper} onPress={onPress} activeOpacity={0.7}>
                {customIcon ? customIcon : (
                    <Ionicons name={icon} size={20} color={theme.textTertiary} style={styles.inputIcon} />
                )}
                <View style={styles.content}>
                    {children}
                </View>
                {showChevron && <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />}
            </Container>
            {!isLast && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
        </>
    );
};

const styles = StyleSheet.create({
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        minHeight: 56,
    },
    inputIcon: { marginRight: 15, width: 24 },
    content: { flex: 1 },
    divider: { height: 1, width: '100%', marginLeft: 40 },
});