import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

// Dummy Transactions for this specific bank
const BANK_TRANSACTIONS = [
    { id: '1', title: 'Starbucks Coffee', date: 'Today, 10:30 AM', amount: -250, category: 'Food' },
    { id: '2', title: 'Salary Credited', date: 'Yesterday', amount: 45000, category: 'Income' },
    { id: '3', title: 'Amazon India', date: '28 Jan', amount: -1200, category: 'Shopping' },
    { id: '4', title: 'Electricity Bill', date: '25 Jan', amount: -2450, category: 'Bills' },
];

export default function SpecificBankDetail({ route, navigation }) {
    // Get bank details passed from the previous screen
    const { bankName = 'HDFC Bank', accNo = '**** 4421', isDarkMode = true } = route.params || {};
    const theme = getThemedColors(isDarkMode);

    const renderTransaction = ({ item }) => (
        <View style={[styles.txRow, { borderBottomColor: theme.border }]}>
            <View style={[styles.txIcon, { backgroundColor: item.amount > 0 ? '#34C75920' : '#FF3B3020' }]}>
                <Ionicons
                    name={item.amount > 0 ? "arrow-down" : "arrow-up"}
                    size={20}
                    color={item.amount > 0 ? '#34C759' : '#FF3B30'}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.txTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>{item.title}</Text>
                <Text style={[styles.txDate, { color: theme.textTertiary }]}>{item.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: item.amount > 0 ? '#34C759' : theme.text, fontFamily: FONTS.bold }]}>
                {item.amount > 0 ? `+₹${item.amount}` : `-₹${Math.abs(item.amount)}`}
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>Account Details</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* TOP CARD SECTION */}
            <View style={[styles.topCard, { backgroundColor: theme.card }]}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={[styles.bankLabel, { color: theme.textTertiary }]}>{bankName}</Text>
                        <Text style={[styles.accNoText, { color: theme.textSecondary }]}>{accNo}</Text>
                    </View>
                    <Image source={require('../assets/Bank3d.png')} style={styles.tinyBankImage} />
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={[styles.balanceLabel, { color: theme.textTertiary }]}>Current Balance</Text>
                    <Text style={[styles.balanceAmount, { color: theme.text, fontFamily: FONTS.bold }]}>₹84,250.00</Text>
                </View>
            </View>

            {/* TRANSACTION LIST */}
            <View style={styles.listHeader}>
                <Text style={[styles.listTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Recent Transactions</Text>
                <TouchableOpacity>
                    <Text style={{ color: COLORS.primary, fontSize: 12 }}>View All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={BANK_TRANSACTIONS}
                keyExtractor={(item) => item.id}
                renderItem={renderTransaction}
                contentContainerStyle={styles.listContent}
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
        paddingBottom: 20
    },
    headerTitle: { fontSize: 18 },
    topCard: {
        margin: 20,
        padding: 25,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    bankLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    accNoText: { fontSize: 14, marginTop: 4 },
    tinyBankImage: { width: 50, height: 50 },
    balanceContainer: { marginTop: 10 },
    balanceLabel: { fontSize: 12, marginBottom: 5 },
    balanceAmount: { fontSize: 32 },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginTop: 10,
        marginBottom: 15
    },
    listTitle: { fontSize: 16 },
    listContent: { paddingHorizontal: 25 },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 0.5,
    },
    txIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    txTitle: { fontSize: 15, marginBottom: 2 },
    txDate: { fontSize: 12 },
    txAmount: { fontSize: 16 }
});