import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { CategoryMapper } from '../utils/CategoryMapper';
import Button from '../components/Button';
import { format, parseISO } from 'date-fns';

export default function TransactionDetailScreen({ route, navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);
  const [isDownloading, setIsDownloading] = useState(false);

  // 1. GET DATA FROM PARAMS
  const { transaction } = route.params || {};

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>No Transaction Data Found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isExpense = transaction.type === 'debit';
  const categoryColor = CategoryMapper.getCategoryColor(transaction.category);
  const categoryIcon = CategoryMapper.getCategoryIcon(transaction.category);

  const displayDate = transaction.date ? format(parseISO(transaction.date), 'dd MMM yyyy') : 'N/A';
  const displayTime = transaction.date ? format(parseISO(transaction.date), 'hh:mm a') : '';

  const handleEdit = () => {
    // Navigate to an edit screen or open a modal
    // navigation.navigate('EditTransaction', { transaction });
    Alert.alert("Edit Mode", "Feature coming soon: Re-classify category or edit amount.");
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert("Success", "Receipt saved to gallery");
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header with Edit Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>Details</Text>

        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Text style={[styles.editText, { color: COLORS.primary, fontFamily: FONTS.medium }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Main Amount Card */}
        <View style={styles.amountSection}>
          <View style={[styles.iconLarge, { backgroundColor: categoryColor + '15' }]}>
            <Ionicons name={categoryIcon} size={40} color={categoryColor} />
          </View>

          <Text style={[styles.detailTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
            {transaction.merchant || 'Unknown Merchant'}
          </Text>

          <Text style={[styles.detailAmount, { color: isExpense ? theme.text : COLORS.primary, fontFamily: FONTS.bold }]}>
            {isExpense ? `-₹${transaction.amount.toFixed(2)}` : `+₹${transaction.amount.toFixed(2)}`}
          </Text>

          <View style={[styles.statusBadge, { backgroundColor: COLORS.success + '20' }]}>
            <Text style={[styles.statusText, { color: COLORS.success, fontFamily: FONTS.medium }]}>Completed</Text>
          </View>
        </View>

        {/* Transaction Info List */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <InfoRow label="Category" value={transaction.category} theme={theme} />
          <InfoRow label="Account / Bank" value={transaction.bank} theme={theme} />
          <InfoRow label="Date" value={displayDate} theme={theme} />
          <InfoRow label="Time" value={displayTime} theme={theme} />
          <InfoRow
            label="Type"
            value={isExpense ? "Debit" : "Credit"}
            theme={theme}
            isLast
          />
        </View>

        {/* --- CUSTOM NOTES SECTION --- */}
        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>MY NOTES</Text>
        </View>

        <TouchableOpacity
          style={[styles.memoCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={handleEdit} // Tapping notes should also trigger edit
        >
          <Text style={[styles.memoText, {
            color: transaction.notes ? theme.text : theme.textTertiary,
            fontFamily: FONTS.regular
          }]}>
            {transaction.notes || 'Add a note to this transaction (e.g., Dinner with family)...'}
          </Text>
          <Ionicons name="pencil-outline" size={16} color={theme.textTertiary} style={styles.pencilIcon} />
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionContainer}>
          <Button
            title="Download Receipt"
            variant="primary"
            icon="download-outline"
            fullWidth
            loading={isDownloading}
            onPress={handleDownload}
            style={{ marginBottom: 12 }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const InfoRow = ({ label, value, theme, isLast }) => (
  <View style={[styles.infoRow, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
    <Text style={[styles.infoLabel, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: theme.text, fontFamily: FONTS.medium }]}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: FONT_SIZES.lg },
  editButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  editText: { fontSize: FONT_SIZES.base },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center' },
  amountSection: { alignItems: 'center', marginVertical: 30 },
  iconLarge: {
    width: 80,
    height: 80,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailTitle: { fontSize: FONT_SIZES.xl, marginBottom: 8 },
  detailAmount: { fontSize: FONT_SIZES['4xl'], marginBottom: 15 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: FONT_SIZES.xs },
  infoCard: { width: '100%', borderRadius: 24, borderWidth: 1, paddingHorizontal: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 18 },
  infoLabel: { fontSize: FONT_SIZES.base },
  infoValue: { fontSize: FONT_SIZES.base },
  sectionLabelContainer: { width: '100%', marginTop: 30, marginBottom: 10, paddingLeft: 5 },
  sectionLabel: { fontSize: FONT_SIZES.xs, letterSpacing: 1 },
  memoCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  memoText: { fontSize: FONT_SIZES.sm, flex: 1 },
  pencilIcon: { marginLeft: 10 },
  actionContainer: { width: '100%', marginTop: 30 },
});