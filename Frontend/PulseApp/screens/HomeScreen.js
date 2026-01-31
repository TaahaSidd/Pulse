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
import { LinearGradient } from 'expo-linear-gradient';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';
import BottomNavBar from '../components/BottomNavBar';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { SmsParserService } from '../services/SmsParserService';
import { useDatabase } from '../context/DatabaseContext';

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

  const lottieRef = useRef(null);
  const theme = getThemedColors(isDarkMode);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { isInitialized, db } = useDatabase();

  // --- Helpers ---
  const toTitleCase = (str) => {
    if (!str || str === 'Unknown') return 'Transaction';
    return str.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  // --- Database Logic ---
  const fetchRecentTransactions = useCallback(async () => {
    if (isInitialized && db) {
      try {
        const allData = await db.getAllTransactions(100);

        // 1. Set the recent feed (last 5)
        setTransactions(allData.slice(0, 5));

        // 2. Variables for Totals and Account Grouping
        const today = new Date().toISOString().split('T')[0];
        let todaySpent = 0;
        let totalIn = 0;
        let totalOut = 0;
        const accountMap = {};

        // SINGLE LOOP through all data
        allData.forEach(t => {
          // --- A. Calculation Logic ---
          if (t.type === 'debit') {
            totalOut += t.amount;
            if (t.date === today) todaySpent += t.amount;
          } else {
            totalIn += t.amount;
          }

          // --- B. Account Grouping Logic ---
          const bankName = t.bank || 'Other';
          if (!accountMap[bankName]) {
            accountMap[bankName] = {
              id: bankName,
              name: bankName,
              accNo: t.accountNumber ? `XX${t.accountNumber}` : 'Digital Wallet',
              lastAmount: t.amount,
              type: t.type
            };
          }
        });

        // 3. Update all states once
        setRecentTotal(todaySpent);
        setIncomeTotal(totalIn);
        setExpenseTotal(totalOut);
        setAccounts(Object.values(accountMap));

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
                <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE DATA</Text></View>
              </View>
            </View>
            <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.card }]}>
              <Ionicons name="options-outline" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Input Card */}
            <View style={[styles.debugCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.text, fontFamily: FONTS.regular }]}
                placeholder="Paste transaction SMS..."
                placeholderTextColor={theme.textTertiary}
                value={smsText}
                onChangeText={setSmsText}
                multiline
              />
              <TouchableOpacity style={[styles.sendIcon, { backgroundColor: COLORS.primary }]} onPress={handleSendToBackend} disabled={isSending}>
                <Ionicons name="flash" size={18} color="black" />
              </TouchableOpacity>
            </View>

            {/* Main Spending Card */}
            <LinearGradient
              colors={[isDarkMode ? '#242a32' : '#FFFFFF', isDarkMode ? COLORS.primary + '15' : COLORS.primaryLightest]}
              style={styles.mainStatsCard}
            >
              <Text style={[styles.statsLabel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>SPENT TODAY</Text>
              <View style={styles.amountRow}>
                <Text style={[styles.amountText, { color: theme.text, fontFamily: FONTS.bold }]}>₹{recentTotal.toLocaleString('en-IN')}</Text>
                <View style={styles.greenCircle} />
              </View>
            </LinearGradient>

            {/* Small Stats Row */}
            <View style={styles.smallStatsRow}>
              <View style={[styles.smallCard, { backgroundColor: theme.card }]}>
                <View style={[styles.smallIconBox, { backgroundColor: '#34C75920' }]}><Ionicons name="arrow-down" size={14} color="#34C759" /></View>
                <View>
                  <Text style={[styles.smallLabel, { color: theme.textTertiary }]}>MONEY IN</Text>
                  <Text style={[styles.smallAmount, { color: theme.text }]}>₹{incomeTotal.toLocaleString('en-IN')}</Text>
                </View>
              </View>

              <View style={[styles.smallCard, { backgroundColor: theme.card }]}>
                <View style={[styles.smallIconBox, { backgroundColor: '#FF3B3020' }]}><Ionicons name="arrow-up" size={14} color="#FF3B30" /></View>
                <View>
                  <Text style={[styles.smallLabel, { color: theme.textTertiary }]}>MONEY OUT</Text>
                  <Text style={[styles.smallAmount, { color: theme.text }]}>₹{expenseTotal.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </View>

            {/* Recent Feed */}
            <View style={styles.feedHeader}>
              <Text style={[styles.feedTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Recent Activity</Text>
            </View>

            <View style={styles.transactionList}>
              {transactions.length > 0 ? (
                transactions.map((item) => (
                  <TransactionItem
                    key={item.id}
                    title={toTitleCase(item.merchant)}
                    time={new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    amount={`${item.type === 'debit' ? '-' : '+'} ₹${item.amount.toLocaleString('en-IN')}`}
                    icon={item.type === 'debit' ? "cart-outline" : "cash-outline"}
                    iconBg={item.type === 'debit' ? "#FF9500" : "#34C759"}
                    theme={theme}
                  />
                ))
              ) : (
                <Text style={{ color: theme.textTertiary, textAlign: 'center', marginVertical: 20 }}>No records yet.</Text>
              )}
            </View>

            <TouchableOpacity style={styles.viewHistory} onPress={() => navigation.navigate('Transactions')}>
              <Text style={[styles.historyText, { color: COLORS.primary, fontFamily: FONTS.medium }]}>View All History</Text>
            </TouchableOpacity>


            {/* My Accounts Section */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.feedTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>My Accounts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AccountsAll')}>
                <Text style={{ color: COLORS.primary, fontSize: 12 }}>See All</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
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
                  {/* Left Content */}
                  <View style={styles.cardLeft}>
                    {/* <View style={styles.cardBadge}>
                      <View style={styles.liveDot} />
                      <Text style={[styles.liveText, { color: COLORS.primary }]}>ACTIVE</Text>
                    </View> */}

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

                  {/* Right Image Content */}
                  <View style={styles.cardRight}>
                    <Image
                      source={require('../assets/Bank3d.png')}
                      style={styles.bankImage3d}
                      resizeMode="contain"
                    />
                  </View>
                </TouchableOpacity>
              )) : (
                <View style={[styles.bankCard, { width: width - 48, justifyContent: 'center' }]}>
                  <Text style={{ color: theme.textTertiary, textAlign: 'center' }}>No accounts detected yet</Text>
                </View>
              )}
            </ScrollView>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <BottomNavBar active="Home" onNavigate={handleNavigate} isDarkMode={isDarkMode} />

      {/* Animation Modal */}
      <Modal visible={showAnimation} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.animationContainer, { backgroundColor: theme.card }]}>
            <LottieView ref={lottieRef} source={require('../assets/lottie/money-transfer.json')} style={styles.lottie} loop />
            <Text style={[styles.animationText, { color: theme.text, fontFamily: FONTS.semiBold }]}>Syncing Pulse...</Text>
          </View>
        </View>
      </Modal>

      {toast && <Toast {...toast} onHide={hideToast} isDarkMode={isDarkMode} />}
    </View>
  );
}

// Sub-components
const TransactionItem = ({ title, time, amount, icon, iconBg, theme }) => (
  <View style={[styles.itemContainer, { borderBottomColor: theme.border }]}>
    <View style={styles.itemLeft}>
      <View style={[styles.iconBox, { backgroundColor: iconBg + '20' }]}><Ionicons name={icon} size={20} color={iconBg} /></View>
      <View><Text style={[styles.itemTitle, { color: theme.text, fontFamily: FONTS.medium }]}>{title}</Text><Text style={[styles.itemTime, { color: theme.textTertiary }]}>{time}</Text></View>
    </View>
    <Text style={[styles.itemAmount, { color: amount.startsWith('+') ? '#34C759' : theme.text, fontFamily: FONTS.semiBold }]}>{amount}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 30 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden', marginRight: 12 },
  avatar: { width: '100%', height: '100%' },
  brandInfo: { gap: 2 },
  brandText: { fontSize: 18 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  liveText: { fontSize: 10, color: COLORS.primary, letterSpacing: 1, fontWeight: '800' },
  filterBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 10 },
  debugCard: { borderRadius: 18, borderWidth: 1, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, fontSize: 14, paddingRight: 10, minHeight: 40 },
  sendIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  mainStatsCard: { borderRadius: 28, padding: 24, marginBottom: 12 },
  statsLabel: { fontSize: 11, letterSpacing: 1 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  amountText: { fontSize: 38 },
  greenCircle: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginTop: 10 },
  smallStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  smallCard: { flex: 1, padding: 16, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallIconBox: { width: 30, height: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  smallLabel: { fontSize: 9, fontFamily: FONTS.bold, letterSpacing: 0.5 },
  smallAmount: { fontSize: 13, fontFamily: FONTS.bold, marginTop: 1 },
  feedHeader: { marginBottom: 16 },
  feedTitle: { fontSize: 18 },
  transactionList: { marginBottom: 10 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 15 },
  itemTime: { fontSize: 11, marginTop: 2 },
  itemAmount: { fontSize: 15 },
  viewHistory: { alignItems: 'center', marginTop: 10 },
  historyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
  animationContainer: { width: 280, height: 280, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
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
    paddingRight: 24,
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
    marginLeft: 10,
  },
  cardLeft: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    gap: 4,
  },
  bankName: {
    fontSize: 17,
  },
  accNo: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  lastTrans: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  cardRight: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankImage3d: {
    width: 100,
    height: 100,
    position: 'absolute',
    right: -5,
  },
});