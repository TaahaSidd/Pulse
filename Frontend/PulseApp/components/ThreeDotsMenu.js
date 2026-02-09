// components/ThreeDotsMenu.js
import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

export default function ThreeDotsMenu({ theme, options = [], iconColor }) {
    const [visible, setVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const buttonRef = useRef(null);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    const openMenu = () => {
        // Measure button position
        buttonRef.current?.measure((fx, fy, width, height, px, py) => {
            setMenuPosition({
                top: py + height + 5, // 5px below the button
                right: 20, // align with screen padding
            });
            setVisible(true);

            // Animate menu appearance
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 100,
                friction: 7,
            }).start();
        });
    };

    const closeMenu = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    const handleOptionPress = (onPress) => {
        closeMenu();
        // Small delay so menu closes before action
        setTimeout(() => onPress?.(), 200);
    };

    return (
        <>
            {/* Three dots button */}
            <TouchableOpacity
                ref={buttonRef}
                onPress={openMenu}
                style={styles.dotsButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons
                    name="ellipsis-vertical"
                    size={24}
                    color={iconColor || theme.text}
                />
            </TouchableOpacity>

            {/* Popover Modal */}
            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={closeMenu}
            >
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.menu,
                                    {
                                        top: menuPosition.top,
                                        right: menuPosition.right,
                                        backgroundColor: theme.card,
                                        borderColor: theme.border,
                                        transform: [
                                            { scale: scaleAnim },
                                            {
                                                translateY: scaleAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [-10, 0],
                                                }),
                                            },
                                        ],
                                        opacity: scaleAnim,
                                    },
                                ]}
                            >
                                {options.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleOptionPress(option.onPress)}
                                        style={[
                                            styles.menuItem,
                                            index < options.length - 1 && {
                                                borderBottomWidth: 1,
                                                borderBottomColor: theme.border,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={option.icon}
                                            size={20}
                                            color={option.color || theme.text}
                                            style={styles.menuIcon}
                                        />
                                        <Text
                                            style={[
                                                styles.menuText,
                                                {
                                                    color: option.color || theme.text,
                                                    fontFamily: FONTS.medium,
                                                },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    dotsButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    menu: {
        position: 'absolute',
        borderRadius: 16,
        borderWidth: 1,
        minWidth: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    menuIcon: {
        marginRight: 12,
    },
    menuText: {
        fontSize: FONT_SIZES.base,
    },
});