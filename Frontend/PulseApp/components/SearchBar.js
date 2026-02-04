import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const SearchBar = ({
    value,
    onChangeText,
    placeholder = "Search...",
    theme,
    containerStyle
}) => {
    return (
        <View style={[
            styles.searchContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
            containerStyle
        ]}>
            <Ionicons name="search" size={20} color={theme.textTertiary} />

            <TextInput
                placeholder={placeholder}
                placeholderTextColor={theme.textTertiary}
                style={[styles.searchInput, { color: theme.text, fontFamily: FONTS.regular }]}
                value={value}
                onChangeText={onChangeText}
                autoCorrect={false}
            />

            {value.length > 0 && (
                <TouchableOpacity
                    onPress={() => onChangeText('')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 15,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: FONT_SIZES.base,
        height: '100%', // Ensures the touch area fills the container
    },
});

export default SearchBar;