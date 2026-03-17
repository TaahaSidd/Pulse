import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const PulseModal = ({
    visible,
    type = 'success',
    title,
    message,
    primaryButtonText,
    secondaryButtonText,
    onPrimaryPress,
    onSecondaryPress,
    onClose,
    isDarkMode = true
}) => {
    const theme = getThemedColors(isDarkMode);

    const getConfig = () => {
        switch (type) {
            case 'logout':
                return {
                    title: title || 'Taking a break?',
                    message: message || "We'll keep your data safe while you're gone.",
                    primaryButtonText: primaryButtonText || 'Log Out',
                    secondaryButtonText: secondaryButtonText || 'Cancel',
                    primaryColor: theme.text,
                    primaryTextColor: theme.bg,
                };
            case 'delete':
                return {
                    title: title || 'Delete Account',
                    message: message || 'This action is permanent. Are you absolutely sure?',
                    primaryButtonText: primaryButtonText || 'Delete',
                    secondaryButtonText: secondaryButtonText || 'Cancel',
                    primaryColor: '#EF4444',
                    primaryTextColor: '#fff',
                };
            default:
                return {
                    title: title || 'Awesome!',
                    message: message,
                    primaryButtonText: primaryButtonText || 'Continue',
                    secondaryButtonText: secondaryButtonText || null,
                    primaryColor: COLORS.primary,
                    primaryTextColor: '#000',
                };
        }
    };

    const config = getConfig();
    const showSecondary = !!(onSecondaryPress || config.secondaryButtonText);

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>

                    <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {config.title}
                    </Text>

                    {config.message && (
                        <Text style={[styles.message, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            {config.message}
                        </Text>
                    )}

                    <View style={styles.footer}>
                        {showSecondary && (
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: theme.cardElevated, flex: 1 }]}
                                onPress={onSecondaryPress || onClose}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.btnText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                                    {config.secondaryButtonText}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: config.primaryColor, flex: showSecondary ? 1 : undefined, minWidth: 120 }]}
                            onPress={onPrimaryPress || onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.btnText, { color: config.primaryTextColor, fontFamily: FONTS.bold }]}>
                                {config.primaryButtonText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    container: {
        width: '100%',
        maxWidth: 320,
        borderRadius: 28,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 20,
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 21,
        opacity: 0.8,
        marginBottom: 24,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
    },
    btn: {
        paddingVertical: 13,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        fontSize: 14,
    },
});

export default PulseModal;