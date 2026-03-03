import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { THEME } from '../constants/Themes';

const AddTransactionBottomSheet = ({
    visible,
    theme,
    onSmsPress,
    onManualPress,
    onClose,
}) => {
    const handleSmsPress = () => {
        onClose();
        onSmsPress();
    };

    const handleManualPress = () => {
        onClose();
        onManualPress();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>

                            {/* Handle Bar - Using layout.bottomSheetHandle (24) */}
                            <View style={[styles.handle, { backgroundColor: theme.border }]} />

                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text, fontWeight: THEME.fontWeight.bold }]}>
                                    Add Transaction
                                </Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons name="close-circle" size={THEME.sizes.icon.lg} color={theme.textTertiary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={styles.modalScroll}
                                contentContainerStyle={{ paddingBottom: THEME.spacing[5] }}
                            >
                                {/* SMS Option Card */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[styles.optionCard, { backgroundColor: theme.bg, borderColor: theme.border }]}
                                    onPress={handleSmsPress}
                                >
                                    <View style={[styles.optionIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                                        <Ionicons name="chatbubble-ellipses" size={THEME.sizes.icon.md} color={COLORS.primary} />
                                    </View>

                                    <View style={styles.optionTextContainer}>
                                        <Text style={[styles.optionTitle, { color: theme.text, fontWeight: THEME.fontWeight.semibold }]}>
                                            Paste SMS
                                        </Text>
                                        <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                                            Quick & automated
                                        </Text>
                                    </View>

                                    <View style={[styles.actionButton, { backgroundColor: COLORS.primary + '90' }]}>
                                        <Ionicons name="flash" size={THEME.sizes.icon.sm} color="black" />
                                    </View>
                                </TouchableOpacity>

                                {/* Manual Option Card */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[styles.optionCard, { backgroundColor: theme.bg, borderColor: theme.border }]}
                                    onPress={handleManualPress}
                                >
                                    <View style={[styles.optionIconContainer, { backgroundColor: theme.border }]}>
                                        <Ionicons name="create" size={THEME.sizes.icon.md} color={theme.text} />
                                    </View>

                                    <View style={styles.optionTextContainer}>
                                        <Text style={[styles.optionTitle, { color: theme.text, fontWeight: THEME.fontWeight.semibold }]}>
                                            Enter Manually
                                        </Text>
                                        <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                                            Full control
                                        </Text>
                                    </View>

                                    <View style={[styles.actionButton, { backgroundColor: theme.border }]}>
                                        <Ionicons name="add" size={THEME.sizes.icon.sm} color={theme.text} />
                                    </View>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: THEME.borderRadius['2xl'], // 32px
        borderTopRightRadius: THEME.borderRadius['2xl'], // 32px
        paddingHorizontal: THEME.layout.screenPadding, // 16px
        maxHeight: '80%',
    },
    handle: {
        width: THEME.layout.bottomSheetHandle, // 24px
        height: 5,
        borderRadius: THEME.borderRadius.pill,
        alignSelf: 'center',
        marginTop: THEME.spacing[1] + 4, // 12px (8+4)
        marginBottom: THEME.spacing[3], // 24px
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing[3], // 24px
    },
    modalTitle: {
        fontSize: THEME.fontSize.xl, // 22px
    },
    modalScroll: {
        marginBottom: THEME.spacing[1], // 8px
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: THEME.spacing[2] - 2, // 14px
        borderRadius: THEME.borderRadius['2xl'] - 12, // 20px
        marginBottom: THEME.spacing[1] + 4, // 12px
        borderWidth: 1,
        gap: THEME.spacing[2], // 16px
    },
    optionIconContainer: {
        width: THEME.sizes.avatar.md, // 48px
        height: THEME.sizes.avatar.md, // 48px
        borderRadius: THEME.borderRadius.lg - 2, // 14px
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: THEME.fontSize.sm + 1, // 16px
    },
    optionSubtitle: {
        fontSize: THEME.fontSize.micro, // 12px
        marginTop: 2,
    },
    actionButton: {
        width: THEME.sizes.avatar.xs, // 32px
        height: THEME.sizes.avatar.xs, // 32px
        borderRadius: THEME.borderRadius.md - 2, // 10px
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AddTransactionBottomSheet;