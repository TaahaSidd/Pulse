import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    StatusBar,
    Animated,
    Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

import { getThemedColors } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        icon: 'chatbubble-ellipses',
        accent: '#8CF364',
        title: 'Your Money,\nAutomatic.',
        description: 'Pace reads your bank SMS the moment it arrives and logs every transaction instantly. No typing, no effort.',
    },
    {
        id: '2',
        icon: 'lock-closed',
        accent: '#3B82F6',
        title: 'Stays on\nYour Device.',
        description: 'Everything is stored locally on your phone. Your financial data never touches a server or cloud.',
    },
    {
        id: '3',
        icon: 'pie-chart',
        accent: '#8B5CF6',
        title: 'See Where\nIt Goes.',
        description: 'Pace categorizes your spending automatically and shows you a clear picture of your finances each month.',
    },
];

export default function OnboardingScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
    }).current;

    const handleAction = async () => {
        if (currentIndex < onboardingData.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
            navigation.replace('NameScreen');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.slide}>
            {/* Icon */}
            <View style={[styles.iconCircle, { backgroundColor: item.accent + '15' }]}>
                <Ionicons name={item.icon} size={48} color={item.accent} />
            </View>

            {/* Text */}
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                {item.description}
            </Text>
        </View>
    );

    const current = onboardingData[currentIndex];

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

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
                scrollEventThrottle={16}
            />

            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <View style={styles.pagination}>
                        {onboardingData.map((_, i) => (
                            <View key={i} style={[
                                styles.dot,
                                {
                                    backgroundColor: i === currentIndex ? current.accent : theme.border,
                                    width: i === currentIndex ? 24 : 8,
                                    opacity: i === currentIndex ? 1 : 0.4,
                                }
                            ]} />
                        ))}
                    </View>

                    <Button
                        title={currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                        onPress={handleAction}
                        style={{
                            backgroundColor: current.accent,
                            paddingHorizontal: 32,
                            borderRadius: 100,
                            height: 52,
                        }}
                        textStyle={{ color: '#000', fontFamily: FONTS.bold, fontSize: 15 }}
                        icon={currentIndex === onboardingData.length - 1 ? 'checkmark' : 'arrow-forward'}
                        iconPosition="right"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    slide: {
        width,
        height,
        paddingHorizontal: 32,
        justifyContent: 'center',
        paddingBottom: 160,
    },
    iconCircle: {
        width: 90,
        height: 90,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 40,
        fontFamily: FONTS.bold,
        letterSpacing: -1,
        lineHeight: 46,
        marginBottom: 20,
    },
    description: {
        fontSize: 17,
        fontFamily: FONTS.regular,
        lineHeight: 26,
        opacity: 0.7,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width,
        paddingHorizontal: 32,
        paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pagination: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
});