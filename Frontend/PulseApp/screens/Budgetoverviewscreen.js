// screens/BudgetOverviewScreen.js
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';

import { useDatabase } from '../context/DatabaseContext';
import BudgetDB from '../database/BudgetDB';

import { useToast } from '../hooks/useToast';

import Toast from '../components/Toast';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import BudgetDetailedCard from '../components/BudgetDetailedCard';
import BudgetCategoryList from '../components/BudgetCategoryList';


const { width } = Dimensions.get('window');

export default function BudgetOverviewScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const { isInitialized, db } = useDatabase();
    const { toast, showSuccess, showError, hideToast } = useToast();

    const [monthlyBudget, setMonthlyBudget] = useState(null);
    const [spending, setSpending] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    const now = new Date();
    const currentMonth = format(now, 'MMMM yyyy');
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    const daysPassed = differenceInDays(now, monthStart) + 1;
    const daysRemaining = differenceInDays(monthEnd, now);

    useEffect(() => {
        if (isInitialized) {
            loadBudgetData();
        }
    }, [isInitialized]);

    const loadBudgetData = async () => {
        try {
            setIsLoading(true);

            // Load current month's budget
            const budget = await BudgetDB.getCurrentBudget();
            setMonthlyBudget(budget);

            // Load actual spending for current month
            const startDate = format(monthStart, 'yyyy-MM-dd');
            const endDate = format(now, 'yyyy-MM-dd');

            const categories = await db.getSpendingByCategory(startDate, endDate);
            const spendingMap = {};
            categories.forEach(cat => {
                spendingMap[cat.category] = cat.spent || 0;
            });
            setSpending(spendingMap);

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error('❌ Error loading budget data:', error);
            showError('Load Failed', 'Could not load budget data');
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate totals
    const totalSpent = Math.round(Object.values(spending).reduce((sum, amt) => sum + amt, 0));
    const budgetAmount = Math.round(monthlyBudget?.total_amount || 0);
    const remaining = budgetAmount - totalSpent;
    const spentPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

    // Calculate daily burn rate and projections
    const dailyBurnRate = daysPassed > 0 ? totalSpent / daysPassed : 0;
    const projectedSpending = dailyBurnRate * daysInMonth;
    const projectedRemaining = budgetAmount - projectedSpending;
    const safeDailyRate = budgetAmount / daysInMonth;

    // Status
    const isOverBudget = spentPercentage > 100;
    const isWarning = spentPercentage > 80 && !isOverBudget;
    const isOnPace = dailyBurnRate <= safeDailyRate;

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                    Loading your budget...
                </Text>
            </View>
        );
    }

    // Show empty state if no budget set
    if (!monthlyBudget) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

                <ScreenHeader
                    mode="simple"
                    theme={theme}
                    title="Budget Overview"
                    showBack={true}
                    onBackPress={() => navigation.goBack()}
                />

                <View style={styles.emptyStateContainer}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: theme.cardElevated }]}>
                        <Ionicons name="wallet-outline" size={64} color={theme.textTertiary} />
                    </View>

                    <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                        No Budget Set
                    </Text>

                    <Text style={[styles.emptyMessage, { color: theme.textSecondary, fontFamily: FONTS.regular, textAlign: 'center', marginBottom: 30 }]}>
                        Set your monthly budget to track spending, get insights, and stay on top of your finances.
                    </Text>

                    <Button
                        title="Set Up Budget"
                        variant="primary"
                        size="medium"
                        icon="add-circle-outline"
                        onPress={() => navigation.navigate('BudgetSetting')}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.bg }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <ScreenHeader
                mode="simple"
                theme={theme}
                title="Budget Overview"
                showBack={true}
                onBackPress={() => navigation.goBack()}
                rightIcon={<Ionicons name="create-outline" size={24} color={theme.text} />}
                onRightPress={() => navigation.navigate('BudgetSetting')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* Monthly Budget Card */}
                    <BudgetDetailedCard
                        totalSpent={totalSpent}
                        budgetAmount={budgetAmount}
                        spentPercentage={spentPercentage}
                        daysRemaining={daysRemaining}
                        dailyBurnRate={dailyBurnRate}
                        theme={theme}
                        isOverBudget={isOverBudget}
                        isWarning={isWarning}
                    />

                    <View style={styles.insightsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                            Smart Insights
                        </Text>

                        <View style={styles.bentoGrid}>
                            {/* Compact Large Tile */}
                            <View style={[styles.bentoTile, styles.largeTile, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
                                <View style={styles.tileMainContent}>
                                    <View style={[styles.iconCircle, { backgroundColor: projectedRemaining >= 0 ? COLORS.primary + '15' : COLORS.error + '15' }]}>
                                        <Ionicons
                                            name="analytics"
                                            size={20}
                                            color={projectedRemaining >= 0 ? COLORS.primary : COLORS.error}
                                        />
                                    </View>
                                    <View style={styles.tileTextContent}>
                                        <Text style={[styles.tileLabel, { color: theme.textTertiary }]}>FORECAST</Text>
                                        <Text style={[styles.tileValue, { color: theme.text }]}>₹{projectedSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                                    </View>
                                    <View style={styles.badge}>
                                        <Text style={[styles.badgeText, { color: projectedRemaining >= 0 ? COLORS.primary : COLORS.error }]}>
                                            {projectedRemaining >= 0 ? 'On Track' : 'Over'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.bentoRow}>
                                {/* Compact Small Tile 1 */}
                                <View style={[styles.bentoTile, styles.smallTile, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
                                    <View style={styles.compactRow}>
                                        <Ionicons name={isOnPace ? "leaf" : "speedometer"} size={16} color={isOnPace ? '#10B981' : '#F59E0B'} />
                                        <Text style={[styles.tileLabel, { color: theme.textTertiary, marginLeft: 6 }]}>PACE</Text>
                                    </View>
                                    <Text style={[styles.tileValueSmall, { color: theme.text }]}>₹{dailyBurnRate.toFixed(0)}/d</Text>
                                </View>

                                {/* Compact Small Tile 2 */}
                                <View style={[styles.bentoTile, styles.smallTile, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
                                    <View style={styles.compactRow}>
                                        <Ionicons name="calendar" size={16} color={COLORS.primary} />
                                        <Text style={[styles.tileLabel, { color: theme.textTertiary, marginLeft: 6 }]}>PROGRESS</Text>
                                    </View>
                                    <Text style={[styles.tileValueSmall, { color: theme.text }]}>{Math.round((daysPassed / daysInMonth) * 100)}%</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Category Breakdown */}
                    {monthlyBudget?.allocations && (
                        <BudgetCategoryList
                            allocations={monthlyBudget.allocations}
                            spending={spending}
                            theme={theme}
                            onEditPress={() => navigation.navigate('BudgetSetting')}
                        />
                    )}

                    <View style={{ height: 100 }} />
                </Animated.View>
            </ScrollView>

            {toast && <Toast {...toast} onHide={hideToast} isDarkMode={isDarkMode} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingText: { marginTop: 15, fontSize: FONT_SIZES.base },
    scrollContent: { paddingHorizontal: 20 },
    insightsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        marginBottom: 12,
        paddingLeft: 4,
    },
    bentoGrid: {
        gap: 10,
    },
    bentoRow: {
        flexDirection: 'row',
        gap: 10,
    },
    bentoTile: {
        borderRadius: 20, // Slightly tighter corners
        padding: 14, // Reduced from 20
        borderWidth: 1,
    },
    largeTile: {
        width: '100%',
        minHeight: 70, // Much shorter
        justifyContent: 'center',
    },
    smallTile: {
        flex: 1,
        minHeight: 80, // Much shorter
        justifyContent: 'center',
    },
    tileMainContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    compactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    tileTextContent: {
        flex: 1,
    },
    tileLabel: {
        fontSize: 9, // Shrunk font
        fontFamily: FONTS.bold,
        letterSpacing: 0.5,
    },
    tileValue: {
        fontSize: 22, // Shrunk from 28
        fontFamily: FONTS.bold,
    },
    tileValueSmall: {
        fontSize: 18, // Shrunk from 20
        fontFamily: FONTS.bold,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    badgeText: {
        fontSize: 10,
        fontFamily: FONTS.bold,
    },
    categoriesSection: { marginBottom: 30 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    editLink: { fontSize: FONT_SIZES.base },
    categoryCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    categoryName: { fontSize: FONT_SIZES.base },
    categoryAmount: { fontSize: FONT_SIZES.base },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    categoryFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    categoryPercentage: { fontSize: FONT_SIZES.xs },
    categoryRemaining: { fontSize: FONT_SIZES.xs },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    emptyTitle: {
        fontSize: FONT_SIZES.xxl,
        textAlign: 'center',
        marginBottom: 15,
    },
    emptyMessage: {
        fontSize: FONT_SIZES.base,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 30,
    },
    setupButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 25,
    },
    setupButtonText: {
        color: '#000',
        fontSize: FONT_SIZES.base,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        lineHeight: 20,
    },
});