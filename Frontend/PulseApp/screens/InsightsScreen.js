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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth } from 'date-fns';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { useDatabase } from '../context/DatabaseContext';
import BudgetDB from '../database/BudgetDB';

import { CategoryMapper } from '../utils/CategoryMapper';
import { MerchantMapper } from '../utils/MerchantMapper';

import BottomNavBar from '../components/BottomNavBar';
import SpendingPulseChart from '../components/SpendingPulseChart';
import TransactionItem from '../components/TransactionItem';
import ScreenHeader from '../components/ScreenHeader';
import CloverLoader from '../components/Loader';
import StatSummaryRow from '../components/StatSummaryRow';
import MonthYearPicker from '../components/MonthYearPicker';
import BudgetSummaryCard from '../components/BudgetSummaryCard';
import { TopThreeRanking } from '../components/PodiumItem';

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
  const [minDate, setMinDate] = useState(null);
  const [activeMonths, setActiveMonths] = useState([]);

  const generateMerchantColor = (index, merchantName) => {
    // 1. Try to get brand color from MerchantMapper
    const merchantDetails = MerchantMapper.getMerchantDetails(merchantName);
    if (merchantDetails?.color) {
      return merchantDetails.color; // ✅ Use official brand color
    }

    // 2. Fallback to color palette for unknown merchants
    const fallbackColors = [
      '#3DDC84', // Green
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#FFD93D', // Yellow
      '#A78BFA', // Purple
      '#FB923C', // Orange
      '#60A5FA', // Blue
      '#F472B6', // Pink
      '#34D399', // Emerald
      '#FBBF24',
      '#818CF8',
      '#F87171',
    ];

    return fallbackColors[index % fallbackColors.length];
  }; const [topMerchants, setTopMerchants] = useState([]);


  const generateMerchantIcon = (merchantName) => {
    const merchantDetails = MerchantMapper.getMerchantDetails(merchantName);
    return merchantDetails?.icon || 'business-outline';
  };

  useEffect(() => {
    if (isInitialized) {
      loadMonthData();
    }
  }, [isInitialized, selectedDate]);

  useEffect(() => {
    if (!isInitialized || !db) return;
    const fetchMeta = async () => {
      // Earliest transaction date
      const result = await db.getFirstAsync(
        `SELECT MIN(date) as earliest FROM transactions`
      );
      if (result?.earliest) setMinDate(new Date(result.earliest));

      // All months that have at least one debit transaction
      const rows = await db.getAllAsync(
        `SELECT DISTINCT strftime('%Y-%m', date) as month 
             FROM transactions 
             WHERE type = 'debit'
             ORDER BY month`
      );
      setActiveMonths(rows.map(r => r.month));
    };
    fetchMeta();
  }, [isInitialized]);

  const loadMonthData = async () => {
    try {
      setLoading(true);
      const monthStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd');

      // 1. Get Totals
      const totals = await db.getTotals(monthStart, monthEnd);
      setIncome(totals?.total_received || 0);
      setExpenses(totals?.total_spent || 0);

      // 2. Get Budget — use month name + year to match BudgetDB schema
      const monthName = format(selectedDate, 'MMMM');
      const year = selectedDate.getFullYear();
      const budgetData = await BudgetDB.getBudget(monthName, year);
      setBudget(budgetData?.total_amount || 0);

      // 3. Process Transactions for Pulse & Merchants
      const transactions = await db.getTransactionsByDateRange(monthStart, monthEnd);
      const dailyMap = {};
      const merchantMap = {};

      transactions.forEach(t => {
        if (t.type === 'debit') {
          const dateParts = t.date.split('-');
          const day = parseInt(dateParts[2]);
          if (!isNaN(day)) dailyMap[day] = (dailyMap[day] || 0) + t.amount;

          const mName = t.merchant || 'Unknown';
          if (!merchantMap[mName]) {
            merchantMap[mName] = {
              name: mName,
              amount: 0,
              count: 0,
              lastDate: t.date,
              transactions: []
            };
          }
          merchantMap[mName].amount += t.amount;
          merchantMap[mName].count += 1;
          merchantMap[mName].transactions.push(t);

          if (new Date(t.date) > new Date(merchantMap[mName].lastDate)) {
            merchantMap[mName].lastDate = t.date;
          }
        }
      });
      setDailySpending(dailyMap);

      // 4. Set Top Merchants (Sorted by Amount)
      const sortedMerchants = Object.values(merchantMap)
        .sort((a, b) => {
          if (b.count !== a.count) return b.count - a.count;
          return b.amount - a.amount;
        });
      setTopMerchants(sortedMerchants);

      // 5. Get Category Breakdown
      const categories = await db.getSpendingByCategory(monthStart, monthEnd);

      const categoryTransactions = {};
      transactions.forEach(t => {
        if (t.type === 'debit') {
          const cat = t.category || 'Other';
          if (!categoryTransactions[cat]) categoryTransactions[cat] = [];
          categoryTransactions[cat].push(t);
        }
      });

      setTopCategories(categories
        .filter(c => c.spent > 0)
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5)
        .map(c => ({
          name: c.category,
          amount: c.spent,
          icon: CategoryMapper.getCategoryIcon(c.category),
          color: CategoryMapper.getCategoryColor(c.category),
          transactions: categoryTransactions[c.category] || [],
          count: (categoryTransactions[c.category] || []).length,
          lastDate: (categoryTransactions[c.category] || []).at(-1)?.date || null,
        })));

    } catch (error) {
      console.error('❌ Error loading month data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (screen) => navigation.navigate(screen);
  const isCurrentMonth = isSameMonth(selectedDate, new Date());


  const renderEmptyState = (message) => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
        {message}
      </Text>
    </View>
  );

  if (!isInitialized || loading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.loaderContainer}>
          <CloverLoader size={48} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      <ScreenHeader
        mode="month"
        theme={theme}
        selectedDate={selectedDate}
        isNextDisabled={isCurrentMonth}
        onOpenMonthPicker={() => setShowMonthPicker(true)}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* WRAPPER FOR PADDED ELEMENTS */}
        <View style={styles.paddedContent}>
          <StatSummaryRow
            income={income}
            expenses={expenses}
            theme={theme}
          />

          <BudgetSummaryCard
            theme={theme}
            budget={budget}
            expenses={expenses}
            isPastMonth={!isCurrentMonth}
            onPressSetBudget={() => navigation.navigate('BudgetSetting')}
            onPressCard={isCurrentMonth
              ? () => navigation.navigate('BudgetOverview')
              : null
            } />

          {/* <View style={[styles.budgetCard, { backgroundColor: theme.cardElevated }]}>
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
              <TouchableOpacity onPress={() => navigation.navigate('BudgetSetting')}>
                <Text style={{ color: COLORS.primary, fontSize: FONT_SIZES.xs, marginTop: 4 }}>+ Set budget for {format(selectedDate, 'MMMM')}</Text>
              </TouchableOpacity>
            )}
          </View> */}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Spending Pulse</Text>
            <SpendingPulseChart dailyMap={dailySpending} selectedDate={selectedDate} theme={theme} isDarkMode={isDarkMode} />
          </View>
        </View>

        {/* TOP CATEGORIES */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Top Categories</Text>
            {topCategories.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('CategoryBreakdown', { categories: topCategories, totalExpenses: expenses, isDarkMode: isDarkMode })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {topCategories.length >= 3 ? (
            <TopThreeRanking
              data={topCategories}
              theme={theme}
              onSelect={(item) => navigation.navigate('MerchantDetail', { data: item, type: 'category', isDarkMode: isDarkMode })}
            />
          ) : topCategories.length > 0 ? (
            topCategories.map((cat, i) => (
              <TransactionItem
                key={`cat-${i}`}
                index={i}
                isLast={i === topCategories.length - 1}
                theme={theme}
                item={{ merchant: cat.name, category: cat.name, amount: cat.amount, type: 'debit' }}
                onPress={() => navigation.navigate('MerchantDetail', { data: cat, type: 'category', isDarkMode: isDarkMode })}
              />
            ))
          ) : (
            <View style={{ paddingHorizontal: 20 }}>{renderEmptyState("No categories tracked yet")}</View>
          )}
        </View>

        {/* TOP MERCHANTS */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Top Merchants</Text>
            {topMerchants.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('CategoryBreakdown', {
                categories: topMerchants.map((m, index) => ({
                  ...m,
                  icon: generateMerchantIcon(m.name),
                  color: generateMerchantColor(index, m.name)
                })),
                type: 'merchant',
                totalExpenses: expenses,
                isDarkMode: isDarkMode,
                title: 'Merchant Split'
              })}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {topMerchants.length >= 3 ? (
            <TopThreeRanking
              data={topMerchants.slice(0, 3).map((m, index) => ({
                ...m,
                icon: generateMerchantIcon(m.name),
                color: generateMerchantColor(index, m.name) // Real Brand Color
              }))}
              theme={theme}
              onSelect={(m) => navigation.navigate('MerchantDetail', { data: m, type: 'merchant', isDarkMode: isDarkMode })}
            />
          ) : topMerchants.length > 0 ? (
            topMerchants.map((m, i) => (
              <TransactionItem
                key={`merch-${i}`}
                index={i}
                isLast={i === topMerchants.length - 1}
                theme={theme}
                item={{ merchant: m.name, category: `${m.count} visits`, amount: m.amount, type: 'debit' }}
                onPress={() => navigation.navigate('MerchantDetail', { data: m, type: 'merchant', isDarkMode: isDarkMode })}
              />
            ))
          ) : (
            <View style={{ paddingHorizontal: 20 }}>{renderEmptyState("No merchants tracked yet")}</View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <MonthYearPicker
        visible={showMonthPicker}
        onClose={() => setShowMonthPicker(false)}
        selectedDate={selectedDate}
        onSelect={(newDate) => setSelectedDate(newDate)}
        theme={theme}
        minDate={minDate}
        activeMonths={activeMonths}
      />

      <BottomNavBar active="Insights" onNavigate={handleNavigate} isDarkMode={isDarkMode} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthText: { fontSize: FONT_SIZES.xl },
  scrollContent: { paddingHorizontal: 0 },
  paddedContent: { paddingHorizontal: 20 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, borderRadius: 24, padding: 20, gap: 4 },
  summaryLabel: { fontSize: FONT_SIZES.xs },
  summaryValue: { fontSize: FONT_SIZES.xl },
  budgetCard: { borderRadius: 24, padding: 20, marginBottom: 20 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  budgetLabel: { fontSize: FONT_SIZES.xs },
  budgetAmount: { fontSize: FONT_SIZES.sm },
  progressBar: { height: 16, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: FONT_SIZES.base },
  seeAllText: { color: COLORS.primary, fontFamily: FONTS.medium },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  emptyText: { fontSize: FONT_SIZES.sm, marginTop: 10, textAlign: 'center' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});