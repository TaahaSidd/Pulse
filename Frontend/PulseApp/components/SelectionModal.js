import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/Themes';

export const SelectionModal = ({ visible, title, onClose, children, theme }) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.bottomSheet, { backgroundColor: theme.card }]}>

                            {/* Handle Bar - Consistent with Category Modal */}
                            <View style={[styles.handle, { backgroundColor: theme.border }]} />

                            <View style={styles.sheetHeader}>
                                <Text style={[styles.sheetTitle, {
                                    color: theme.text,
                                    fontWeight: THEME.fontWeight.bold
                                }]}>
                                    {title}
                                </Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Ionicons
                                        name="close-circle"
                                        size={THEME.sizes.icon.lg}
                                        color={theme.textTertiary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {children}
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end'
    },
    bottomSheet: {
        borderTopLeftRadius: THEME.borderRadius['2xl'], // 32px
        borderTopRightRadius: THEME.borderRadius['2xl'], // 32px
        paddingHorizontal: THEME.layout.screenPadding, // 16px
        paddingBottom: THEME.spacing[5], // 40px
        maxHeight: '80%'
    },
    handle: {
        width: THEME.layout.bottomSheetHandle, // 24px
        height: 5,
        borderRadius: THEME.borderRadius.pill,
        alignSelf: 'center',
        marginTop: THEME.spacing[1] + 4, // 12px
        marginBottom: THEME.spacing[3], // 24px
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: THEME.spacing[3] // 24px
    },
    sheetTitle: {
        fontSize: THEME.fontSize.xl // 22px
    },
});