import React from 'react';
import { View, StyleSheet } from 'react-native';

export const FormGroup = ({ children, theme, style }) => (
    <View style={[styles.formGroup, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    formGroup: {
        borderRadius: 24,
        borderWidth: 1,
        paddingHorizontal: 16,
        overflow: 'hidden'
    },
});