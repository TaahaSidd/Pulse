import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Pressable,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import SMSService from '../services/SMSListener';

export default function SmsPermissionBanner({ theme, db, onGranted, onDismiss }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAllow = async () => {
        setLoading(true);
        try {
            const granted = await SMSService.requestPermissions();
            if (granted) {
                await SMSService.initialize(db, (newTx) => {
                    console.log('New transaction:', newTx.merchant);
                });
                setModalVisible(false);
                onGranted?.();
            } else {
                setModalVisible(false);
            }
        } catch (e) {
            console.log('SMS permission error:', e);
            setModalVisible(false);
        }
        setLoading(false);
    };

    if (Platform.OS !== 'android') return null;

    return (
        <>
            <TouchableOpacity
                style={[styles.banner, { backgroundColor: theme.card }]}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '18' }]}>
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} />
                </View>

                <View style={styles.textBlock}>
                    <Text style={[styles.bannerTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                        Enable SMS Tracking
                    </Text>
                    <Text style={[styles.bannerSub, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                        Auto-detect expenses from bank messages
                    </Text>
                </View>

                <TouchableOpacity onPress={onDismiss} hitSlop={12} style={styles.closeBtn}>
                    <Ionicons name="close" size={16} color={theme.textTertiary} />
                </TouchableOpacity>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
                    <Pressable
                        style={[styles.modal, { backgroundColor: theme.card }]}
                        onPress={e => e.stopPropagation()}
                    >
                        <View style={[styles.modalIconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={28} color={COLORS.primary} />
                        </View>

                        <Text style={[styles.modalTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                            Enable SMS Tracking
                        </Text>
                        <Text style={[styles.modalMessage, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            Allow Pace to read bank SMS and auto-log your expenses.
                        </Text>

                        <View style={styles.buttons}>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: COLORS.primary }]}
                                onPress={handleAllow}
                                disabled={loading}
                            >
                                <Text style={[styles.btnTextPrimary, { fontFamily: FONTS.bold }]}>
                                    {loading ? 'Requesting...' : 'Allow'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: theme.cardElevated, borderWidth: 1, borderColor: theme.border }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.btnText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                                    Not now
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBlock: { flex: 1, gap: 2 },
    bannerTitle: { fontSize: 14 },
    bannerSub: { fontSize: 12 },
    closeBtn: {
        padding: 4,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    modal: {
        width: '100%',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        gap: 12,
    },
    modalIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    modalTitle: { fontSize: 20, textAlign: 'center' },
    modalMessage: { fontSize: 14, textAlign: 'center', lineHeight: 20, opacity: 0.8 },
    buttons: { width: '100%', gap: 10, marginTop: 8 },
    btn: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    btnTextPrimary: { fontSize: 15, color: '#000' },
    btnText: { fontSize: 15 },
});