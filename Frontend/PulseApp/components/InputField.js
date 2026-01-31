import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const InputField = ({
  label,
  icon,
  error,
  isDarkMode = true,
  secureTextEntry,
  style,
  ...props
}) => {
  const theme = getThemedColors(isDarkMode);

  return (
    <View style={[styles.container, style]}>
      {/* The Notched Label */}
      <View style={[styles.labelTag, { backgroundColor: theme.bg }]}>
        <Text style={[styles.labelText, { color: error ? '#FF3B30' : theme.textTertiary }]}>
          {label}
        </Text>
      </View>

      <View style={[
        styles.inputWrapper,
        {
          backgroundColor: theme.card,
          borderColor: error ? '#FF3B30' : theme.border
        }
      ]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.textTertiary}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[styles.input, { color: theme.text, fontFamily: FONTS.medium }]}
          placeholderTextColor={theme.textTertiary + '80'} // 50% opacity
          secureTextEntry={secureTextEntry}
          {...props}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    width: '100%',
  },
  labelTag: {
    position: 'absolute',
    top: -10,
    left: 16,
    zIndex: 2,
    paddingHorizontal: 6,
  },
  labelText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default InputField;