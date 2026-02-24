import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    StatusBar,
    Animated,
    Image,
} from 'react-native';
//import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import Button from '../components/Button'; // Your custom high-performance button

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        title: 'Real-Time\nRhythm',
        description: 'Pulse listens to your notifications to log expenses instantly. No typing, just tracking.',
        icon: 'pulse-sharp',
        color: '#8CF364', // Pulse Green
        image: require('../assets/Chart3d.png'),
    },
    {
        id: '2',
        title: 'Local & \nLocked',
        description: 'Your data stays on your device. Zero cloud tracking, total financial privacy.',
        icon: 'shield-checkmark-sharp',
        color: '#3B82F6', // Trust Blue
        image: require('../assets/Locker3d.png'),
    },
    {
        id: '3',
        title: 'Smart\nFlow',
        description: 'We clean messy bank alerts and categorize them into a clear financial pulse.',
        icon: 'flash-sharp',
        color: '#8B5CF6', // AI Purple
        image: null,
    },
];

export default function OnboardingScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);
    const imageFade = useRef(new Animated.Value(0)).current;

    // Trigger fade animation on slide change
    useEffect(() => {
        imageFade.setValue(0);
        Animated.timing(imageFade, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [currentIndex]);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const handleAction = async () => {
        if (currentIndex < onboardingData.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true
            });
        } else {
            // Save state and move to permissions
            await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
            navigation.replace('NotificationPermissionScreen');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            <View style={styles.illustrationContainer}>
                {item.image ? (
                    <Animated.Image
                        source={item.image}
                        style={[
                            styles.lockerImage,
                            { opacity: imageFade },
                            item.id === '1' && { width: width * 0.75, height: width * 0.85 },
                            item.id === '2' && { width: width * 0.65, height: width * 0.75 },
                        ]}
                        resizeMode="contain"
                    />
                ) : (
                    <Animated.View style={{ opacity: imageFade, alignItems: 'center' }}>
                        <View style={[styles.ripple, { borderColor: item.color + '30', transform: [{ scale: 1.2 }] }]} />
                        <View style={[styles.ripple, { borderColor: item.color + '15', transform: [{ scale: 1.5 }] }]} />
                        <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                            <Ionicons name={item.icon} size={60} color={isDarkMode ? "#000" : "#FFF"} />
                        </View>
                    </Animated.View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                    {item.title}
                </Text>
                <Text style={[styles.description, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                    {item.description}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Skip Button using your component */}
            <View style={styles.skipContainer}>
                <Button
                    title="Skip"
                    variant="ghost"
                    size="small"
                    onPress={() => navigation.replace('NotificationPermissionScreen')}
                    textStyle={{ color: theme.textTertiary, fontFamily: FONTS.semiBold }}
                />
            </View>

            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={viewableItemsChanged}
                keyExtractor={(item) => item.id}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                bounces={false}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {onboardingData.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [8, 24, 8],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={i}
                                style={[
                                    styles.dot,
                                    {
                                        width: dotWidth,
                                        opacity,
                                        backgroundColor: onboardingData[currentIndex].color
                                    }
                                ]}
                            />
                        );
                    })}
                </View>

                {/* Primary Action Button - ZERO HOLD DELAY */}
                <Button
                    title={currentIndex === onboardingData.length - 1 ? "Sync My Pulse" : "Continue"}
                    onPress={handleAction}
                    fullWidth
                    variant="primary"
                    holdToTrigger={false} // Instant interaction
                    icon={currentIndex === onboardingData.length - 1 ? "rocket-sharp" : "chevron-forward"}
                    iconPosition="right"
                    style={{ backgroundColor: onboardingData[currentIndex].color }}
                    textStyle={{ color: '#000' }} // Dark text on bright pulse colors
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    skipContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 10
    },
    slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center' },
    illustrationContainer: {
        width: width,
        height: height * 0.4,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    ripple: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
        height: height * 0.25
    },
    title: {
        fontSize: 34,
        textAlign: 'center',
        lineHeight: 42,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 60
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    lockerImage: {
        maxWidth: '90%',
        maxHeight: '100%',
    },
});