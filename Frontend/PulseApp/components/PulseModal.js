import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from './Button';

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
                    message: message || "We'll keep your pulse steady while you're gone.",
                    primaryButtonText: primaryButtonText || 'Log Out',
                    secondaryButtonText: secondaryButtonText || 'Go Back',
                    variant: 'secondary',
                };
            case 'delete':
                return {
                    title: title || 'Delete Account',
                    message: message || 'This action is permanent. Are you absolutely sure?',
                    primaryButtonText: primaryButtonText || 'Delete',
                    secondaryButtonText: secondaryButtonText || 'Cancel',
                    variant: 'danger',
                };
            default:
                return {
                    title: title || 'Awesome!',
                    primaryButtonText: primaryButtonText || 'Continue',
                    variant: 'primary',
                    showSecondary: false,
                };
        }
    };

    const config = getConfig();

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                            {config.title}
                        </Text>

                        {(message || config.message) && (
                            <Text style={[styles.message, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                {message || config.message}
                            </Text>
                        )}
                    </View>

                    <View style={styles.footer}>

                        <Button
                            title={config.primaryButtonText}
                            variant={config.variant}
                            onPress={onPrimaryPress || onClose}
                            fullWidth
                        />

                        {(onSecondaryPress || config.secondaryButtonText) && (
                            <Button
                                title={config.secondaryButtonText}
                                variant="ghost"
                                onPress={onSecondaryPress || onClose}
                                fullWidth
                                textStyle={{ color: theme.textTertiary }}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    content: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.8,
    },
    footer: {
        width: '100%',
        gap: 4,
    },
});

export default PulseModal;