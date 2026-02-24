import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

const Toast = ({
  type = 'info',
  title,
  message,
  onHide,
  duration = 3000,
  position = 'top',
  isDarkMode = true,
}) => {
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -120 : 120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => hideToast(), duration);
    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -120 : 120,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onHide && onHide());
  };

  const config = (() => {
    switch (type) {
      case 'success': return { icon: 'checkmark-circle', accent: COLORS.primary };
      case 'error': return { icon: 'close-circle', accent: COLORS.error };
      case 'warning': return { icon: 'warning', accent: COLORS.warning };
      default: return { icon: 'information-circle', accent: COLORS.primary };
    }
  })();

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[
        styles.innerContainer,
        {
          backgroundColor: isDarkMode ? '#282828' : '#FFFFFF',
          borderColor: isDarkMode ? '#383838' : '#EAEAEA',
        }
      ]}>
        <View style={[styles.iconContainer, { backgroundColor: config.accent + '20' }]}>
          <Ionicons name={config.icon} size={20} color={config.accent} />
        </View>

        <View style={styles.textContainer}>
          {title && (
            <Text numberOfLines={1} style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#1A1A1A' }]}>
              {title}
            </Text>
          )}
          {message && (
            <Text numberOfLines={1} style={[styles.message, { color: isDarkMode ? '#A0A0A0' : '#666666' }]}>
              {message}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={isDarkMode ? '#666' : '#CCC'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center', // Centers the toast if it doesn't fill width
  },
  topPosition: { top: Platform.OS === 'ios' ? 50 : 30 },
  bottomPosition: { bottom: Platform.OS === 'ios' ? 90 : 70 },
  innerContainer: {
    width: '100%',
    maxWidth: 450,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18, // Rounded but not a full pill
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    lineHeight: 18,
  },
  message: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 16,
    marginTop: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default Toast;