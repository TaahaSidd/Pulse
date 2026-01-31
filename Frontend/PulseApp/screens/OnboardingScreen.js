import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Animated,
    Image,
} from 'react-native';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        title: 'Master Your\nFinancial Pulse',
        description: 'Track every heartbeat of your spending. Real-time insights to keep your finances in perfect rhythm.',
        icon: 'pulse-sharp',
        color: '#3B82F6',
        image: require('../assets/Chart3d.png'),
    },
    {
        id: '2',
        title: 'Vault-Grade\nPrivacy',
        description: 'Your data is encrypted and stays on your device. We provide the tools; you keep the keys.',
        icon: 'shield-checkmark-sharp',
        color: '#8B5CF6',
        image: require('../assets/Locker3d.png'),
    },
    {
        id: '3',
        title: 'Automated\nIntelligence',
        description: 'Stop manual logging. Let Pulse categorize your flow and predict your financial future.',
        icon: 'flash-sharp',
        color: '#EC4899',
        image: null,
    },
];


export default function OnboardingScreen({ navigation, isDarkMode = true }) {
    const imageFade = useRef(new Animated.Value(0)).current;
    const theme = getThemedColors(isDarkMode);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    useEffect(() => {
        Animated.timing(imageFade, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);


    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const handleAction = async () => {
        if (currentIndex < onboardingData.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
            navigation.replace('NotificationPermissionScreen');
        }
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.slide}>
                <View style={styles.illustrationContainer}>
                    {item.image ? (
                        <Animated.View style={{ opacity: imageFade }}>
                            <Image
                                source={item.image}
                                style={[
                                    styles.lockerImage,
                                    item.id === '1' && { width: width * 0.75, height: width * 0.85 },
                                    item.id === '2' && { width: width * 0.65, height: width * 0.75 },
                                ]}
                                resizeMode="contain"
                            />
                        </Animated.View>
                    ) : (
                        // Default animated ripple + icon for other slides
                        <>
                            <View
                                style={[
                                    styles.ripple,
                                    { borderColor: item.color + '30', transform: [{ scale: 1.2 }] },
                                ]}
                            />
                            <View
                                style={[
                                    styles.ripple,
                                    { borderColor: item.color + '15', transform: [{ scale: 1.5 }] },
                                ]}
                            />
                            <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                                <Ionicons name={item.icon} size={60} color="#FFF" />
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {item.title}
                    </Text>
                    <Text
                        style={[
                            styles.description,
                            { color: theme.textSecondary, fontFamily: FONTS.regular },
                        ]}
                    >
                        {item.description}
                    </Text>
                </View>
            </View>
        );
    };


    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <TouchableOpacity
                style={styles.skipButton}
                onPress={() => navigation.replace('NotificationPermissionScreen')}
            >
                <Text style={[styles.skipText, { color: theme.textTertiary, fontFamily: FONTS.semiBold }]}>Skip</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                onViewableItemsChanged={viewableItemsChanged}
                keyExtractor={(item) => item.id}
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
                                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: onboardingData[currentIndex].color }]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.nextButton, { backgroundColor: onboardingData[currentIndex].color }]}
                    onPress={handleAction}
                    activeOpacity={0.9}
                >
                    <Text style={[styles.buttonText, { fontFamily: FONTS.bold }]}>
                        {currentIndex === onboardingData.length - 1 ? "Get Started" : "Continue"}
                    </Text>
                    <Ionicons
                        name={currentIndex === onboardingData.length - 1 ? "rocket-sharp" : "chevron-forward"}
                        size={20}
                        color="#FFF"
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    skipButton: { position: 'absolute', top: 60, right: 30, zIndex: 10 },
    skipText: { fontSize: FONT_SIZES.sm, letterSpacing: 0.5 },
    slide: { width, flex: 1, alignItems: 'center', justifyContent: 'center' },
    illustrationContainer: {
        width: width * 0.85,
        height: height * 0.45,  // ⬅ Increased for images
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },

    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 12,
    },
    ripple: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
    },
    content: { alignItems: 'center', paddingHorizontal: 40 },
    title: {
        fontSize: 34,
        textAlign: 'center',
        lineHeight: 42,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: { paddingHorizontal: 30, paddingBottom: 60 },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    nextButton: {
        flexDirection: 'row',
        height: 64,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
    },

    lockerImage: {
        maxWidth: '90%',
        maxHeight: '100%',
    },

});