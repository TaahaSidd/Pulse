import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getThemedColors } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const InputField = ({
  label,
  leftIcon,
  error,
  secureTextEntry,
  isDarkMode,
  containerStyle,
  ...props
}) => {
  const theme = getThemedColors(isDarkMode);
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const getBorderColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return theme.border;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>
          {label}
        </Text>
      )}

      <View style={[
        styles.inputContainer,
        {
          backgroundColor: theme.card,
          borderColor: getBorderColor(),
          borderWidth: isFocused || error ? 1.5 : 1
        }
      ]}>
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? COLORS.primary : theme.textTertiary}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[styles.input, { color: theme.text, fontFamily: FONTS.regular }]}
          placeholderTextColor={theme.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !passwordVisible}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.errorText, { fontFamily: FONTS.medium }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
    width: '100%',
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default InputField;