import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

const { width } = Dimensions.get('window');

// DUMMY DATA
const DUMMY_ACCOUNTS = [
    { id: '1', name: 'HDFC Bank', accNo: '**** 4421', lastAmount: '1,250', type: 'debit', color: '#004a8c' },
    { id: '2', name: 'ICICI Bank', accNo: '**** 9872', lastAmount: '4,500', type: 'credit', color: '#f58220' },
    { id: '3', name: 'SBI Bank', accNo: '**** 1102', lastAmount: '850', type: 'debit', color: '#29a8df' },
    { id: '4', name: 'Axis Bank', accNo: '**** 5566', lastAmount: '12,000', type: 'credit', color: '#ae124a' },
];

export default function AccountsAll({ navigation, route }) {
    const isDarkMode = route.params?.isDarkMode ?? true;
    const theme = getThemedColors(isDarkMode);

    const renderAccountCard = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.fullBankCard, { backgroundColor: theme.card }]}
        >
            <View style={styles.detailsContainer}>
                <View style={styles.statusRow}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.statusText, { color: COLORS.primary }]}>ACTIVE</Text>
                </View>

                <Text style={[styles.bankName, { color: theme.text, fontFamily: FONTS.bold }]}>
                    {item.name}
                </Text>
                <Text style={[styles.accNo, { color: theme.textTertiary }]}>
                    {item.accNo}
                </Text>

                <View style={styles.balanceRow}>
                    <Text style={[styles.balanceLabel, { color: theme.textSecondary }]}>Last Transaction</Text>
                    <Text style={[styles.balanceValue, { color: item.type === 'debit' ? '#FF3B30' : '#34C759' }]}>
                        ₹{item.lastAmount}
                    </Text>
                </View>
            </View>

            <Image
                source={require('../assets/Bank3d.png')}
                style={styles.cardIllustration}
                resizeMode="contain"
            />
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                    Linked Accounts
                </Text>
                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={DUMMY_ACCOUNTS}
                keyExtractor={(item) => item.id}
                renderItem={renderAccountCard}
                contentContainerStyle={styles.listPadding}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerTitle: { fontSize: 20 },
    backButton: { padding: 5 },
    addButton: { padding: 5 },
    listPadding: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
    },
    fullBankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 28,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)', // Subtle border for dark mode
    },
    detailsContainer: { flex: 1 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: 6 },
    statusText: { fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 0.5 },
    bankName: { fontSize: 18, marginBottom: 2 },
    accNo: { fontSize: 12, marginBottom: 15 },
    balanceRow: { marginTop: 0 },
    balanceLabel: { fontSize: 10, marginBottom: 2 },
    balanceValue: { fontSize: 18, fontFamily: FONTS.bold },
    cardIllustration: { width: 85, height: 85 },
});