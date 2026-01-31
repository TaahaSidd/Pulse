import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated, Text } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

// Start positions are now very tight (20px offset) for a "gathering" effect
const PIECES = [
  {
    xml: `<svg width="84" height="84" viewBox="0 0 84 84" fill="none"><path d="M83.9335 0L83.9335 83.9334L0 83.9334L0 20C0 8.9543 8.9543 0 20 0L83.9335 0Z" fill="#8CF364"/></svg>`,
    startPos: { x: -20, y: -20 }
  },
  {
    xml: `<svg width="84" height="84" viewBox="0 0 84 84" fill="none"><path d="M83.9341 0L83.9341 83.9334L28.4851 83.9334C12.7535 83.9334 0.000610352 71.1805 0.000610352 55.4489L0.000610352 0L83.9341 0Z" fill="#8CF364"/></svg>`,
    startPos: { x: 20, y: -20 }
  },
  {
    xml: `<svg width="84" height="84" viewBox="0 0 84 84" fill="none"><path d="M55.4489 0C71.1805 0 83.9334 12.753 83.9334 28.4845L83.9334 83.9334L0 83.9334L0 0L55.4489 0Z" fill="#8CF364"/></svg>`,
    startPos: { x: -20, y: 20 }
  },
  {
    xml: `<svg width="84" height="84" viewBox="0 0 84 84" fill="none"><path d="M83.9333 0L83.9333 63.9339C83.9333 74.9796 74.979 83.9339 63.9333 83.9339L0 83.9339L0 0L83.9333 0Z" fill="#8CF364"/></svg>`,
    startPos: { x: 20, y: 20 }
  }
];

export default function SplashScreen({ navigation, isDarkMode = true }) {
  const bgColor = isDarkMode ? '#0A0F0A' : '#F8FFF5';

  const pieceAnims = useRef(PIECES.map(p => new Animated.ValueXY(p.startPos))).current;
  const pieceOpacities = useRef(PIECES.map(() => new Animated.Value(0))).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // 1. Logo Assembles
    const animations = PIECES.flatMap((_, i) => [
      Animated.spring(pieceAnims[i], {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        bounciness: 4,
        speed: 1,
        delay: i * 80, // Snappier stagger
      }),
      Animated.timing(pieceOpacities[i], {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        delay: i * 80,
      })
    ]);

    Animated.parallel(animations).start(() => {
      // 2. Light haptic tap when joined
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // 3. Tagline floats up and fades in
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start(() => {
        // 4. Brief pause to let them read it, then navigate
        setTimeout(() => navigation.replace('Onboarding'), 1200);
      });
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar hidden />

      <View style={styles.content}>
        <View style={styles.logoGrid}>
          {PIECES.map((piece, i) => (
            <Animated.View
              key={i}
              style={[
                styles.piece,
                {
                  transform: pieceAnims[i].getTranslateTransform(),
                  opacity: pieceOpacities[i]
                }
              ]}
            >
              <SvgXml xml={piece.xml} width={50} height={50} />
            </Animated.View>
          ))}
        </View>

        <Animated.Text style={[
          styles.tagline,
          {
            color: isDarkMode ? '#555' : '#999',
            opacity: taglineOpacity,
            fontFamily: FONTS.medium,
            transform: [{ translateY: taglineTranslateY }]
          }
        ]}>
          Your finances, in sync.
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center' },
  logoGrid: {
    width: 105,
    height: 105,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 3,
  },
  piece: { width: 50, height: 50 },
  tagline: {
    fontSize: 12,
    marginTop: 24, // Closer to the logo
    textAlign: 'center',
    letterSpacing: 4, // Elegant tracking
    textTransform: 'uppercase',
  },
});