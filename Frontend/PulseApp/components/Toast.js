import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const Toast = ({
  type = 'info',
  title,
  message,
  onHide,
  duration = 3000,
  position = 'top',
  isDarkMode = true,
}) => {
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -150 : 150)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => hideToast(), duration);
    return () => clearTimeout(timer);
  }, []);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -150 : 150,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onHide && onHide());
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success': return { icon: 'checkmark-circle', accent: COLORS.primary };
      case 'error': return { icon: 'close-circle', accent: COLORS.error };
      case 'warning': return { icon: 'warning', accent: COLORS.warning };
      default: return { icon: 'information-circle', accent: COLORS.primary };
    }
  };

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[
        styles.innerContainer,
        {
          // SOLID BACKGROUNDS - No Transparency
          backgroundColor: isDarkMode ? '#2D2D2D' : '#FFFFFF',
          borderColor: isDarkMode ? '#3D3D3D' : '#F0F0F0',
        }
      ]}>

        {/* Compact Icon */}
        <View style={[styles.iconContainer, { backgroundColor: config.accent + '15' }]}>
          <Ionicons name={config.icon} size={22} color={config.accent} />
        </View>

        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, {
              color: isDarkMode ? COLORS.white : COLORS.outerSpace,
              fontFamily: FONTS.bold
            }]}>
              {title}
            </Text>
          )}
          {message && (
            <Text style={[styles.message, {
              color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
              fontFamily: FONTS.medium
            }]}>
              {message}
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={isDarkMode ? COLORS.gray[500] : COLORS.gray[400]} />
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
  },
  topPosition: { top: Platform.OS === 'ios' ? 54 : 40 },
  bottomPosition: { bottom: Platform.OS === 'ios' ? 110 : 90 },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    // Solid Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  title: { fontSize: 15, letterSpacing: -0.3 },
  message: { fontSize: 13, marginTop: 1 },
  closeButton: { padding: 4, marginLeft: 8 },
});

export default Toast;