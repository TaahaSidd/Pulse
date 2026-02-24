import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { CategoryMapper } from '../utils/CategoryMapper';
import Button from '../components/Button';
import { format, parseISO } from 'date-fns';

import ScreenHeader from '../components/ScreenHeader';
import GeneralInfoCard from '../components/GeneralInfoCard';
import ThreeDotsMenu from '../components/ThreeDotsMenu';
import EditTransactionModal from '../components/Edittransactionmodal';
import Toast from '../components/Toast';
import PulseModal from '../components/PulseModal';

import { useDatabase } from '../context/DatabaseContext';
import { useToast } from '../hooks/useToast';

export default function TransactionDetailScreen({ route, navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const { db } = useDatabase();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const { transaction } = route.params || {};
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(transaction);

  if (!currentTransaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text, marginBottom: 20 }}>No Transaction Data Found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isExpense = currentTransaction.type === 'debit';
  const categoryColor = CategoryMapper.getCategoryColor(currentTransaction.category || 'Others');
  const categoryIcon = CategoryMapper.getCategoryIcon(currentTransaction.category || 'Others');

  const displayDate = currentTransaction.date ? format(parseISO(currentTransaction.date), 'dd MMM yyyy') : 'N/A';
  const displayTime = currentTransaction.date ? format(parseISO(currentTransaction.date), 'hh:mm a') : '';

  const handleEdit = () => setShowEditModal(true);
  const handleDelete = () => setShowDeleteModal(true);

  const handleSaveEdit = async (updatedTransaction) => {
    if (!updatedTransaction.amount || updatedTransaction.amount <= 0) {
      showError('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    try {
      await db.updateTransaction(updatedTransaction.id, updatedTransaction);
      setCurrentTransaction(updatedTransaction);
      setShowEditModal(false);
      showSuccess('Updated!', 'Transaction updated successfully');
      if (route.params?.onUpdate) route.params.onUpdate(updatedTransaction);
    } catch (error) {
      showError('Update Failed', 'Could not update transaction');
    }
  };

  const confirmDelete = async () => {
    try {
      await db.deleteTransaction(currentTransaction.id);
      setShowDeleteModal(false);
      if (route.params?.onDelete) route.params.onDelete(currentTransaction.id);
      showSuccess('Deleted', 'Transaction removed successfully');
      navigation.goBack();
    } catch (error) {
      showError('Delete Failed', 'The transaction is still in the database.');
    }
  };

  const menuOptions = [
    { label: 'Edit', icon: 'create-outline', onPress: handleEdit },
    { label: 'Delete', icon: 'trash-outline', color: COLORS.error, onPress: handleDelete },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScreenHeader
        title="Details"
        theme={theme}
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightIcon={<ThreeDotsMenu theme={theme} options={menuOptions} />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Z-PATTERN ROW 1: Category Icon (Left) & Status Badge (Right) */}
        <View style={styles.zTopRow}>
          <View style={[styles.iconBox, { backgroundColor: categoryColor + '15' }]}>
            <Ionicons name={categoryIcon} size={32} color={categoryColor} />
          </View>

          <View style={[styles.typeBadge, {
            backgroundColor: isExpense ? COLORS.error + '12' : COLORS.primary + '12',
            borderColor: isExpense ? COLORS.error + '30' : COLORS.primary + '30'
          }]}>
            <Text style={[styles.typeText, { color: isExpense ? COLORS.error : COLORS.primary, fontFamily: FONTS.bold }]}>
              {isExpense ? 'EXPENSE' : 'INCOME'}
            </Text>
          </View>
        </View>

        {/* Z-PATTERN ROW 2: Merchant Info (Left) & Amount (Right) */}
        <View style={styles.zMainRow}>
          <View style={styles.merchantContainer}>
            <Text style={[styles.merchantName, { color: theme.text, fontFamily: FONTS.bold }]} numberOfLines={2}>
              {currentTransaction.merchant || 'Unknown Merchant'}
            </Text>
            <Text style={[styles.dateTime, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
              {displayDate} • {displayTime}
            </Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountText, {
              color: isExpense ? theme.text : COLORS.primary,
              fontFamily: FONTS.bold
            }]}>
              {isExpense ? `-₹${currentTransaction.amount.toLocaleString()}` : `+₹${currentTransaction.amount.toLocaleString()}`}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Transaction Body Information */}
        <GeneralInfoCard
          transaction={currentTransaction}
          theme={theme}
        />

        {/* SMS Footer Section */}
        {currentTransaction.raw_sms && (
          <View style={styles.footerSection}>
            <Text style={[styles.sectionLabel, { color: theme.textTertiary, fontFamily: FONTS.bold }]}>
              SMS SOURCE
            </Text>
            <View style={[styles.rawSmsCard, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
              <Text style={[styles.rawSmsText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                {currentTransaction.raw_sms}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <EditTransactionModal
        visible={showEditModal}
        transaction={currentTransaction}
        theme={theme}
        db={db}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />

      <PulseModal
        visible={showDeleteModal}
        type="delete"
        title="Delete Transaction"
        message="Are you sure you want to delete this? This cannot be undone."
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onPrimaryPress={confirmDelete}
        onSecondaryPress={() => setShowDeleteModal(false)}
        onClose={() => setShowDeleteModal(false)}
        isDarkMode={isDarkMode}
      />

      {toast && <Toast {...toast} onHide={hideToast} isDarkMode={isDarkMode} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  zTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  zMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  merchantContainer: {
    flex: 1.2,
    paddingRight: 8,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  merchantName: {
    fontSize: 22,
    lineHeight: 28,
  },
  dateTime: {
    fontSize: 13,
    marginTop: 4,
  },
  amountText: {
    fontSize: 26,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 24,
    opacity: 0.4,
  },
  footerSection: {
    width: '100%',
    marginTop: 32,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingLeft: 2,
  },
  rawSmsCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  rawSmsText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});