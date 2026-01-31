// screens/BudgetSettingScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { format } from 'date-fns';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { CategoryMapper } from '../utils/CategoryMapper';
import { useDatabase } from '../context/DatabaseContext';
import BudgetDB from '../database/BudgetDB';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function BudgetSettingScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const { isInitialized, db } = useDatabase();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [totalBudget, setTotalBudget] = useState('0');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM yyyy'));
  const [allocations, setAllocations] = useState([]);
  const [actualSpending, setActualSpending] = useState({});
  const [activeSlider, setActiveSlider] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingBudget, setHasExistingBudget] = useState(false);

  // Category definitions with icons
  const categoryDefinitions = [
    { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline', color: '#FFB800' },
    { id: 'shopping', name: 'Shopping', icon: 'cart-outline', color: '#F472B6' },
    { id: 'transport', name: 'Travel & Transport', icon: 'car-outline', color: '#3B82F6' },
    { id: 'bills', name: 'Bills & Utilities', icon: 'receipt-outline', color: '#10B981' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film-outline', color: '#A855F7' },
    { id: 'healthcare', name: 'Healthcare', icon: 'medical-outline', color: '#EF4444' },
  ];

  useEffect(() => {
    if (isInitialized) {
      loadBudgetData();
    }
  }, [isInitialized]);

  /**
   * 🔥 MAIN LOADING FUNCTION - Loads budget from database
   */
  const loadBudgetData = async () => {
    try {
      setIsLoading(true);

      // 1. Load current spending
      await loadCurrentSpending();

      // 2. Load existing budget (if any)
      const existingBudget = await BudgetDB.getCurrentBudget();

      if (existingBudget) {
        // Has existing budget - load it
        console.log('📊 Found existing budget:', existingBudget);
        setHasExistingBudget(true);
        setTotalBudget(existingBudget.total_amount.toString());

        const loadedAllocations = categoryDefinitions.map(cat => {
          const savedAllocation = existingBudget.allocations.find(
            a => a.category === cat.name
          );
          return {
            ...cat,
            amount: savedAllocation ? savedAllocation.allocated_amount : 0,
            spent: actualSpending[cat.name] || 0,
          };
        });

        setAllocations(loadedAllocations);
        console.log('✅ Budget loaded from database');
      } else {
        // No budget - use ₹50k default (simple!)
        console.log('📝 No budget found, using ₹50k default');
        setHasExistingBudget(false);
        setTotalBudget('50000');
        initializeBudgetAllocations('50000');
      }
    } catch (error) {
      console.error('❌ Error loading budget:', error);
      showError('Load Failed', 'Could not load budget data');
      setTotalBudget('50000');
      initializeBudgetAllocations('50000');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentSpending = async () => {
    try {
      const now = new Date();
      const startOfMonth = format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
      const endOfMonth = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd');

      const categories = await db.getSpendingByCategory(startOfMonth, endOfMonth);

      const spendingMap = {};
      categories.forEach(cat => {
        spendingMap[cat.category] = cat.spent || 0;
      });

      setActualSpending(spendingMap);
    } catch (error) {
      console.error('❌ Error loading spending:', error);
    }
  };

  const initializeBudgetAllocations = (budgetAmount = totalBudget) => {
    const numericTotal = parseInt(budgetAmount.replace(/,/g, '')) || 0;
    const perCategory = Math.floor(numericTotal / categoryDefinitions.length);

    const initialAllocations = categoryDefinitions.map(cat => ({
      ...cat,
      amount: perCategory,
      spent: actualSpending[cat.name] || 0,
    }));

    setAllocations(initialAllocations);
  };

  const updateAllocation = (id, value) => {
    const updated = allocations.map(item =>
      item.id === id ? { ...item, amount: Math.round(value) } : item
    );
    setAllocations(updated);
  };

  const handleTotalBudgetChange = (text) => {
    const numeric = text.replace(/[^0-9]/g, '');
    const amount = parseInt(numeric) || 0;

    if (amount > 1000000) {
      showError('Budget Too High', 'Maximum budget is ₹10,00,000');
      return;
    }

    setTotalBudget(numeric);

    // Auto-redistribute when total changes
    if (numeric && allocations.length > 0) {
      const newTotal = parseInt(numeric);
      const perCategory = Math.floor(newTotal / allocations.length);

      const updated = allocations.map(item => ({
        ...item,
        amount: perCategory,
      }));
      setAllocations(updated);
    }
  };

  const handleSaveBudget = () => {
    const numericTotal = parseInt(totalBudget.replace(/,/g, '')) || 0;

    if (numericTotal === 0) {
      showError('Invalid Budget', 'Please enter a valid total budget');
      return;
    }

    if (numericTotal < 1000) {
      showError('Budget Too Low', 'Minimum budget should be ₹1,000');
      return;
    }

    if (numericTotal > 1000000) {
      showError('Budget Too High', 'Maximum budget is ₹10,00,000');
      return;
    }

    // Warn if over-allocated
    if (totalAllocated > numericTotal) {
      Alert.alert(
        'Over-Allocated Budget',
        `You've allocated ₹${totalAllocated.toLocaleString()} but your total budget is only ₹${numericTotal.toLocaleString()}. Continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: () => saveBudgetData(numericTotal)
          }
        ]
      );
      return;
    }

    saveBudgetData(numericTotal);
  };

  const saveBudgetData = async (numericTotal) => {
    try {
      const now = new Date();
      const month = now.toLocaleString('default', { month: 'long' });
      const year = now.getFullYear();

      // Format allocations for database
      const budgetAllocations = allocations.map(item => ({
        category: item.name,
        amount: item.amount,
      }));

      // Save to database
      const result = await BudgetDB.saveBudget(month, year, numericTotal, budgetAllocations);

      if (result.success) {
        const message = hasExistingBudget
          ? `Budget updated to ₹${numericTotal.toLocaleString()}`
          : `₹${numericTotal.toLocaleString()} budget set for ${currentMonth}`;

        showSuccess(hasExistingBudget ? 'Budget Updated!' : 'Budget Saved!', message);
        console.log('✅ Budget saved to database:', result.budgetId);

        // Navigate back after 1.5 seconds
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        showError('Save Failed', 'Could not save budget to database');
      }
    } catch (error) {
      console.error('❌ Error saving budget:', error);
      showError('Save Failed', 'An error occurred while saving');
    }
  };

  const handleQuickFill = (percentage) => {
    const numericTotal = parseInt(totalBudget.replace(/,/g, '')) || 0;
    const amount = Math.floor(numericTotal * percentage);

    const updated = allocations.map(item => ({
      ...item,
      amount,
    }));
    setAllocations(updated);
  };

  const totalAllocated = allocations.reduce((sum, item) => sum + item.amount, 0);
  const numericTotal = parseInt(totalBudget.replace(/,/g, '')) || 0;
  const allocationPct = numericTotal > 0 ? (totalAllocated / numericTotal) * 100 : 0;
  const remaining = numericTotal - totalAllocated;

  // Show loading spinner while fetching data
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
          Loading budget...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
          {hasExistingBudget ? 'Edit Budget' : 'Set Budget'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Existing Budget Indicator */}
        {hasExistingBudget && (
          <View style={[styles.existingBudgetBanner, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={[styles.existingBudgetText, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
              Editing existing budget for {currentMonth}
            </Text>
          </View>
        )}

        {/* Salary Info Banner - Show if using salary as budget */}
        {!hasExistingBudget && (
          <View style={[styles.salaryInfoBanner, { backgroundColor: COLORS.primary + '15' }]}>
            <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.salaryInfoText, { color: theme.text, fontFamily: FONTS.regular }]}>
              Budget amount defaults to your salary. You can edit it to save automatically.
            </Text>
          </View>
        )}

        {/* Total Budget Input Section */}
        <View style={styles.totalSection}>
          <Text style={[styles.label, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
            BUDGET FOR {currentMonth.toUpperCase()}
          </Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currency, { color: theme.text, fontFamily: FONTS.bold }]}>₹</Text>
            <TextInput
              style={[styles.mainInput, { color: theme.text, fontFamily: FONTS.bold }]}
              value={totalBudget}
              onChangeText={handleTotalBudgetChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.textTertiary}
            />
          </View>
          <View style={[styles.underline, { backgroundColor: COLORS.primary }]} />
        </View>

        {/* Quick Fill Buttons */}
        <View style={styles.quickFillRow}>
          <Text style={[styles.quickLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
            Quick Fill:
          </Text>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: theme.cardElevated }]}
            onPress={() => handleQuickFill(0.10)}
          >
            <Text style={[styles.quickBtnText, { color: theme.text, fontFamily: FONTS.medium }]}>
              10%
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: theme.cardElevated }]}
            onPress={() => handleQuickFill(0.15)}
          >
            <Text style={[styles.quickBtnText, { color: theme.text, fontFamily: FONTS.medium }]}>
              15%
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: theme.cardElevated }]}
            onPress={() => handleQuickFill(0.20)}
          >
            <Text style={[styles.quickBtnText, { color: theme.text, fontFamily: FONTS.medium }]}>
              20%
            </Text>
          </TouchableOpacity>
        </View>

        {/* Allocation Summary */}
        <View style={styles.allocationHeader}>
          <View>
            <Text style={[styles.subLabel, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>
              Budget Allocation
            </Text>
            <Text style={[styles.remainingText, {
              color: remaining >= 0 ? COLORS.primary : COLORS.error,
              fontFamily: FONTS.regular
            }]}>
              {remaining >= 0 ? 'Remaining' : 'Over Budget'}: ₹{Math.abs(remaining).toLocaleString()}
            </Text>
          </View>
          <View style={styles.allocationBadge}>
            <Text style={[styles.percentageLabel, {
              color: allocationPct > 100 ? COLORS.error : COLORS.primary,
              fontFamily: FONTS.bold
            }]}>
              {Math.round(allocationPct)}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[
            styles.progressFill,
            {
              width: `${Math.min(allocationPct, 100)}%`,
              backgroundColor: allocationPct > 100 ? COLORS.error : COLORS.primary,
            }
          ]} />
        </View>

        {/* Categories List */}
        {allocations.map((item) => {
          const spent = item.spent || 0;
          const remaining = item.amount - spent;
          const spentPct = item.amount > 0 ? (spent / item.amount) * 100 : 0;

          return (
            <View key={item.id} style={styles.categoryItem}>
              <View style={styles.categoryTopRow}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>

                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.categoryLeft, {
                    color: remaining >= 0 ? theme.textTertiary : COLORS.error,
                    fontFamily: FONTS.regular
                  }]}>
                    {spent > 0 ? `Spent: ₹${spent.toFixed(0)} • ` : ''}
                    {remaining >= 0 ? `Left: ₹${remaining.toFixed(0)}` : `Over: ₹${Math.abs(remaining).toFixed(0)}`}
                  </Text>
                </View>

                <View style={styles.categoryValueGroup}>
                  <Text style={[styles.categoryAmount, { color: theme.text, fontFamily: FONTS.bold }]}>
                    ₹{item.amount.toLocaleString()}
                  </Text>
                  <Text style={[styles.categoryPct, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                    {numericTotal > 0 ? Math.round((item.amount / numericTotal) * 100) : 0}%
                  </Text>
                </View>
              </View>

              {/* Spending Progress (if any) */}
              {spent > 0 && (
                <View style={[styles.spendingBar, { backgroundColor: theme.border }]}>
                  <View style={[
                    styles.spendingFill,
                    {
                      width: `${Math.min(spentPct, 100)}%`,
                      backgroundColor: spentPct > 100 ? COLORS.error : item.color,
                    }
                  ]} />
                </View>
              )}

              <Slider
                style={[
                  styles.slider,
                  activeSlider === item.id && styles.sliderActive
                ]}
                minimumValue={0}
                maximumValue={numericTotal}
                value={item.amount}
                onValueChange={(val) => updateAllocation(item.id, val)}
                onSlidingStart={() => setActiveSlider(item.id)}
                onSlidingComplete={() => setActiveSlider(null)}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={COLORS.primary}
              />
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: theme.bg }]}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: COLORS.primary },
            numericTotal === 0 && styles.saveButtonDisabled
          ]}
          activeOpacity={0.8}
          onPress={handleSaveBudget}
          disabled={numericTotal === 0}
        >
          <Text style={[styles.saveText, { fontFamily: FONTS.bold }]}>
            {hasExistingBudget ? 'Update Budget' : 'Save Budget'}
          </Text>
        </TouchableOpacity>
      </View>

      {toast && <Toast {...toast} onHide={hideToast} isDarkMode={isDarkMode} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: FONT_SIZES.lg },
  loadingText: {
    marginTop: 15,
    fontSize: FONT_SIZES.base,
  },
  existingBudgetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    gap: 8,
  },
  existingBudgetText: {
    fontSize: FONT_SIZES.sm,
  },
  scrollContent: { paddingHorizontal: 20 },
  totalSection: { alignItems: 'center', marginVertical: 30 },
  label: { fontSize: FONT_SIZES.xs, letterSpacing: 1.2, marginBottom: 15 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 32, marginRight: 10 },
  mainInput: { fontSize: 48, minWidth: 150, textAlign: 'center' },
  underline: { width: '80%', height: 3, borderRadius: 2, marginTop: 10 },
  quickFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 10,
  },
  quickLabel: { fontSize: FONT_SIZES.sm },
  quickBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  quickBtnText: { fontSize: FONT_SIZES.sm },
  allocationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  subLabel: { fontSize: FONT_SIZES.base },
  remainingText: { fontSize: FONT_SIZES.xs, marginTop: 4 },
  allocationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(140, 243, 100, 0.15)',
  },
  percentageLabel: { fontSize: FONT_SIZES.base },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 25,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryItem: { marginBottom: 25 },
  categoryTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: FONT_SIZES.base },
  categoryLeft: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  categoryValueGroup: { alignItems: 'flex-end' },
  categoryAmount: { fontSize: FONT_SIZES.base },
  categoryPct: { fontSize: 10, marginTop: 2 },
  spendingBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  spendingFill: {
    height: '100%',
    borderRadius: 2,
  },
  slider: {
    width: '100%',
    height: 40,
    transform: [{ scaleY: 1 }],
  },
  sliderActive: {
    height: 50,
    transform: [{ scaleY: 1.5 }],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  saveButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: { color: '#000', fontSize: 18 },
  salaryInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    gap: 8,
  },
  salaryInfoText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    lineHeight: 18,
  },
});