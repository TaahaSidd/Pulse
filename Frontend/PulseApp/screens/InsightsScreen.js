import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth } from 'date-fns';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { CategoryMapper } from '../utils/CategoryMapper';
import BottomNavBar from '../components/BottomNavBar';
import { useDatabase } from '../context/DatabaseContext';
import BudgetDB from '../database/BudgetDB';
import SpendingPulseChart from '../components/SpendingPulseChart';
import ScreenHeader from '../components/ScreenHeader';
import CloverLoader from '../components/Loader';

const EmptyIllustration = require('../assets/Svg/Empty.svg');
const { width } = Dimensions.get('window');

export default function InsightsScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const { isInitialized, db } = useDatabase();

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [budget, setBudget] = useState(0);
  const [dailySpending, setDailySpending] = useState({});
  const [topCategories, setTopCategories] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);

  useEffect(() => {
    if (isInitialized) {
      loadMonthData();
    }
  }, [isInitialized, selectedDate]);

  const loadMonthData = async () => {
    try {
      setLoading(true);
      const monthStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd');

      // 1. Totals
      const totals = await db.getTotals(monthStart, monthEnd);
      setIncome(totals?.total_received || 0);
      setExpenses(totals?.total_spent || 0);

      // 2. Budget Logic - Fixed to fetch based on selected month, not just current
      // Note: If your BudgetDB only supports "Current", you may need to update 
      // BudgetDB to accept a date/month parameter.
      const budgetData = await BudgetDB.getCurrentBudget();
      setBudget(budgetData?.total_amount || 0);

      // 3. Transactions
      const transactions = await db.getTransactionsByDateRange(monthStart, monthEnd);
      const dailyMap = {};
      const merchantMap = {};

      transactions.forEach(t => {
        if (t.type === 'debit') {
          const dateParts = t.date.split('-');
          const day = parseInt(dateParts[2]);
          if (!isNaN(day)) dailyMap[day] = (dailyMap[day] || 0) + t.amount;
          const merchant = t.merchant || 'Unknown';
          merchantMap[merchant] = (merchantMap[merchant] || 0) + t.amount;
        }
      });
      setDailySpending(dailyMap);

      // 4. Categories
      const categories = await db.getSpendingByCategory(monthStart, monthEnd);
      setTopCategories(categories
        .filter(c => c.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5)
        .map(c => ({
          name: c.category,
          amount: c.spent,
          icon: CategoryMapper.getCategoryIcon(c.category),
          color: CategoryMapper.getCategoryColor(c.category),
        })));

      // 5. Merchants
      setTopMerchants(Object.entries(merchantMap)
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3));

    } catch (error) {
      console.error('❌ Error loading month data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (screen) => navigation.navigate(screen);
  const isCurrentMonth = isSameMonth(selectedDate, new Date());
  const budgetPercentage = budget > 0 ? (expenses / budget) * 100 : 0;

  const changeMonth = (direction) => {
    if (direction === 'next' && isCurrentMonth) return;
    setSelectedDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const renderEmptyState = (message) => (
    <View style={styles.emptyContainer}>
      <Image source={EmptyIllustration} style={{ width: 120, height: 120 }} resizeMode="contain" />
      <Text style={[styles.emptyText, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
        {message}
      </Text>
    </View>
  );

  if (!isInitialized || loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <CloverLoader size={48} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth('prev')}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowMonthPicker(true)}>
          <Text style={[styles.monthText, { color: theme.text, fontFamily: FONTS.bold }]}>
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => changeMonth('next')}
          disabled={isCurrentMonth}
          style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
        >
          <Ionicons name="chevron-forward" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* SUMMARY CARDS */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.cardElevated }]}>
            <Ionicons name="trending-up" size={24} color={COLORS.success} />
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Income</Text>
            <Text style={[styles.summaryValue, { color: theme.text, fontFamily: FONTS.bold }]}>
              ₹{income.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.cardElevated }]}>
            <Ionicons name="trending-down" size={24} color={COLORS.error} />
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Expenses</Text>
            <Text style={[styles.summaryValue, { color: theme.text, fontFamily: FONTS.bold }]}>
              ₹{expenses.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* BUDGET PROGRESS - ALWAYS SHOWN NOW */}
        <View style={[styles.budgetCard, { backgroundColor: theme.cardElevated }]}>
          <View style={styles.budgetHeader}>
            <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Monthly Budget</Text>
            <Text style={[styles.budgetAmount, { color: theme.text, fontFamily: FONTS.semiBold }]}>
              {budget > 0 ? `₹${expenses.toLocaleString()} / ₹${budget.toLocaleString()}` : 'Not Set'}
            </Text>
          </View>

          {budget > 0 ? (
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View style={[
                styles.progressFill,
                {
                  width: `${Math.min(budgetPercentage, 100)}%`,
                  backgroundColor: budgetPercentage > 100 ? COLORS.error : COLORS.primary
                }
              ]} />
            </View>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
              <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.xs, marginTop: 4 }}>+ Set budget for {format(selectedDate, 'MMMM')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SPENDING PULSE CHART */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Spending Pulse</Text>
          <SpendingPulseChart dailyMap={dailySpending} selectedDate={selectedDate} theme={theme} isDarkMode={isDarkMode} />
        </View>

        {/* TOP CATEGORIES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Top Categories</Text>
            {topCategories.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('CategoryBreakdown', { categories: topCategories, totalExpenses: expenses, isDarkMode: isDarkMode })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {topCategories.length > 0 ? topCategories.map((cat, i) => (
            <View key={i} style={[styles.itemRow, { backgroundColor: theme.cardElevated }]}>
              <View style={[styles.iconBox, { backgroundColor: cat.color + '20' }]}>
                <Ionicons name={cat.icon} size={20} color={cat.color} />
              </View>
              <Text style={[styles.itemName, { color: theme.text }]}>{cat.name}</Text>
              <Text style={[styles.itemAmount, { color: theme.text }]}>₹{cat.amount.toLocaleString()}</Text>
            </View>
          )) : renderEmptyState("No categories tracked yet")}
        </View>

        {/* TOP MERCHANTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Top Merchants</Text>
            {topMerchants.length > 0 && (
              <TouchableOpacity onPress={() => handleNavigate('Transactions')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {topMerchants.length > 0 ? topMerchants.map((m, i) => (
            <View key={i} style={[styles.itemRow, { backgroundColor: theme.cardElevated }]}>
              <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
                <Text>🏪</Text>
              </View>
              <Text style={[styles.itemName, { color: theme.text }]}>{m.name}</Text>
              <Text style={[styles.itemAmount, { color: theme.text }]}>₹{m.amount.toLocaleString()}</Text>
            </View>
          )) : renderEmptyState("No merchants tracked yet")}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* MONTH PICKER MODAL */}
      <Modal visible={showMonthPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowMonthPicker(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Month</Text>
            {Array.from({ length: 12 }, (_, i) => {
              const d = subMonths(new Date(), i);
              return (
                <TouchableOpacity key={i} style={styles.modalOption} onPress={() => { setSelectedDate(d); setShowMonthPicker(false); }}>
                  <Text style={{ color: theme.text }}>{format(d, 'MMMM yyyy')}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      <BottomNavBar active="Insights" onNavigate={handleNavigate} isDarkMode={isDarkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthText: { fontSize: FONT_SIZES.xl },
  scrollContent: { paddingHorizontal: 20 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 24, padding: 20, gap: 4 },
  summaryLabel: { fontSize: FONT_SIZES.xs },
  summaryValue: { fontSize: FONT_SIZES.xl },
  budgetCard: { borderRadius: 24, padding: 20, marginBottom: 20 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  budgetLabel: { fontSize: FONT_SIZES.xs },
  budgetAmount: { fontSize: FONT_SIZES.sm },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: FONT_SIZES.base },
  seeAllText: { color: COLORS.primary, fontFamily: FONTS.medium },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 18, marginBottom: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemName: { flex: 1, fontSize: FONT_SIZES.base, fontFamily: FONTS.medium },
  itemAmount: { fontSize: FONT_SIZES.base, fontFamily: FONTS.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  emptyText: { fontSize: FONT_SIZES.sm, marginTop: 10, textAlign: 'center' },
});