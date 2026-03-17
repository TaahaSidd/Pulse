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
import SearchBar from '../components/SearchBar';
import TransactionItem from '../components/TransactionItem';
import SegmentedFilter from '../components/SegmentedFilter';
import TransactionFilterModal from '../components/TransactionFilterModal';

import { useToast } from '../hooks/useToast';

import NotfoundSVG from '../assets/Svg/Notfound.svg';
import NoTxSVG from '../assets/Svg/no-tx copy.svg';


export default function TransactionsScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const { isInitialized, db } = useDatabase();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [transactions, setTransactions] = useState([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [activeFilters, setActiveFilters] = useState({
    month: [], category: []
  });

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const handleResetFilters = () => {
    setActiveFilters({ month: [], category: [] });
  };

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

  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (activeFilter === 'Expenses') filtered = filtered.filter(t => t.type === 'debit');
    else if (activeFilter === 'Income') filtered = filtered.filter(t => t.type === 'credit');

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.merchant?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query) ||
        t.bank?.toLowerCase().includes(query)
      );
    }

    // Apply modal filters
    if (activeFilters.category.length > 0)
      filtered = filtered.filter(t => activeFilters.category.includes(t.category));

    if (activeFilters.month.length > 0) {
      filtered = filtered.filter(t => {
        const txDate = parseISO(t.date);
        const label = format(txDate, 'MMMM yyyy');
        return activeFilters.month.includes(label);
      });
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

  const renderTransactionItem = ({ item, index, section }) => {
    // const isExpense = item.type === 'debit';
    // const categoryColor = CategoryMapper.getCategoryColor(item.category);
    // const categoryIcon = CategoryMapper.getCategoryIcon(item.category);

    // // Logic to determine if we should show a divider
    // const isLastItem = index === section.data.length - 1;

    // return (
    //   <TouchableOpacity
    //     style={styles.txRow}
    //     activeOpacity={0.6}
    //     onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
    //     onLongPress={() => {
    //       Alert.alert(
    //         'Delete Transaction',
    //         'Are you sure you want to remove this record?',
    //         [
    //           { text: 'Cancel', style: 'cancel' },
    //           { text: 'Delete', style: 'destructive', onPress: () => handleDeleteTransaction(item.id) }
    //         ]
    //       );
    //     }}
    //   >
    //     {/* Simple Icon only - Indicator removed */}
    //     <View style={styles.iconWrapper}>
    //       <Ionicons name={categoryIcon} size={24} color={categoryColor} />
    //     </View>

    //     {/* The divider now lives only in this container, starting from the text */}
    //     <View style={[
    //       styles.txMain,
    //       !isLastItem && { borderBottomWidth: 0.5, borderBottomColor: theme.border }
    //     ]}>
    //       <View style={styles.details}>
    //         <Text
    //           numberOfLines={1}
    //           style={[styles.txTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}
    //         >
    //           {item.merchant || 'Unknown'}
    //         </Text>
    //         <Text style={[styles.txSubtitle, { color: theme.textTertiary, fontFamily: FONTS.medium }]}>
    //           {item.category} • {item.bank}
    //         </Text>
    //       </View>

    //       <View style={styles.amountContainer}>
    //         <Text style={[
    //           styles.amountText,
    //           { color: isExpense ? theme.text : COLORS.primary, fontFamily: FONTS.bold }
    //         ]}>
    //           {isExpense ? `-₹${item.amount.toLocaleString()}` : `+₹${item.amount.toLocaleString()}`}
    //         </Text>
    //       </View>
    //     </View>
    //   </TouchableOpacity>
    // );

    return (
      <TransactionItem
        item={item}
        index={index}
        isLast={index === section.data.length - 1}
        theme={theme}
        onPress={() => navigation.navigate('TransactionDetail', {
          transaction: item,
          onUpdate: (updatedTx) => {
            setTransactions(prev =>
              prev.map(t => t.id === updatedTx.id ? { ...t, ...updatedTx } : t)
            );
          },
          onDelete: (deletedId) => {
            setTransactions(prev => prev.filter(t => t.id !== deletedId));
          }
        })}
        onDelete={handleDeleteTransaction}
      />
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
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search merchant, category..."
        theme={theme}
      />

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <SegmentedFilter
          options={['All', 'Expenses', 'Income']}
          activeFilter={activeFilter}
          onSelect={setActiveFilter}
          theme={theme}
        />

        <TouchableOpacity
          style={[styles.filterIconButton, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Filters
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
      </View> */}

      {/* Transaction List */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : groupedTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <NoTxSVG width={200} height={80} />

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

      <TransactionFilterModal
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        theme={theme}
        isDarkMode={isDarkMode}
        transactions={transactions}  // ← add this
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

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
  // sectionHeader: {
  //   fontSize: FONT_SIZES.xs,
  //   fontFamily: FONTS.bold,
  //   textTransform: 'uppercase',
  //   letterSpacing: 1,
  //   paddingVertical: 12,
  // },
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


  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20, // Aligns the icons to the screen edge
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Gap between icon and the start of the text/divider
  },
  txMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingRight: 20, // Ensures amount doesn't hit the screen edge
  },
  details: {
    flex: 1
  },
  txTitle: {
    fontSize: 16,
    marginBottom: 2
  },
  txSubtitle: {
    fontSize: 12,
    opacity: 0.6
  },
  amountContainer: {
    marginLeft: 10,
    alignItems: 'flex-end'
  },
  amountText: {
    fontSize: 16
  },

  // Section Header adjustment for the new style
  sectionHeader: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // No background color for sections
  },
  listContent: {
    paddingHorizontal: 0 // Remove horizontal padding from the container itself
  },


  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12, // Space between segments and icon
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});