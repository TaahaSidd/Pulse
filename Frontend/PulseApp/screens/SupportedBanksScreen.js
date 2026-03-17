import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { getThemedColors } from '../constants/Colors';
import { FONTS } from '../constants/Fonts';

import BankPatterns from '../utils/BankPatterns';
import ScreenHeader from '../components/ScreenHeader';

export default function SupportedBanksScreen({ navigation, isDarkMode = true }) {
  const theme = getThemedColors(isDarkMode);

  const InstitutionRow = ({ name }) => (
    <View style={[styles.row, { borderBottomColor: theme.border + '30' }]}>
      <Text style={[styles.rowTitle, { color: theme.text, fontFamily: FONTS.medium }]}>
        {name.replace(/_/g, ' ')}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader
          mode="simple"
          theme={theme}
          title="Supported Banks"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          <Text style={[styles.description, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
            Pace works with most Indian banks and payment apps out of the box. Don't see yours? It's likely covered by our smart detection engine.
          </Text>

          <Text style={[styles.sectionHeader, { color: theme.textSecondary, fontFamily: FONTS.semiBold }]}>
            Digital & UPI
          </Text>
          <View style={[styles.listWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {Object.keys(BankPatterns.upi).map((key) => (
              <InstitutionRow key={key} name={key} />
            ))}
          </View>

          <Text style={[styles.sectionHeader, { color: theme.textSecondary, fontFamily: FONTS.semiBold, marginTop: 24 }]}>
            Traditional Banks
          </Text>
          <View style={[styles.listWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {Object.keys(BankPatterns.banks).map((key) => (
              <InstitutionRow key={key} name={key} />
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollBody: { paddingHorizontal: 16, paddingBottom: 40 },
  description: { fontSize: 13, marginBottom: 20, lineHeight: 20, opacity: 0.8 },
  sectionHeader: { fontSize: 11, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  listWrapper: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rowTitle: { fontSize: 15 },
});