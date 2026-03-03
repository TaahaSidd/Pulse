import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, Modal, TouchableOpacity,
    ScrollView, TextInput, Platform, KeyboardAvoidingView, Image, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, setHours, setMinutes, setDate as setDay, setMonth, setYear } from 'date-fns';
import { COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { getBankLogo } from '../constants/BankLogos';
import { CategoryMapper } from '../utils/CategoryMapper';

import { SelectionModal } from './SelectionModal';
import { ScrollDateTimePicker } from './ScrollDateTimePicker';

export default function EditTransactionModal({ visible, transaction, theme, db, onClose, onSave }) {
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [bankName, setBankName] = useState('');
    const [transactionType, setTransactionType] = useState('debit');

    const [activePicker, setActivePicker] = useState(null);
    const [availableBanks, setAvailableBanks] = useState([]);

    const isAddMode = !transaction?.id;

    useEffect(() => {
        if (transaction) {
            setAmount(transaction.amount?.toString() || '');
            setMerchant(transaction.merchant || '');
            setCategory(transaction.category || 'Others');
            setBankName(transaction.bank_name || transaction.bank || '');
            setTransactionType(transaction.type || 'debit');
            const d = transaction.date ? new Date(transaction.date) : new Date();
            setDate(d);
            setTime(d);
        }
    }, [transaction]);

    useEffect(() => {
        const fetchBanks = async () => {
            if (visible && db) {
                try {
                    const commonBanks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Paytm', 'PhonePe', 'Google Pay', 'Other'];
                    const allTxns = await db.getAllTransactions();
                    const dbBanks = allTxns.map(t => t.bank_name || t.bank).filter(Boolean);
                    const combined = [...commonBanks, ...dbBanks];
                    const uniqueMap = new Map();
                    combined.forEach(name => {
                        const logo = getBankLogo(name);
                        const key = logo ? logo : name.trim().toUpperCase();
                        if (!uniqueMap.has(key)) uniqueMap.set(key, name);
                    });
                    setAvailableBanks(Array.from(uniqueMap.values()).sort());
                } catch (e) {
                    setAvailableBanks(['HDFC Bank', 'ICICI Bank', 'SBI', 'Other'].sort());
                }
            }
        };
        fetchBanks();
    }, [visible, db]);

    const handleSave = () => {
        if (!amount || parseFloat(amount) <= 0 || !merchant.trim()) return;
        const finalDate = setMinutes(setHours(date, time.getHours()), time.getMinutes());
        const payload = {
            ...transaction,
            amount: parseFloat(amount),
            merchant: merchant.trim(),
            category,
            type: transactionType,
            date: format(finalDate, 'yyyy-MM-dd HH:mm:ss'),
            bank_name: bankName.trim(),
        };
        console.log('🟡 handleSave payload:', JSON.stringify(payload)); // <-- ADD
        onSave(payload);
    };

    if (!transaction) return null;

    const categoryColor = CategoryMapper.getCategoryColor(category);
    const categoryIcon = CategoryMapper.getCategoryIcon(category);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: theme.bg }]}
            >
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.border + '20' }]}>
                    <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                        <Text style={{ color: COLORS.error, fontSize: 16, fontFamily: FONTS.medium }}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {isAddMode ? 'New Entry' : 'Edit Entry'}
                    </Text>
                    <TouchableOpacity onPress={handleSave} style={styles.headerBtn}>
                        <Text style={{ color: COLORS.primary, fontSize: 16, fontFamily: FONTS.bold }}>Done</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Amount Input Section */}
                    <View style={styles.amountHero}>
                        <View style={styles.amountRow}>
                            <Text style={[styles.currency, { color: theme.textTertiary, fontFamily: FONTS.bold }]}>₹</Text>
                            <TextInput
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                placeholder="0"
                                autoFocus={isAddMode}
                                placeholderTextColor={theme.textTertiary + '40'}
                                style={[styles.heroInput, { color: theme.text, fontFamily: FONTS.bold }]}
                            />
                        </View>

                        {/* Compact Type Toggle */}
                        <View style={[styles.segmentContainer, { backgroundColor: theme.cardElevated || theme.border + '20' }]}>
                            <TouchableOpacity
                                onPress={() => setTransactionType('debit')}
                                style={[styles.segmentBtn, transactionType === 'debit' && { backgroundColor: COLORS.error + '20' }]}
                            >
                                <Text style={[styles.segmentText, { color: transactionType === 'debit' ? COLORS.error : theme.textTertiary, fontFamily: FONTS.bold }]}>Expense</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setTransactionType('credit')}
                                style={[styles.segmentBtn, transactionType === 'credit' && { backgroundColor: COLORS.primary + '20' }]}
                            >
                                <Text style={[styles.segmentText, { color: transactionType === 'credit' ? COLORS.primary : theme.textTertiary, fontFamily: FONTS.bold }]}>Income</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>DETAILS</Text>
                    <View style={[styles.formGroup, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <InputField icon="storefront-outline" value={merchant} onChangeText={setMerchant} placeholder="Where did you spend?" theme={theme} />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <PickerTrigger
                            label={category}
                            onPress={() => setActivePicker('category')}
                            theme={theme}
                            leftElement={
                                <View style={[styles.catPreview, { backgroundColor: categoryColor + '15' }]}>
                                    <Ionicons name={categoryIcon} size={16} color={categoryColor} />
                                </View>
                            }
                        />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        <PickerTrigger icon="wallet-outline" label={bankName || 'Payment Method'} onPress={() => setActivePicker('bank')} theme={theme} />
                    </View>

                    <Text style={[styles.sectionLabel, { color: theme.textTertiary, marginTop: 24 }]}>DATE & TIME</Text>
                    <View style={[styles.formGroup, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <PickerTrigger icon="calendar-outline" label={format(date, 'EEEE, dd MMM yyyy')} onPress={() => setActivePicker('date')} theme={theme} />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <PickerTrigger icon="time-outline" label={format(time, 'hh:mm a')} onPress={() => setActivePicker('time')} theme={theme} />
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Modals remain structurally similar but would benefit from similar style updates */}
                <SelectionModal visible={activePicker === 'category'} title="Category" theme={theme} onClose={() => setActivePicker(null)}>
                    <ScrollView contentContainerStyle={styles.categoryGrid} showsVerticalScrollIndicator={false}>
                        {CategoryMapper.getAllCategories().map(cat => (
                            <CategoryItem key={cat} cat={cat} theme={theme} isSelected={category === cat} onPress={() => { setCategory(cat); setActivePicker(null); }} />
                        ))}
                    </ScrollView>
                </SelectionModal>

                <SelectionModal visible={activePicker === 'bank'} title="Select Method" theme={theme} onClose={() => setActivePicker(null)}>
                    <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                        {availableBanks.map(bank => (
                            <BankItem key={bank} bank={bank} theme={theme} isSelected={bankName === bank} onPress={() => { setBankName(bank); setActivePicker(null); }} />
                        ))}
                    </ScrollView>
                </SelectionModal>

                {/* Pickers for Date/Time using the same logic as before */}
                <ScrollDateTimePicker
                    visible={activePicker === 'date'} title="Date" theme={theme} onClose={() => setActivePicker(null)}
                    columns={[
                        { data: Array.from({ length: 31 }, (_, i) => i + 1), selectedValue: date.getDate(), onSelect: (d) => setDate(setDay(date, d)) },
                        { data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], selectedValue: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()], onSelect: (_, i) => setDate(setMonth(date, i)) },
                        { data: Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i), selectedValue: date.getFullYear(), onSelect: (y) => setDate(setYear(date, y)) }
                    ]}
                />


            </KeyboardAvoidingView>
        </Modal>
    );
}

const InputField = ({ icon, value, onChangeText, placeholder, theme }) => (
    <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={20} color={theme.textTertiary} style={styles.inputIcon} />
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.textTertiary + '70'}
            style={[styles.fieldInput, { color: theme.text, fontFamily: FONTS.medium }]}
        />
    </View>
);

const PickerTrigger = ({ icon, leftElement, label, onPress, theme, containerStyle }) => (
    <TouchableOpacity
        style={[styles.inputWrapper, containerStyle]}
        onPress={onPress}
        activeOpacity={0.6}
    >
        {icon ? <Ionicons name={icon} size={18} color={theme.textTertiary} style={styles.inputIcon} /> : leftElement}
        <Text
            numberOfLines={1}
            style={[styles.fieldInput, { color: theme.text, fontFamily: FONTS.medium, fontSize: 14 }]}
        >
            {label}
        </Text>
        <Ionicons name="chevron-down" size={14} color={theme.textTertiary + '50'} />
    </TouchableOpacity>
);

const BankItem = ({ bank, theme, isSelected, onPress }) => {
    const logoAsset = getBankLogo(bank);
    return (
        <TouchableOpacity onPress={onPress} style={[styles.bankOption, { borderBottomColor: theme.border + '15' }]} activeOpacity={0.7}>
            <View style={[styles.bankIconCircle, !logoAsset && { backgroundColor: theme.textTertiary + '10' }]}>
                {logoAsset ? <Image source={logoAsset} style={styles.bankLogoImage} resizeMode="contain" /> : <Ionicons name="card-outline" size={20} color={theme.textTertiary} />}
            </View>
            <Text style={[styles.bankName, { color: theme.text, fontFamily: FONTS.medium, flex: 1, marginLeft: 12 }]}>{bank}</Text>
            {isSelected && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
        </TouchableOpacity>
    );
};

const CategoryItem = ({ cat, theme, isSelected, onPress }) => {
    const color = CategoryMapper.getCategoryColor(cat);
    return (
        <TouchableOpacity onPress={onPress} style={[styles.catItem, isSelected && { backgroundColor: color + '10', borderColor: color }]}>
            <View style={[styles.catIconCircle, { backgroundColor: color + '15' }]}>
                <Ionicons name={CategoryMapper.getCategoryIcon(cat)} size={22} color={color} />
            </View>
            <Text numberOfLines={1} style={[styles.catLabel, { color: theme.text, fontFamily: isSelected ? FONTS.bold : FONTS.medium }]}>{cat}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
        borderBottomWidth: 0.5,
    },
    headerTitle: { fontSize: 17 },
    headerBtn: { minWidth: 60, alignItems: 'center' },
    scrollContent: { padding: 20 },

    // Hero Section
    amountHero: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    currency: { fontSize: 32, marginRight: 4, marginTop: 4 },
    heroInput: { fontSize: 56, minWidth: 150, textAlign: 'center', letterSpacing: -1 },

    // Segmented Toggle
    segmentContainer: {
        flexDirection: 'row',
        width: '60%',
        borderRadius: 12,
        padding: 4,
        marginTop: 20,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    segmentText: { fontSize: 13 },

    // Form
    sectionLabel: { fontSize: 11, fontFamily: FONTS.bold, letterSpacing: 1, marginLeft: 5, marginBottom: 8 },
    formGroup: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    inputIcon: { marginRight: 12 },
    fieldInput: { flex: 1, fontSize: 15 },
    divider: { height: 1, marginLeft: 46 },
    catPreview: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 40 },
    catItem: { width: '31%', aspectRatio: 1, borderRadius: 16, padding: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'transparent' },
    catIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    catLabel: { fontSize: 11 },
    bankOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5 },
    bankIconCircle: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    bankLogoImage: { width: '100%', height: '100%' },
});