import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useIsFocused } from '@react-navigation/native';

import { SmsParserService } from '../services/SmsParserService';
import { useDatabase } from '../context/DatabaseContext';
import * as SecureStore from 'expo-secure-store';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import { useToast } from '../hooks/useToast';

import Toast from '../components/Toast';
import BottomNavBar from '../components/BottomNavBar';
import MainSpendingCard from '../components/MainSpendingCard';
import StatSummaryRow from '../components/StatSummaryRow';
import TransactionItem from '../components/TransactionItem';
import EditTransactionModal from '../components/Edittransactionmodal';
import AddButton from '../components/AddButton';
import AddTransactionBottomSheet from '../components/AddTransactionBottomSheet';
import SmsInputBottomSheet from '../components/SmsInputBottomsheet';
import NotificationService from '../services/NotificationService';
import SmsPermissionBanner from '../components/SmsPermissionBanner';

const { width } = Dimensions.get('window');
export default function HomeScreen({ navigation, isDarkMode = true }) {
  const [userName, setUserName] = useState('');
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [recentTotal, setRecentTotal] = useState(0);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showSmsSheet, setShowSmsSheet] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showSmsBanner, setShowSmsBanner] = useState(false);

  const lottieRef = useRef(null);
  const theme = getThemedColors(isDarkMode);
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { isInitialized, db } = useDatabase();
  const isFocused = useIsFocused();

  const handleNavigate = (screen) => navigation.navigate(screen);

  useEffect(() => {
    if (Platform.OS !== 'android' || !isFocused) return;
    const check = async () => {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
      if (!granted) setShowSmsBanner(true);
    };
    check();
  }, [isFocused]);

  useEffect(() => {
    const askNotifPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') await Notifications.requestPermissionsAsync();
    };
    askNotifPermission();
  }, []);

  useEffect(() => {
    const loadName = async () => {
      const savedName = await SecureStore.getItemAsync('pulse_user_name');
      if (savedName) setUserName(savedName.split(' ')[0]);
    };
    loadName();
  }, []);
  
  useEffect(() => {
    if (!isFocused) return;
    const checkNotifs = async () => {
      const history = await NotificationService.getHistory();
      setHasUnreadNotifs(history.some(n => !n.isRead));
    };
    checkNotifs();
  }, [isFocused]);

  const fetchRecentTransactions = useCallback(async () => {
    if (!isInitialized || !db) return;
    try {
      const allData = await db.getAllTransactions(100);
      const today = new Date().toISOString().split('T')[0];
      let todaySpent = 0, totalIn = 0, totalOut = 0;

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
      console.error('Fetch error:', error);
    }
  }, [isInitialized, db]);

  // Refresh on focus — catches saves from EditTransactionScreen
  useEffect(() => {
    if (isFocused) fetchRecentTransactions();
  }, [isFocused, fetchRecentTransactions]);

  const handleSmsSend = async (smsText) => {
    setIsSending(true);
    setShowAnimation(true);
    setTimeout(() => lottieRef.current?.play(), 100);

    const result = SmsParserService.parse(smsText);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSending(false);
    setShowAnimation(false);

    if (result.success) {
      try {
        const saveResult = await db.saveTransaction(result.local);
        if (saveResult.success) {
          showSuccess('Saved!', `₹${result.local.amount} recorded`);
          await fetchRecentTransactions();
          setShowSmsSheet(false);
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
      setTimeout(() => setShowSmsSheet(true), 300);
    } else if (option === 'manual') {
      // Small delay so AddTransactionBottomSheet closes cleanly first
      setTimeout(() => {
        navigation.navigate('EditTransaction', {
          transaction: null,
          onSave: fetchRecentTransactions,
        });
      }, 300);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>

          {/* Header */}
          <View style={styles.topBar}>
            <View style={styles.brandInfo}>
              <Text style={[styles.welcomeText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                Welcome,
              </Text>
              <Text style={[styles.userName, { color: theme.text, fontFamily: FONTS.bold }]}>
                {userName || 'User!'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('Notifications')}
            >
              {hasUnreadNotifs && <View style={styles.notifBadge} />}
              <Ionicons name="notifications-outline" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {showSmsBanner && (
              <SmsPermissionBanner
                theme={theme}
                db={db}
                onGranted={() => setShowSmsBanner(false)}
                onDismiss={() => setShowSmsBanner(false)}
              />
            )}

            <View style={styles.padded}>
              <MainSpendingCard amount={recentTotal} isDarkMode={isDarkMode} theme={theme} />
              <StatSummaryRow income={incomeTotal} expenses={expenseTotal} theme={theme} />

              <View style={styles.feedHeader}>
                <Text style={[styles.feedTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                  Recent Activity
                </Text>
                <AddButton onPress={() => setShowAddOptions(true)} theme={theme} />
              </View>
            </View>

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

            <View style={styles.padded}>
              {transactions.length > 0 && (
                <TouchableOpacity style={styles.viewHistory} onPress={() => navigation.navigate('Transactions')}>
                  <Text style={[styles.historyText, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
                    View All History
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <BottomNavBar active="Home" onNavigate={handleNavigate} isDarkMode={isDarkMode} />

      {/* SMS processing animation */}
      <Modal visible={showAnimation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.animationContainer, { backgroundColor: theme.card }]}>
            <LottieView
              ref={lottieRef}
              source={require('../assets/lottie/money-transfer.json')}
              style={styles.lottie}
              loop
            />
            <Text style={[styles.animationText, { color: theme.text, fontFamily: FONTS.semiBold }]}>
              Syncing Pace...
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

      <SmsInputBottomSheet
        visible={showSmsSheet}
        theme={theme}
        isSending={isSending}
        onClose={() => setShowSmsSheet(false)}
        onSend={handleSmsSend}
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
    paddingVertical: 12,
  },
  brandInfo: { gap: 2 },
  welcomeText: { fontSize: 13 },
  userName: { fontSize: 22 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    zIndex: 1,
  },
  scrollContent: { paddingTop: 10 },
  padded: { paddingHorizontal: 24 },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  feedTitle: { fontSize: 18 },
  transactionList: { marginBottom: 10 },
  viewHistory: { alignItems: 'center', marginTop: 10 },
  historyText: { fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    width: 280,
    height: 280,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: { width: 160, height: 160 },
  animationText: { fontSize: 16, marginTop: 10 },
});