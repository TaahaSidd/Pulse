import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import this
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PulseSpeedDial = ({ isOpen, setIsOpen, onManual, onPaste, theme, isDarkMode }) => {
    const insets = useSafeAreaInsets();

    const toggleMenu = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    const handleAction = (action) => {
        toggleMenu();
        action();
    };

    // Calculation to align exactly above the Nav Bar
    // Nav Bar height (78) + Bottom padding (16) + Gap (16)
    const dynamicBottom = Math.max(insets.bottom, 16) + 94;

    return (
        <>
            {isOpen && (
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={toggleMenu}
                />
            )}

            <View style={[styles.container, { bottom: dynamicBottom }]}>
                {isOpen && (
                    <>
                        {/* Option 1: Smart Paste */}
                        <View style={styles.optionWrapper}>
                            <View style={[
                                styles.labelCard,
                                {
                                    backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                                }
                            ]}>
                                <Text style={[styles.label, { color: theme.text }]}>Smart Paste</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.miniFab, { backgroundColor: COLORS.secondary }]}
                                onPress={() => handleAction(onPaste)}
                            >
                                <Ionicons name="flash" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Option 2: Manual Entry */}
                        <View style={styles.optionWrapper}>
                            <View style={[
                                styles.labelCard,
                                {
                                    backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                                }
                            ]}>
                                <Text style={[styles.label, { color: theme.text }]}>Manual Entry</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.miniFab, { backgroundColor: theme.cardElevated }]}
                                onPress={() => handleAction(onManual)}
                            >
                                <Ionicons name="create" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={[styles.mainFab, { backgroundColor: COLORS.primary }]}
                    activeOpacity={0.9}
                    onPress={toggleMenu}
                >
                    <Ionicons
                        name={isOpen ? "close" : "add"}
                        size={32}
                        color="black"
                    />
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)', // Slightly lighter for the glass look
        zIndex: 99,
    },
    container: {
        position: 'absolute',
        right: 24, // Matches BottomNavBar horizontal padding
        alignItems: 'flex-end',
        zIndex: 100,
    },
    optionWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    labelCard: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 12,
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    label: {
        fontSize: 13,
        fontFamily: FONTS.semiBold,
    },
    miniFab: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    mainFab: {
        width: 60, // Slightly smaller to match Nav Bar proportions
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
});

export default PulseSpeedDial;