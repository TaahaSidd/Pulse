import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Platform,
    ActivityIndicator,
    Keyboard,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const SmsInputBottomSheet = ({ visible, theme, onClose, onSend, isSending }) => {
    const [smsText, setSmsText] = useState('');
    const inputRef = useRef(null);
    const bottomOffset = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            setSmsText('');
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    }, [visible]);

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
            (e) => {
                Animated.timing(bottomOffset, {
                    toValue: e.endCoordinates.height,
                    duration: Platform.OS === 'android' ? 0 : 250,
                    useNativeDriver: false,
                }).start();
            }
        );

        const hideSub = Keyboard.addListener(
            Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
            () => {
                Animated.timing(bottomOffset, {
                    toValue: 0,
                    duration: Platform.OS === 'android' ? 0 : 250,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleSend = () => {
        if (!smsText.trim() || isSending) return;
        onSend(smsText);
    };

    const handleClose = () => {
        Keyboard.dismiss();
        setSmsText('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.root}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                {/* Sheet lifts with keyboard */}
                <Animated.View
                    style={[
                        styles.sheet,
                        { backgroundColor: theme.card, marginBottom: bottomOffset }
                    ]}
                >
                    <View style={[styles.handle, { backgroundColor: theme.border }]} />

                    <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                        Paste Bank SMS
                    </Text>

                    <View style={[styles.inputRow, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.input, { color: theme.text, fontFamily: FONTS.regular }]}
                            placeholder="Paste your transaction SMS here..."
                            placeholderTextColor={theme.textTertiary}
                            value={smsText}
                            onChangeText={setSmsText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: smsText.trim() ? COLORS.primary : theme.border }]}
                            onPress={handleSend}
                            disabled={!smsText.trim() || isSending}
                            activeOpacity={0.8}
                        >
                            {isSending
                                ? <ActivityIndicator size="small" color="black" />
                                : <Ionicons name="flash" size={18} color={smsText.trim() ? 'black' : theme.textTertiary} />
                            }
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.hint, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                        Works with SBI, HDFC, ICICI, Axis, Federal & UPI apps
                    </Text>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 99,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 18,
        borderWidth: 1,
        padding: 12,
        gap: 10,
        minHeight: 80,
    },
    input: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        maxHeight: 120,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hint: {
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center',
    },
});

export default SmsInputBottomSheet;