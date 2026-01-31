import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { CategoryMapper } from '../utils/CategoryMapper';
import BottomNavBar from '../components/BottomNavBar';
import { useDatabase } from '../context/DatabaseContext';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function TransactionsScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const { isInitialized, db } = useDatabase();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Expenses', 'Income'];

  useEffect(() => {
    if (isInitialized) {
      loadTransactions();
    }
  }, [isInitialized]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await db.getAllTransactions();
      setTransactions(data);
      console.log('✅ Loaded transactions:', data.length);
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      showError('Load Failed', 'Could not load transactions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, []);

  // Filter transactions based on active filter and search
  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Apply type filter
    if (activeFilter === 'Expenses') {
      filtered = filtered.filter(t => t.type === 'debit');
    } else if (activeFilter === 'Income') {
      filtered = filtered.filter(t => t.type === 'credit');
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.merchant?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.bank?.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  // Group transactions by date
  const getGroupedTransactions = () => {
    const filtered = getFilteredTransactions();
    const groups = {};

    filtered.forEach(transaction => {
      const date = parseISO(transaction.date);
      let label;

      if (isToday(date)) {
        label = 'Today';
      } else if (isYesterday(date)) {
        label = 'Yesterday';
      } else {
        label = format(date, 'dd MMM yyyy');
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(transaction);
    });

    // Convert to section list format
    return Object.keys(groups).map(label => ({
      title: label,
      data: groups[label],
    }));
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await db.deleteTransaction(id);
      showSuccess('Deleted', 'Transaction removed');
      loadTransactions();
    } catch (error) {
      showError('Delete Failed', 'Could not delete transaction');
    }
  };

  const renderTransactionItem = ({ item }) => {
    const isExpense = item.type === 'debit';
    const categoryColor = CategoryMapper.getCategoryColor(item.category);
    const categoryIcon = CategoryMapper.getCategoryIcon(item.category);

    return (
      <TouchableOpacity
        style={[styles.transactionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
        onLongPress={() => {
          // Note: Standard 'confirm' doesn't exist in React Native.
          // Use Alert.alert from 'react-native' instead.
          Alert.alert(
            'Delete Transaction',
            'Are you sure you want to remove this record?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => handleDeleteTransaction(item.id) }
            ]
          );
        }}
      >
        <View style={[styles.iconBox, { backgroundColor: categoryColor + '20' }]}>
          <Ionicons name={categoryIcon} size={22} color={categoryColor} />
        </View>

        <View style={styles.details}>
          <Text style={[styles.txTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
            {item.merchant || 'Unknown'}
          </Text>
          <Text style={[styles.txSubtitle, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            {item.category} • {item.bank}
          </Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={[
            styles.amountText,
            { color: isExpense ? theme.text : COLORS.primary, fontFamily: FONTS.bold }
          ]}>
            {isExpense ? `-₹${item.amount.toFixed(2)}` : `+₹${item.amount.toFixed(2)}`}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  const groupedTransactions = getGroupedTransactions();

  if (!isInitialized) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
          Initializing database...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header Area */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
          Transactions
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name="search" size={20} color={theme.textTertiary} />
        <TextInput
          placeholder="Search merchant, category..."
          placeholderTextColor={theme.textTertiary}
          style={[styles.searchInput, { color: theme.text, fontFamily: FONTS.regular }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Filters */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterTab,
                activeFilter === filter && { backgroundColor: COLORS.primary }
              ]}
            >
              <Text style={[
                styles.filterText,
                {
                  color: activeFilter === filter ? '#000' : theme.textTertiary,
                  fontFamily: FONTS.medium
                }
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transaction List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : groupedTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.text, fontFamily: FONTS.semiBold }]}>
            No Transactions Yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            {searchQuery ? 'Try a different search term' : 'Start by parsing your first SMS!'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransactionItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[styles.sectionHeader, { color: theme.textTertiary, backgroundColor: theme.bg }]}>
              {title}
            </Text>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      <BottomNavBar
        active="Transactions"
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
      />

      {toast && <Toast {...toast} onHide={hideToast} isDarkMode={isDarkMode} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: FONT_SIZES['3xl'] },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 15,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: FONT_SIZES.base },
  filterScroll: { paddingHorizontal: 20, marginBottom: 20 },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  filterText: { fontSize: FONT_SIZES.sm },
  listContent: { paddingHorizontal: 20 },
  sectionHeader: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingVertical: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  details: { flex: 1 },
  txTitle: { fontSize: FONT_SIZES.base, marginBottom: 2 },
  txSubtitle: { fontSize: FONT_SIZES.xs },
  amountContainer: { flexDirection: 'row', alignItems: 'center' },
  amountText: { fontSize: FONT_SIZES.base, marginRight: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZES.base,
  },
});