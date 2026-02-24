import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';

import { SmsParserService } from '../services/SmsParserService';
import { useDatabase } from '../context/DatabaseContext';
import { supabase } from '../lib/supabase';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

import { useToast } from '../hooks/useToast';

import Toast from '../components/Toast';
import BottomNavBar from '../components/BottomNavBar';
import MainSpendingCard from '../components/MainSpendingCard';
import StatSummaryRow from '../components/StatSummaryRow';
import TransactionItem from '../components/TransactionItem';
import EditTransactionModal from '../components/Edittransactionmodal';
import AddButton from '../components/AddButton';
import AddTransactionBottomSheet from '../components/AddTransactionBottomSheet';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, isDarkMode = true }) {
  const [transactions, setTransactions] = useState([]);
  const [recentTotal, setRecentTotal] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [smsText, setSmsText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showManualAddModal, setShowManualAddModal] = useState(false);

  const smsInputRef = useRef(null);
  const lottieRef = useRef(null);
  const theme = getThemedColors(isDarkMode);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { isInitialized, db } = useDatabase();

  const testConnection = async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase ready:', data.session ? 'Logged in' : 'Ready')
  }

  testConnection();

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  // --- Database Logic ---
  const fetchRecentTransactions = useCallback(async () => {
    if (isInitialized && db) {
      try {
        const allData = await db.getAllTransactions(100);
        const detectedAccounts = await db.getDetectedAccounts();
        setAccounts(detectedAccounts);

        const today = new Date().toISOString().split('T')[0];
        let todaySpent = 0;
        let totalIn = 0;
        let totalOut = 0;

        allData.forEach(t => {
          if (t.type === 'debit') {
            totalOut += t.amount;
            if (t.date === today) todaySpent += t.amount;
          } else {
            totalIn += t.amount;
          }
        });

        setTransactions(allData.slice(0, 5));
        setRecentTotal(todaySpent);
        setIncomeTotal(totalIn);
        setExpenseTotal(totalOut);

      } catch (error) {
        console.error("Fetch error:", error);
      }
    }
  }, [isInitialized, db]);

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions]);

  const handleSendToBackend = async () => {
    if (!smsText.trim()) {
      showError('Empty Message', 'Please enter SMS text to parse');
      return;
    }

    setIsSending(true);
    setShowAnimation(true);
    setTimeout(() => lottieRef.current?.play(), 100);

    const result = SmsParserService.parse(smsText);
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSending(false);
    setShowAnimation(false);

    if (result.success) {
      try {
        const saveResult = await db.saveTransaction(result.local);
        if (saveResult.success) {
          setParseResult(result);
          showSuccess('Saved!', `₹${result.local.amount} recorded`);
          await fetchRecentTransactions();
          setSmsText('');
        } else if (saveResult.reason === 'duplicate') {
          showError('Duplicate', 'This transaction already exists');
        }
      } catch (error) {
        showError('DB Error', 'Could not save to device');
      }
    } else {
      showError('Parsing Failed', 'Could not understand this SMS');
    }
  };


  const handleDeleteTransaction = async (id) => {
    try {
      await db.deleteTransaction(id);
      showSuccess('Deleted', 'Transaction removed');
      await fetchRecentTransactions();
    } catch (error) {
      showError('Delete Failed', 'Could not delete transaction');
    }
  };

  const handleAddOptionSelect = (option) => {
    setShowAddOptions(false);
    if (option === 'sms') {
      setTimeout(() => smsInputRef.current?.focus(), 300);
    } else if (option === 'manual') {
      setShowManualAddModal(true);
    }
  };

  const handleSaveManualTransaction = async (newTransaction) => {
    try {
      const timestamp = Date.now();
      const hashString = `MANUAL_${newTransaction.merchant}_${newTransaction.amount}_${newTransaction.date}_${timestamp}`;
      const hash = hashString.toLowerCase().replace(/\s+/g, '');

      const transactionToSave = {
        hash: hash,
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type || 'debit',
        date: newTransaction.date,
        merchant: newTransaction.merchant.trim(),
        category: newTransaction.category || 'Others',
        bank: newTransaction.bank_name?.trim() || 'Unknown',
        transactionMethod: 'Manual Entry',
        rawSms: 'MANUAL_ENTRY',
        senderName: null,
        accountNumber: null,
        accountNumberMasked: null,
        refNumber: null,
        timestamp: new Date().toISOString(),
      };

      const saveResult = await db.saveTransaction(transactionToSave);

      if (saveResult.success) {
        setShowManualAddModal(false);
        showSuccess('Added!', `₹${newTransaction.amount} transaction added`);
        await fetchRecentTransactions();
      } else if (saveResult.reason === 'duplicate') {
        showError('Duplicate', 'This transaction already exists');
      }
    } catch (error) {
      showError('Save Failed', 'Could not save transaction');
    }
  };

  const emptyTransaction = {
    id: null,
    amount: '',
    merchant: '',
    category: 'Others',
    date: new Date().toISOString(),
    bank_name: '',
    type: 'debit',
    notes: '',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>

          {/* Header */}
          <View style={styles.topBar}>
            <View style={styles.userInfo}>
              <View style={styles.avatarPlaceholder}>
                <Image source={{ uri: 'https://i.pravatar.cc/150?u=user1' }} style={styles.avatar} />
              </View>
              <View style={styles.brandInfo}>
                <Text style={[styles.brandText, { color: theme.text, fontFamily: FONTS.bold }]}>Pulse</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE DATA</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.card }]}>
              <Ionicons name="options-outline" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Wrapped Sections for Horizontal Padding */}
            <View style={styles.horizontalPadding}>
              {/* Input Card */}
              <View style={[styles.debugCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <TextInput
                  ref={smsInputRef}
                  style={[styles.input, { color: theme.text, fontFamily: FONTS.regular }]}
                  placeholder="Paste transaction SMS..."
                  placeholderTextColor={theme.textTertiary}
                  value={smsText}
                  onChangeText={setSmsText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendIcon, { backgroundColor: COLORS.primary }]}
                  onPress={handleSendToBackend}
                  disabled={isSending}
                >
                  <Ionicons name="flash" size={18} color="black" />
                </TouchableOpacity>
              </View>

              {/* Main Spending Card */}
              <MainSpendingCard
                amount={recentTotal}
                isDarkMode={isDarkMode}
                theme={theme}
              />

              {/* Small Stats Row */}
              <StatSummaryRow
                income={incomeTotal}
                expenses={expenseTotal}
                theme={theme}
              />

              {/* Recent Feed Header */}
              <View style={styles.feedHeader}>
                <Text style={[styles.feedTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                  Recent Activity
                </Text>
                <AddButton
                  onPress={() => setShowAddOptions(true)}
                  theme={theme}
                />
              </View>
            </View>

            {/* Transaction List - Edge to Edge */}
            <View style={styles.transactionList}>
              {transactions.length > 0 ? (
                transactions.map((item, index) => (
                  <TransactionItem
                    key={item.id}
                    item={item}
                    index={index}
                    isLast={index === transactions.length - 1}
                    theme={theme}
                    onPress={() => navigation.navigate('TransactionDetail', {
                      transaction: item,
                      onDelete: handleDeleteTransaction,
                      onUpdate: fetchRecentTransactions,
                    })}
                    onDelete={handleDeleteTransaction}
                    showSubtitle={true}
                    isDarkMode={isDarkMode}
                  />
                ))
              ) : (
                <Text style={{ color: theme.textTertiary, textAlign: 'center', marginVertical: 20 }}>
                  No records yet.
                </Text>
              )}
            </View>

            {/* Bottom Sections Wrapped in Padding again */}
            <View style={styles.horizontalPadding}>
              {transactions.length > 0 && (
                <TouchableOpacity style={styles.viewHistory} onPress={() => navigation.navigate('Transactions')}>
                  <Text style={[styles.historyText, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
                    View All History
                  </Text>
                </TouchableOpacity>
              )}

              {/* My Accounts Section Header */}
              {/* <View style={styles.sectionHeader}>
                <Text style={[styles.feedTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>My Accounts</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AccountsAll')}>
                  <Text style={{ color: COLORS.primary, fontSize: 12 }}>See All</Text>
                </TouchableOpacity>
              </View> */}
            </View>

            {/* Accounts Scroll - Edge to Edge Swiping */}
            {/* <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.accountScroll}
              snapToInterval={280 + 12}
              decelerationRate="fast"
            >
              {accounts.length > 0 ? accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  activeOpacity={0.9}
                  style={[styles.bankCard, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate('SpecificBankDetail', { filterBank: acc.name })}
                >
                  <View style={styles.cardLeft}>
                    <Text style={[styles.bankName, { color: theme.text, fontFamily: FONTS.bold }]}>
                      {acc.name}
                    </Text>
                    <Text style={[styles.accNo, { color: theme.textTertiary }]}>
                      {acc.accNo}
                    </Text>
                    <View style={styles.cardInfo}>
                      <Ionicons name="stats-chart" size={12} color={theme.textTertiary} />
                      <Text style={[styles.lastTrans, { color: theme.textSecondary }]}>
                        Last: <Text style={{ color: acc.type === 'debit' ? '#FF3B30' : '#34C759' }}>
                          ₹{acc.lastAmount}
                        </Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <Image
                      source={require('../assets/Bank3d.png')}
                      style={styles.bankImage3d}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              )) : (
                <View style={[styles.bankCard, { width: width - 48, justifyContent: 'center', marginLeft: 24 }]}>
                  <Text style={{ color: theme.textTertiary, textAlign: 'center' }}>No accounts detected yet</Text>
                </View>
              )}
            </ScrollView> */}

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <BottomNavBar active="Home" onNavigate={handleNavigate} isDarkMode={isDarkMode} />

      <Modal visible={showAnimation} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.animationContainer, { backgroundColor: theme.card }]}>
            <LottieView
              ref={lottieRef}
              source={require('../assets/lottie/money-transfer.json')}
              style={styles.lottie}
              loop
            />
            <Text style={[styles.animationText, { color: theme.text, fontFamily: FONTS.semiBold }]}>
              Syncing Pulse...
            </Text>
          </View>
        </View>
      </Modal>

      <AddTransactionBottomSheet
        visible={showAddOptions}
        theme={theme}
        onSmsPress={() => handleAddOptionSelect('sms')}
        onManualPress={() => handleAddOptionSelect('manual')}
        onClose={() => setShowAddOptions(false)}
      />

      <EditTransactionModal
        visible={showManualAddModal}
        transaction={emptyTransaction}
        theme={theme}
        db={db}
        onClose={() => setShowManualAddModal(false)}
        onSave={handleSaveManualTransaction}
      />

      {toast && <Toast {...toast} onHide={hideToast} isDarkMode={isDarkMode} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 30 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden', marginRight: 12 },
  avatar: { width: '100%', height: '100%' },
  brandInfo: { gap: 2 },
  brandText: { fontSize: 18 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  liveText: { fontSize: 10, color: COLORS.primary, letterSpacing: 1, fontWeight: '800' },
  filterBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // FIXED PADDING LOGIC
  scrollContent: { paddingHorizontal: 0, paddingTop: 10 },
  horizontalPadding: { paddingHorizontal: 24 },

  debugCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  input: { flex: 1, fontSize: 14, paddingRight: 10, minHeight: 40 },
  sendIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  feedTitle: { fontSize: 18 },
  transactionList: { marginBottom: 10 },
  viewHistory: { alignItems: 'center', marginTop: 10 },
  historyText: { fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  animationContainer: {
    width: 280,
    height: 280,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lottie: { width: 160, height: 160 },
  animationText: { fontSize: 16, marginTop: 10 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15
  },

  accountScroll: {
    paddingHorizontal: 24,
    gap: 12,
    paddingBottom: 10,
  },
  bankCard: {
    width: 280,
    height: 140,
    padding: 20,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: { flex: 1, justifyContent: 'center', gap: 4 },
  bankName: { fontSize: 17 },
  accNo: { fontSize: 12, letterSpacing: 0.5 },
  cardInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  lastTrans: { fontSize: 11, fontFamily: FONTS.medium },
  cardRight: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  bankImage3d: { width: 100, height: 100, position: 'absolute', right: -5 },
});