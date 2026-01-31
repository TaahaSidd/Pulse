import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, getThemedColors } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const BottomNavBar = ({ active, onNavigate, isDarkMode = true }) => {
  const insets = useSafeAreaInsets();
  const theme = getThemedColors(isDarkMode);

  const NavItem = ({ screen, icon, label }) => {
    const isActive = active === screen;

    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onNavigate(screen)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.iconContainer,
          isActive && { backgroundColor: isDarkMode ? 'rgba(140, 243, 100, 0.15)' : 'rgba(140, 243, 100, 0.25)' }
        ]}>
          <Ionicons
            name={isActive ? icon : `${icon}-outline`}
            size={24}
            color={isActive ? COLORS.primary : theme.textTertiary}
          />
        </View>
        <Text
          style={[
            styles.label,
            {
              color: isActive ? theme.text : theme.textTertiary,
              fontFamily: isActive ? FONTS.bold : FONTS.medium,
            }
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 95 : 100}
        tint={isDarkMode ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View style={[
          styles.innerContainer,
          {
            // FIXED: Increased opacity to 0.75-0.8 for better readability (blocks background bleed-through)
            backgroundColor: isDarkMode ? 'rgba(25, 25, 25, 0.75)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(140, 243, 100, 0.5)',  // FIXED: Slightly more visible border
          }
        ]}>
          <NavItem screen="Home" icon="home" label="Home" />
          <NavItem screen="Insights" icon="stats-chart" label="Insights" />
          <NavItem screen="Transactions" icon="receipt" label="History" />
          <NavItem screen="Settings" icon="settings" label="Settings" />
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  innerContainer: {
    flexDirection: 'row',
    height: 78,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 32,
    borderWidth: 1,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: -0.2,
  },
});

export default BottomNavBar;