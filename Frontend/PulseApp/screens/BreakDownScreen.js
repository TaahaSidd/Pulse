import React from 'react';
import { StyleSheet, Text, View, ImageBackground, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { getThemedColors } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const { width } = Dimensions.get('window');

const MERCHANT_IMAGE = require('../assets/bg-imageMerchant.jpg');
const CATEGORY_IMAGE = require('../assets/Bg-image2.jpg');

export default function BreakdownDetailScreen({ route, navigation }) {

    const { data, type, isDarkMode } = route.params;
    const theme = getThemedColors(isDarkMode);

    const isCategory = type === 'category';

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* 🖼️ HERO SECTION */}
            <ImageBackground
                source={isCategory ? CATEGORY_IMAGE : MERCHANT_IMAGE}
                style={styles.heroImage}
            >
                <View style={styles.overlayGradient}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.heroContent}>
                        <Text style={styles.merchantLabel}>
                            {isCategory ? 'CATEGORY BREAKDOWN' : 'TOP SPENDER'}
                        </Text>
                        <Text style={styles.merchantName}>{data.name}</Text>
                    </View>
                </View>
            </ImageBackground>

            {/* 💳 STATS CARD */}
            <View style={[styles.statsFloatingCard, { backgroundColor: theme.cardElevated }]}>
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: theme.text, fontFamily: FONTS.bold }]}>
                        ₹{data.amount.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>TOTAL SPENT</Text>
                </View>

                <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {data.count || data.transactions?.length || 0}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                        {isCategory ? 'ITEMS' : 'VISITS'}
                    </Text>
                </View>

                <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {data.lastDate ? format(parseISO(data.lastDate), 'MMM d') : 'N/A'}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>LATEST</Text>
                </View>
            </View>

            {/* 📜 RECENT ACTIVITY LIST */}
            <View style={styles.listSection}>
                <Text style={[styles.listTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                    {isCategory ? 'Category History' : 'Recent Activity'}
                </Text>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {data.transactions && data.transactions.length > 0 ? (
                        data.transactions.map((tx, i) => (
                            <View key={i} style={[styles.activityRow, { borderBottomColor: theme.border }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.activityDate, { color: theme.text, fontFamily: FONTS.medium }]}>
                                        {format(parseISO(tx.date), 'EEEE, do MMM')}
                                    </Text>
                                    {/* Subtitle logic: Show Merchant if in Category view, or Category if in Merchant view */}
                                    <Text style={[styles.activitySubtitle, { color: theme.textTertiary }]}>
                                        {isCategory ? tx.merchant : tx.category}
                                    </Text>
                                </View>
                                <Text style={[styles.activityAmount, { color: theme.text, fontFamily: FONTS.bold }]}>
                                    ₹{tx.amount.toLocaleString()}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 20 }}>
                            No transactions found.
                        </Text>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroImage: { width: width, height: 320 },
    overlayGradient: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 25,
        justifyContent: 'space-between',
    },
    backButton: {
        marginTop: 35,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContent: { marginBottom: 40 },
    merchantLabel: { color: '#FFF', fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 2, opacity: 0.8 },
    merchantName: { color: '#FFF', fontSize: 32, fontFamily: FONTS.bold, marginTop: 5, textTransform: 'capitalize' },
    statsFloatingCard: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: -40,
        borderRadius: 24,
        paddingVertical: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        alignItems: 'center',
    },
    statBox: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 16 },
    statLabel: { fontSize: 8, marginTop: 4, letterSpacing: 1 },
    verticalDivider: { width: 1, height: 25 },
    listSection: { flex: 1, marginTop: 30, paddingHorizontal: 25 },
    listTitle: { fontSize: 18, marginBottom: 15 },
    scrollContent: { paddingBottom: 40 },
    activityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 0.5,
    },
    activityDate: { fontSize: 14 },
    activitySubtitle: { fontSize: 12, marginTop: 2 },
    activityAmount: { fontSize: 16 },
});