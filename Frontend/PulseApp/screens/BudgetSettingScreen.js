// screens/BudgetSettingScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const TOOLTIP_STORAGE_KEY = '@has_seen_swipe_delete_tooltip';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

import { useDatabase } from '../context/DatabaseContext';
import BudgetDB from '../database/BudgetDB';
import CategoryMapper from '../utils/CategoryMapper';

import Toast from '../components/Toast';
import ScreenHeader from '../components/ScreenHeader';
import BudgetCategoryCard from '../components/BudgetCategoryCard';
import CategorySelectionModal from '../components/CategorySelectionModal';
import SwipeTooltip from '../components/Tooltip';
import Button from '../components/Button';

import { useToast } from '../hooks/useToast';

export default function BudgetSettingScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const { isInitialized, db } = useDatabase();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [totalBudget, setTotalBudget] = useState('50000');
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'MMMM yyyy'));
  const [allocations, setAllocations] = useState([]);
  const [actualSpending, setActualSpending] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingBudget, setHasExistingBudget] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const coreCategories = CategoryMapper.getCoreCategories();
  const optionalCategories = CategoryMapper.getOptionalCategories();

  useEffect(() => {
    if (isInitialized) {
      loadBudgetData();
    }
  }, [isInitialized]);

  useEffect(() => {
    const checkTooltipStatus = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem(TOOLTIP_STORAGE_KEY);
        if (hasSeen !== 'true') {
          setShowTooltip(true);
        }
      } catch (e) {
        console.error("Error checking tooltip status", e);
      }
    };

    if (isInitialized) {
      checkTooltipStatus();
      loadBudgetData();
    }
  }, [isInitialized]);

  // 2. Function to dismiss and save preference
  const handleDismissTooltip = async () => {
    setShowTooltip(false);
    try {
      await AsyncStorage.setItem(TOOLTIP_STORAGE_KEY, 'true');
    } catch (e) {
      console.error("Error saving tooltip status", e);
    }
  };

  const loadBudgetData = async () => {
    try {
      setIsLoading(true);
      await loadCurrentSpending();
      const existingBudget = await BudgetDB.getCurrentBudget();

      if (existingBudget) {
        setHasExistingBudget(true);
        setTotalBudget(existingBudget.total_amount.toString());

        const loadedAllocations = existingBudget.allocations.map(allocation => {
          const details = CategoryMapper.getCategoryDetails(allocation.category);
          return {
            id: allocation.category.toLowerCase().replace(/\s+/g, '_'),
            name: allocation.category,
            icon: details.icon,
            color: details.color,
            amount: allocation.allocated_amount,
            spent: actualSpending[allocation.category] || 0,
          };
        });

        setAllocations(loadedAllocations);
      } else {
        setHasExistingBudget(false);
        setTotalBudget('50000');
        initializeCoreCategories('50000');
      }
    } catch (error) {
      showError('Load Failed', 'Could not load budget data');
      initializeCoreCategories('50000');
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
      categories.forEach(cat => { spendingMap[cat.category] = cat.spent || 0; });
      setActualSpending(spendingMap);
    } catch (error) {
      console.error('❌ Error loading spending:', error);
    }
  };

  const initializeCoreCategories = (budgetAmount = totalBudget) => {
    const numericTotal = parseInt(budgetAmount.replace(/,/g, '')) || 0;
    const perCategory = Math.floor(numericTotal / coreCategories.length);

    const initialAllocations = coreCategories.map(categoryName => {
      const details = CategoryMapper.getCategoryDetails(categoryName);
      return {
        id: categoryName.toLowerCase().replace(/\s+/g, '_'),
        name: categoryName,
        icon: details.icon,
        color: details.color,
        amount: perCategory,
        spent: actualSpending[categoryName] || 0,
      };
    });
    setAllocations(initialAllocations);
  };

  const handleCategoryAmountChange = (id, text) => {
    const numeric = text.replace(/[^0-9]/g, '');
    const amount = parseInt(numeric) || 0;
    const updated = allocations.map(item => item.id === id ? { ...item, amount } : item);
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
    if (numeric && allocations.length > 0) {
      const perCategory = Math.floor(amount / allocations.length);
      const updated = allocations.map(item => ({ ...item, amount: perCategory }));
      setAllocations(updated);
    }
  };

  const handleAddCategory = (categoryName) => {
    if (allocations.find(a => a.name === categoryName)) {
      showError('Already Added', `${categoryName} is already in your budget`);
      return;
    }
    const details = CategoryMapper.getCategoryDetails(categoryName);
    const newCategory = {
      id: categoryName.toLowerCase().replace(/\s+/g, '_'),
      name: categoryName,
      icon: details.icon,
      color: details.color,
      amount: 0,
      spent: actualSpending[categoryName] || 0,
    };
    setAllocations([...allocations, newCategory]);
    setShowAddCategoryModal(false);
  };

  const handleRemoveCategory = (categoryId) => {
    if (allocations.length <= 1) {
      showError('Cannot Remove', 'You must have at least one category');
      return;
    }
    setAllocations(allocations.filter(item => item.id !== categoryId));
  };

  const handleSaveBudget = () => {
    const numericTotal = parseInt(totalBudget.replace(/,/g, '')) || 0;
    if (numericTotal === 0) return;

    if (numericTotal < 1000) {
      showError('Budget Too Low', 'Minimum budget should be ₹1,000');
      return;
    }

    if (totalAllocated > numericTotal) {
      Alert.alert(
        'Over-Allocated',
        `You've allocated ₹${totalAllocated.toLocaleString()} which exceeds your limit. Save anyway?`,
        [{ text: 'Cancel', style: 'cancel' }, { text: 'Save Anyway', onPress: () => saveBudgetData(numericTotal) }]
      );
      return;
    }
    saveBudgetData(numericTotal);
  };

  const saveBudgetData = async (numericTotal) => {
    try {
      setIsSaving(true);
      const now = new Date();
      const budgetAllocations = allocations.map(item => ({ category: item.name, amount: item.amount }));
      const result = await BudgetDB.saveBudget(format(now, 'MMMM'), now.getFullYear(), numericTotal, budgetAllocations);

      if (result.success) {
        showSuccess('Success', hasExistingBudget ? 'Budget updated' : 'Budget saved');
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showError('Save Failed', 'Could not save budget');
      }
    } catch (error) {
      showError('Save Failed', 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickFill = (percentage) => {
    const numericTotal = parseInt(totalBudget.replace(/,/g, '')) || 0;
    const amount = Math.floor(numericTotal * percentage);
    const updated = allocations.map(item => ({ ...item, amount }));
    setAllocations(updated);
  };

  const totalAllocated = allocations.reduce((sum, item) => sum + item.amount, 0);
  const numericTotal = parseInt(totalBudget.replace(/,/g, '')) || 0;
  const allocationPct = numericTotal > 0 ? (totalAllocated / numericTotal) * 100 : 0;
  const remaining = numericTotal - totalAllocated;
  const allCategories = [...CategoryMapper.getCoreCategories(), ...CategoryMapper.getOptionalCategories()];
  const availableToAdd = allCategories.filter(catName => !allocations.find(a => a.name === catName));

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScreenHeader
        mode="simple"
        theme={theme}
        title={hasExistingBudget ? 'Edit Budget' : 'Set Budget'}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* REFINED: Subtle Status Banner */}
        <View style={[styles.statusBanner, { borderColor: theme.border }]}>
          <Ionicons
            name={hasExistingBudget ? "calendar-outline" : "information-circle-outline"}
            size={16}
            color={theme.textTertiary}
          />
          <Text style={[styles.statusText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
            {hasExistingBudget ? `Editing ${currentMonth}` : "Plan your monthly spending"}
          </Text>
        </View>

        {/* TOTAL BUDGET SECTION */}
        <View style={styles.totalSection}>
          <Text style={[styles.label, { color: theme.textTertiary, fontFamily: FONTS.bold }]}>
            TOTAL MONTHLY LIMIT
          </Text>
          <View style={styles.amountInputRow}>
            <Text style={[styles.currency, { color: theme.text, fontFamily: FONTS.light }]}>₹</Text>
            <TextInput
              style={[styles.mainInput, { color: theme.text, fontFamily: FONTS.semiBold }]}
              value={totalBudget}
              onChangeText={handleTotalBudgetChange}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* REFINED: Outline Quick Fill */}
        <View style={styles.quickFillRow}>
          <Text style={[styles.quickLabel, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>QUICK ALLOCATE:</Text>
          {[0.10, 0.15, 0.20].map(pct => (
            <TouchableOpacity
              key={pct}
              onPress={() => handleQuickFill(pct)}
              style={[styles.quickButton, { borderColor: theme.border }]}
            >
              <Text style={{ color: theme.text, fontFamily: FONTS.medium, fontSize: 12 }}>{pct * 100}%</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ALLOCATION SUMMARY */}
        <View style={styles.allocationHeader}>
          <View>
            <Text style={[styles.subLabel, { color: theme.text, fontFamily: FONTS.semiBold }]}>Allocations</Text>
            <Text style={[styles.remainingText, { color: remaining >= 0 ? theme.textTertiary : COLORS.error, fontFamily: FONTS.regular }]}>
              {remaining >= 0 ? `₹${remaining.toLocaleString()} left` : `Over by ₹${Math.abs(remaining).toLocaleString()}`}
            </Text>
          </View>
          <Text style={[styles.percentageLabel, { color: allocationPct > 100 ? COLORS.error : theme.text, fontFamily: FONTS.bold }]}>
            {Math.round(allocationPct)}%
          </Text>
        </View>

        {/* PROGRESS BAR */}
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, {
            width: `${Math.min(allocationPct, 100)}%`,
            backgroundColor: allocationPct > 100 ? COLORS.error : COLORS.primary
          }]} />
        </View>

        {/* CATEGORY LIST */}
        <View style={styles.listContainer}>
          {allocations.map((item, index) => (
            <View key={item.id} style={{ zIndex: index === 0 ? 100 : 1 }}>
              {/* 3. SHOW TOOLTIP ONLY ON THE FIRST CARD */}
              {index === 0 && showTooltip && (
                <SwipeTooltip
                  isDarkMode={isDarkMode}
                  onClose={handleDismissTooltip}
                />
              )}

              <BudgetCategoryCard
                item={item}
                theme={theme}
                numericTotal={numericTotal}
                isOptional={optionalCategories.includes(item.name)}
                onAmountChange={handleCategoryAmountChange}
                onRemove={handleRemoveCategory}
              />
            </View>
          ))}
        </View>

        {/* DASHED ADD BUTTON */}
        {availableToAdd.length > 0 && (
          <Button
            title="Add Category"
            variant="text"
            icon="add"
            iconPosition="left"
            onPress={() => setShowAddCategoryModal(true)}
            textStyle={{ fontFamily: FONTS.semiBold }}
          />
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* FIXED FOOTER */}
      <View style={[styles.footer, { backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border }]}>
        <Button
          title={hasExistingBudget ? 'Confirm Updates' : 'Set Monthly Budget'}
          onPress={handleSaveBudget}
          loading={isSaving}
          disabled={numericTotal === 0}
          fullWidth
        />
      </View>

      <CategorySelectionModal
        visible={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSelectCategory={handleAddCategory}
        availableCategories={availableToAdd}
        theme={theme}
      />

      {toast && <Toast {...toast} onHide={hideToast} isDarkMode={isDarkMode} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  statusText: { fontSize: 12 },
  totalSection: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  label: { fontSize: 10, letterSpacing: 1.5, marginBottom: 8 },
  amountInputRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 32, marginRight: 8 },
  mainInput: { fontSize: 48, minWidth: 120, textAlign: 'center' },
  quickFillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40, gap: 12 },
  quickLabel: { fontSize: 9, letterSpacing: 1 },
  quickButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  allocationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 },
  subLabel: { fontSize: 18 },
  remainingText: { fontSize: 12, marginTop: 2 },
  percentageLabel: { fontSize: 18 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 25 },
  progressFill: { height: '100%' },
  listContainer: { marginBottom: 15 },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 35,
    paddingTop: 15
  },
});