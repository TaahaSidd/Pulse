import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SwipeTooltip = ({ onClose }) => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.text}>
                    Swipe left to remove categories
                </Text>
            </View>

            <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}
            >
                <Ionicons name="close" size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>

            {/* The Arrow Nut */}
            <View style={styles.arrow} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: -50,
        left: 10,
        backgroundColor: '#008CFE',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 9999,
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        // Shadow for Android
        elevation: 8,
    },
    content: {
        marginRight: 10,
    },
    text: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Poppins_600SemiBold',
        letterSpacing: 0.3
    },
    closeButton: {
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255, 255, 255, 0.2)',
        paddingLeft: 8,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        position: 'absolute',
        bottom: -6,
        left: 25,
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#008CFE',
    }
});

export default SwipeTooltip;