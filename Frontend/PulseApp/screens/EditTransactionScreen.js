import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity,
    ScrollView, TextInput, Platform, StatusBar,
    Animated, Pressable, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, setDate as setDay, setMonth, setYear } from 'date-fns';
import { COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import { CategoryMapper } from '../utils/CategoryMapper';
import { useDatabase } from '../context/DatabaseContext';
import { getThemedColors } from '../constants/Colors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);   // 1–12
const MINUTES = Array.from({ length: 60 }, (_, i) => i);     // 0–59
const PERIODS = ['AM', 'PM'];

const COMMON_BANKS = [
    'HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank',
    'Yes Bank', 'IDFC Bank', 'IndusInd Bank', 'Paytm', 'PhonePe',
    'Google Pay', 'Amazon Pay', 'CRED', 'Jupiter', 'Fi Money', 'Other'
];

// ── Inline Bottom Sheet ───────────────────────────────────────────────────────
const InlineSheet = ({ visible, onClose, title, theme, children }) => {
    const anim = useRef(new Animated.Value(300)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(anim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }),
                Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(anim, { toValue: 300, duration: 200, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View style={[styles.sheetOverlay, { opacity }]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
            </Animated.View>
            <Animated.View style={[
                styles.sheetContainer,
                { backgroundColor: theme.card, transform: [{ translateY: anim }] }
            ]}>
                <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
                <View style={[styles.sheetHeader, { borderBottomColor: theme.border + '40' }]}>
                    <Text style={[styles.sheetTitle, { color: theme.text, fontFamily: FONTS.bold }]}>{title}</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={12}>
                        <Ionicons name="close" size={22} color={theme.textTertiary} />
                    </TouchableOpacity>
                </View>
                {children}
            </Animated.View>
        </View>
    );
};

// ── Category Sheet ────────────────────────────────────────────────────────────
const CategorySheet = ({ visible, onClose, selected, onSelect, theme }) => (
    <InlineSheet visible={visible} onClose={onClose} title="Category" theme={theme}>
        <ScrollView contentContainerStyle={styles.catGrid} showsVerticalScrollIndicator={false}>
            {CategoryMapper.getAllCategories().map(cat => {
                const color = CategoryMapper.getCategoryColor(cat);
                const icon = CategoryMapper.getCategoryIcon(cat);
                const isSelected = selected === cat;
                return (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => { onSelect(cat); onClose(); }}
                        style={[styles.catItem, {
                            borderColor: isSelected ? color : 'transparent',
                            backgroundColor: isSelected ? color + '15' : theme.bg + '80'
                        }]}
                        activeOpacity={0.6}
                    >
                        <View style={[styles.catIconCircle, { backgroundColor: color + '20' }]}>
                            <Ionicons name={icon} size={22} color={color} />
                        </View>
                        <Text numberOfLines={1} style={[styles.catLabel, {
                            color: theme.text,
                            fontFamily: isSelected ? FONTS.bold : FONTS.medium
                        }]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    </InlineSheet>
);

// ── Bank Sheet ────────────────────────────────────────────────────────────────
const BankSheet = ({ visible, onClose, selected, onSelect, theme, userBanks }) => {
    const combined = [...new Set([...userBanks, ...COMMON_BANKS])];
    return (
        <InlineSheet visible={visible} onClose={onClose} title="Payment Method" theme={theme}>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                {userBanks.length > 0 && (
                    <Text style={[styles.bankSectionLabel, { color: theme.textTertiary }]}>YOUR BANKS</Text>
                )}
                {combined.map((bank, index) => {
                    const isFirst = index === userBanks.length && userBanks.length > 0;
                    return (
                        <React.Fragment key={bank}>
                            {isFirst && (
                                <Text style={[styles.bankSectionLabel, { color: theme.textTertiary, marginTop: 8 }]}>
                                    OTHER BANKS
                                </Text>
                            )}
                            <TouchableOpacity
                                onPress={() => { onSelect(bank); onClose(); }}
                                style={[styles.bankRow, { borderBottomColor: theme.border + '30' }]}
                                activeOpacity={0.6}
                            >
                                <View style={[styles.bankIcon, { backgroundColor: theme.border + '30' }]}>
                                    <Ionicons name="card-outline" size={16} color={theme.textTertiary} />
                                </View>
                                <Text style={[styles.bankName, { color: theme.text, fontFamily: FONTS.medium }]}>
                                    {bank}
                                </Text>
                                {selected === bank && (
                                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        </React.Fragment>
                    );
                })}
                <View style={{ height: 30 }} />
            </ScrollView>
        </InlineSheet>
    );
};

// ── Date Sheet ────────────────────────────────────────────────────────────────
const DateSheet = ({ visible, onClose, date, onDateChange, theme }) => (
    <InlineSheet visible={visible} onClose={onClose} title="Select Date" theme={theme}>
        <View style={styles.pickerRow}>
            <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                <Text style={[styles.pickerColLabel, { color: theme.textTertiary }]}>DAY</Text>
                {DAYS.map(d => {
                    const sel = date.getDate() === d;
                    return (
                        <TouchableOpacity key={d} onPress={() => onDateChange(setDay(date, d))} style={styles.pickerItem}>
                            <Text style={[styles.pickerItemText, {
                                color: sel ? COLORS.primary : theme.text,
                                fontFamily: sel ? FONTS.bold : FONTS.regular,
                                fontSize: sel ? 19 : 16,
                            }]}>{d}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <ScrollView style={[styles.pickerCol, { flex: 1.4 }]} showsVerticalScrollIndicator={false}>
                <Text style={[styles.pickerColLabel, { color: theme.textTertiary }]}>MONTH</Text>
                {MONTHS.map((m, i) => {
                    const sel = date.getMonth() === i;
                    return (
                        <TouchableOpacity key={m} onPress={() => onDateChange(setMonth(date, i))} style={styles.pickerItem}>
                            <Text style={[styles.pickerItemText, {
                                color: sel ? COLORS.primary : theme.text,
                                fontFamily: sel ? FONTS.bold : FONTS.regular,
                                fontSize: sel ? 19 : 16,
                            }]}>{m}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                <Text style={[styles.pickerColLabel, { color: theme.textTertiary }]}>YEAR</Text>
                {YEARS.map(y => {
                    const sel = date.getFullYear() === y;
                    return (
                        <TouchableOpacity key={y} onPress={() => onDateChange(setYear(date, y))} style={styles.pickerItem}>
                            <Text style={[styles.pickerItemText, {
                                color: sel ? COLORS.primary : theme.text,
                                fontFamily: sel ? FONTS.bold : FONTS.regular,
                                fontSize: sel ? 19 : 16,
                            }]}>{y}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
        <TouchableOpacity onPress={onClose} style={[styles.doneBtn, { backgroundColor: COLORS.primary }]}>
            <Text style={[styles.doneBtnText, { fontFamily: FONTS.bold }]}>Done</Text>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
    </InlineSheet>
);

// ── Time Sheet ────────────────────────────────────────────────────────────────
const TimeSheet = ({ visible, onClose, date, onDateChange, theme }) => {
    const hour12 = date.getHours() % 12 || 12;
    const minute = date.getMinutes();
    const period = date.getHours() >= 12 ? 'PM' : 'AM';

    const setHour = (h) => {
        const newDate = new Date(date);
        const isPM = period === 'PM';
        newDate.setHours(isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h));
        onDateChange(newDate);
    };

    const setMinute = (m) => {
        const newDate = new Date(date);
        newDate.setMinutes(m);
        onDateChange(newDate);
    };

    const setPeriod = (p) => {
        const newDate = new Date(date);
        const currentHour = newDate.getHours();
        if (p === 'AM' && currentHour >= 12) newDate.setHours(currentHour - 12);
        if (p === 'PM' && currentHour < 12) newDate.setHours(currentHour + 12);
        onDateChange(newDate);
    };

    return (
        <InlineSheet visible={visible} onClose={onClose} title="Select Time" theme={theme}>
            <View style={[styles.pickerRow, { height: 180 }]}>
                <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.pickerColLabel, { color: theme.textTertiary }]}>HR</Text>
                    {HOURS.map(h => {
                        const sel = hour12 === h;
                        return (
                            <TouchableOpacity key={h} onPress={() => setHour(h)} style={styles.pickerItem}>
                                <Text style={[styles.pickerItemText, {
                                    color: sel ? COLORS.primary : theme.text,
                                    fontFamily: sel ? FONTS.bold : FONTS.regular,
                                    fontSize: sel ? 19 : 16,
                                }]}>{String(h).padStart(2, '0')}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.pickerColLabel, { color: theme.textTertiary }]}>MIN</Text>
                    {MINUTES.map(m => {
                        const sel = minute === m;
                        return (
                            <TouchableOpacity key={m} onPress={() => setMinute(m)} style={styles.pickerItem}>
                                <Text style={[styles.pickerItemText, {
                                    color: sel ? COLORS.primary : theme.text,
                                    fontFamily: sel ? FONTS.bold : FONTS.regular,
                                    fontSize: sel ? 19 : 16,
                                }]}>{String(m).padStart(2, '0')}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
                <ScrollView style={styles.pickerCol} showsVerticalScrollIndicator={false}>
                    <Text style={[styles.pickerColLabel, { color: theme.textTertiary }]}>AM/PM</Text>
                    {PERIODS.map(p => {
                        const sel = period === p;
                        return (
                            <TouchableOpacity key={p} onPress={() => setPeriod(p)} style={styles.pickerItem}>
                                <Text style={[styles.pickerItemText, {
                                    color: sel ? COLORS.primary : theme.text,
                                    fontFamily: sel ? FONTS.bold : FONTS.regular,
                                    fontSize: sel ? 19 : 16,
                                }]}>{p}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.doneBtn, { backgroundColor: COLORS.primary }]}>
                <Text style={[styles.doneBtnText, { fontFamily: FONTS.bold }]}>Done</Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
        </InlineSheet>
    );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function EditTransactionScreen({ navigation, route, isDarkMode = true }) {
    const { transaction, onSave, onDelete } = route.params || {};
    const theme = getThemedColors(isDarkMode);
    const { db } = useDatabase();

    const isAddMode = !transaction?.id;

    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [category, setCategory] = useState('Others');
    const [date, setDate] = useState(new Date());
    const [bankName, setBankName] = useState('');
    const [transactionType, setTransactionType] = useState('debit');
    const [activePicker, setActivePicker] = useState(null);
    const [userBanks, setUserBanks] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (transaction) {
            setAmount(transaction.amount?.toString() || '');
            setMerchant(transaction.merchant || '');
            setCategory(transaction.category || 'Others');
            setBankName(transaction.bank_name || transaction.bank || '');
            setTransactionType(transaction.type || 'debit');
            setDate(transaction.date ? new Date(transaction.date) : new Date());
        }
    }, []);

    useEffect(() => {
        const fetchUserBanks = async () => {
            if (!db) return;
            try {
                const allTxns = await db.getAllTransactions();
                const banks = [...new Set(allTxns.map(t => t.bank).filter(Boolean))];
                setUserBanks(banks);
            } catch (e) {
                setUserBanks([]);
            }
        };
        fetchUserBanks();
    }, [db]);

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0 || !merchant.trim()) return;
        setIsSaving(true);

        const payload = {
            ...transaction,
            amount: parseFloat(amount),
            merchant: merchant.trim(),
            category,
            type: transactionType,
            date: format(date, 'yyyy-MM-dd HH:mm:ss'),
            bank_name: bankName.trim(),
        };

        try {
            if (isAddMode) {
                // New transaction
                const timestamp = Date.now();
                const hash = `MANUAL_${payload.merchant}_${payload.amount}_${payload.date}_${timestamp}`.toLowerCase().replace(/\s+/g, '');
                const toSave = {
                    hash,
                    amount: payload.amount,
                    type: payload.type,
                    date: payload.date,
                    merchant: payload.merchant,
                    category: payload.category,
                    bank: payload.bank_name || 'Unknown',
                    transactionMethod: 'Manual Entry',
                    rawSms: 'MANUAL_ENTRY',
                    senderName: null,
                    accountNumber: null,
                    accountNumberMasked: null,
                    refNumber: null,
                    timestamp: new Date().toISOString(),
                };
                const result = await db.saveTransaction(toSave);
                if (result.success) {
                    onSave && onSave();
                    navigation.goBack();
                }
            } else {
                // Edit existing
                await db.updateTransaction(transaction.id, payload);
                onSave && onSave();
                navigation.goBack();
            }
        } catch (e) {
            console.error('Save error:', e);
        } finally {
            setIsSaving(false);
        }
    };

    const categoryColor = CategoryMapper.getCategoryColor(category);
    const categoryIcon = CategoryMapper.getCategoryIcon(category);
    const closePicker = () => setActivePicker(null);

    return (
        <View style={[styles.screen, { backgroundColor: theme.bg }]}>
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.border + '30' }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Text style={{ color: COLORS.error, fontSize: 16, fontFamily: FONTS.medium }}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                        {isAddMode ? 'New Entry' : 'Edit Entry'}
                    </Text>
                    <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isSaving}>
                        <Text style={{ color: COLORS.primary, fontSize: 16, fontFamily: FONTS.bold, opacity: isSaving ? 0.5 : 1 }}>
                            {isSaving ? 'Saving...' : 'Done'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Amount Hero */}
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

                            {/* Type toggle */}
                            <View style={[styles.segmentContainer, { backgroundColor: theme.card }]}>
                                <TouchableOpacity
                                    onPress={() => setTransactionType('debit')}
                                    style={[styles.segmentBtn, transactionType === 'debit' && { backgroundColor: COLORS.error + '20' }]}
                                >
                                    <Text style={[styles.segmentText, {
                                        color: transactionType === 'debit' ? COLORS.error : theme.textTertiary,
                                        fontFamily: FONTS.bold
                                    }]}>Expense</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setTransactionType('credit')}
                                    style={[styles.segmentBtn, transactionType === 'credit' && { backgroundColor: COLORS.primary + '20' }]}
                                >
                                    <Text style={[styles.segmentText, {
                                        color: transactionType === 'credit' ? COLORS.primary : theme.textTertiary,
                                        fontFamily: FONTS.bold
                                    }]}>Income</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Details */}
                        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>DETAILS</Text>
                        <View style={[styles.formGroup, { backgroundColor: theme.card, borderColor: theme.border + '40' }]}>
                            {/* Merchant */}
                            <View style={styles.inputWrapper}>
                                <Ionicons name="storefront-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                                <TextInput
                                    value={merchant}
                                    onChangeText={setMerchant}
                                    placeholder="Where did you spend?"
                                    placeholderTextColor={theme.textTertiary + '60'}
                                    style={[styles.fieldInput, { color: theme.text, fontFamily: FONTS.medium }]}
                                />
                            </View>
                            <View style={[styles.divider, { backgroundColor: theme.border + '40' }]} />

                            {/* Category */}
                            <TouchableOpacity
                                style={styles.inputWrapper}
                                onPress={() => setActivePicker('category')}
                                activeOpacity={0.6}
                            >
                                <View style={[styles.catPreview, { backgroundColor: categoryColor + '15' }]}>
                                    <Ionicons name={categoryIcon} size={16} color={categoryColor} />
                                </View>
                                <Text style={[styles.fieldInput, { color: theme.text, fontFamily: FONTS.medium, fontSize: 14 }]}>
                                    {category}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary + '60'} />
                            </TouchableOpacity>
                            <View style={[styles.divider, { backgroundColor: theme.border + '40' }]} />

                            {/* Bank */}
                            <TouchableOpacity
                                style={styles.inputWrapper}
                                onPress={() => setActivePicker('bank')}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="wallet-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                                <Text style={[styles.fieldInput, {
                                    color: bankName ? theme.text : theme.textTertiary + '60',
                                    fontFamily: FONTS.medium,
                                    fontSize: 14
                                }]}>
                                    {bankName || 'Payment Method'}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary + '60'} />
                            </TouchableOpacity>
                        </View>

                        {/* Date & Time */}
                        <Text style={[styles.sectionLabel, { color: theme.textTertiary, marginTop: 24 }]}>DATE & TIME</Text>
                        <View style={[styles.formGroup, { backgroundColor: theme.card, borderColor: theme.border + '40' }]}>
                            <TouchableOpacity
                                style={styles.inputWrapper}
                                onPress={() => setActivePicker('date')}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="calendar-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                                <Text style={[styles.fieldInput, { color: theme.text, fontFamily: FONTS.medium, fontSize: 14 }]}>
                                    {format(date, 'EEE, dd MMM yyyy')}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary + '60'} />
                            </TouchableOpacity>
                            <View style={[styles.divider, { backgroundColor: theme.border + '40' }]} />
                            <TouchableOpacity
                                style={styles.inputWrapper}
                                onPress={() => setActivePicker('time')}
                                activeOpacity={0.6}
                            >
                                <Ionicons name="time-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                                <Text style={[styles.fieldInput, { color: theme.text, fontFamily: FONTS.medium, fontSize: 14 }]}>
                                    {format(date, 'hh:mm a')}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary + '60'} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ height: 120 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Inline sheets — rendered inside the screen, no nested Modals */}
            <CategorySheet
                visible={activePicker === 'category'}
                onClose={closePicker}
                selected={category}
                onSelect={setCategory}
                theme={theme}
            />
            <BankSheet
                visible={activePicker === 'bank'}
                onClose={closePicker}
                selected={bankName}
                onSelect={setBankName}
                theme={theme}
                userBanks={userBanks}
            />
            <DateSheet
                visible={activePicker === 'date'}
                onClose={closePicker}
                date={date}
                onDateChange={setDate}
                theme={theme}
            />
            <TimeSheet
                visible={activePicker === 'time'}
                onClose={closePicker}
                date={date}
                onDateChange={setDate}
                theme={theme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 0.5,
    },
    headerTitle: { fontSize: 17 },
    headerBtn: { minWidth: 70, alignItems: 'center' },
    scrollContent: { padding: 20 },

    // Amount
    amountHero: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
    amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    currency: { fontSize: 32, marginRight: 4, marginTop: 6 },
    heroInput: { fontSize: 58, minWidth: 150, textAlign: 'center', letterSpacing: -2 },

    // Segment
    segmentContainer: { flexDirection: 'row', alignSelf: 'center', borderRadius: 14, padding: 4, marginTop: 20 },
    segmentBtn: { paddingVertical: 9, paddingHorizontal: 28, borderRadius: 10, alignItems: 'center' },
    segmentText: { fontSize: 13 },

    // Form
    sectionLabel: { fontSize: 11, fontFamily: FONTS.bold, letterSpacing: 1, marginLeft: 4, marginBottom: 8 },
    formGroup: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    inputIcon: { marginRight: 12 },
    fieldInput: { flex: 1, fontSize: 15 },
    divider: { height: 0.5, marginLeft: 46 },
    catPreview: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },

    // Sheet
    sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    sheetContainer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        maxHeight: '82%',
    },
    sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 0.5,
    },
    sheetTitle: { fontSize: 17 },

    // Category grid
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 16, paddingBottom: 40 },
    catItem: { width: '31%', aspectRatio: 1, borderRadius: 16, padding: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 1.5 },
    catIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
    catLabel: { fontSize: 11, textAlign: 'center' },

    // Bank list
    bankSectionLabel: { fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
    bankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 0.5 },
    bankIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    bankName: { flex: 1, fontSize: 15 },

    // Date picker
    pickerRow: { flexDirection: 'row', height: 210, paddingHorizontal: 8, paddingTop: 8 },
    pickerCol: { flex: 1 },
    pickerColLabel: { fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 1, textAlign: 'center', marginBottom: 6 },
    pickerItem: { paddingVertical: 10, alignItems: 'center' },
    pickerItemText: { textAlign: 'center' },
    pickerSectionLabel: { fontSize: 10, fontFamily: FONTS.bold, letterSpacing: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 2, color: '#999' },
    sheetDivider: { height: 0.5, marginHorizontal: 16, marginVertical: 8 },
    doneBtn: { marginHorizontal: 20, marginTop: 16, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    doneBtnText: { color: '#fff', fontSize: 16 },
});