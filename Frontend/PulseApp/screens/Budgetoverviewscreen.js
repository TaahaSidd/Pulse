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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInDays } from 'date-fns';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { useSalary } from '../hooks/useSalary';
import { useDatabase } from '../context/DatabaseContext';
import SalaryDB from '../database/SalaryDB';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function BudgetOverviewScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const { salary, currentCycle, daysUntilSalary, hasSalary, isLoading: salaryLoading } = useSalary();
    const { isInitialized, db } = useDatabase();
    const { toast, showSuccess, showError, hideToast } = useToast();

    const [cycleBudget, setCycleBudget] = useState(null);
    const [spending, setSpending] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (isInitialized && hasSalary) {
            loadBudgetData();
        } else if (!salaryLoading && !hasSalary) {
            // No salary configured - check if we should show setup
            checkIfSetupAvailable();
        }
    }, [isInitialized, hasSalary, salaryLoading]);

    const checkIfSetupAvailable = async () => {
        try {
            // Get credit transactions to see if we can detect salary
            const credits = await db.getAllTransactions({ type: 'credit' });

            if (credits.length >= 2) {
                // We have enough data - redirect to setup
                navigation.replace('SalaryScreen');
            } else {
                // Not enough data - stay here and show message
                setIsLoading(false);
            }
        } catch (error) {
            console.error('❌ Error checking setup availability:', error);
            setIsLoading(false);
        }
    };

    const loadBudgetData = async () => {
        try {
            setIsLoading(true);

            // Load current cycle budget
            const budget = await SalaryDB.getCurrentCycleBudget();
            setCycleBudget(budget);

            // Load actual spending for current cycle
            if (currentCycle) {
                const startDate = format(currentCycle.startDate, 'yyyy-MM-dd');
                const endDate = format(new Date(), 'yyyy-MM-dd');

                const categories = await db.getSpendingByCategory(startDate, endDate);
                const spendingMap = {};
                categories.forEach(cat => {
                    spendingMap[cat.category] = cat.spent || 0;
                });
                setSpending(spendingMap);
            }

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
    const totalSpent = Object.values(spending).reduce((sum, amt) => sum + amt, 0);
    const budgetAmount = cycleBudget?.total_amount || salary?.amount || 0;
    const remaining = budgetAmount - totalSpent;
    const spentPercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

    // Calculate daily burn rate and projections
    const daysInCycle = currentCycle?.daysInCycle || 30;
    const daysPassed = currentCycle ? daysInCycle - (currentCycle.daysRemaining || 0) : 0;
    const dailyBurnRate = daysPassed > 0 ? totalSpent / daysPassed : 0;
    const projectedSpending = dailyBurnRate * daysInCycle;
    const projectedRemaining = budgetAmount - projectedSpending;
    const safeDailyRate = budgetAmount / daysInCycle;

    // Status
    const isOverBudget = spentPercentage > 100;
    const isWarning = spentPercentage > 80 && !isOverBudget;
    const isOnPace = dailyBurnRate <= safeDailyRate;

    if (isLoading || salaryLoading) {
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

    // Show empty state if no salary and not enough data
    if (!hasSalary && !isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg }]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color={theme.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                        Budget Overview
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.emptyStateContainer}>
                    <View style={[styles.emptyIconCircle, { backgroundColor: theme.cardElevated }]}>
                        <Ionicons name="wallet-outline" size={64} color={theme.textTertiary} />
                    </View>

                    <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                        Budget Not Set Up
                    </Text>

                    <Text style={[styles.emptyMessage, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                        We need a few salary credits to detect your income pattern. Keep using the app and we'll
                        notify you when we can set up your budget automatically!
                    </Text>

                    <TouchableOpacity
                        style={[styles.manualSetupButton, { backgroundColor: COLORS.primary }]}
                        onPress={() => navigation.navigate('SalarySetup')}
                    >
                        <Text style={[styles.manualSetupText, { fontFamily: FONTS.semiBold }]}>
                            Set Up Manually
                        </Text>
                    </TouchableOpacity>

                    <View style={[styles.infoBox, { backgroundColor: COLORS.primary + '15', marginTop: 30 }]}>
                        <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={[styles.infoText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            Tip: Add at least 2 salary credit transactions for automatic detection
                        </Text>
                    </View>
                </View>
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
                    Budget Overview
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('BudgetSetting')}>
                    <Ionicons name="settings-outline" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* Salary Cycle Card */}
                    <View style={[styles.cycleCard, { backgroundColor: theme.cardElevated }]}>
                        {/* Top Row - Date and Days Left */}
                        <View style={styles.cycleHeaderRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.cycleLabel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                                    CURRENT CYCLE
                                </Text>
                                <Text style={[styles.cycleDates, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                    {currentCycle && format(currentCycle.startDate, 'MMM dd')} - {currentCycle && format(currentCycle.endDate, 'MMM dd')}
                                </Text>
                            </View>
                            <View style={[styles.daysLeftBadge, { backgroundColor: COLORS.primary + '20' }]}>
                                <Text style={[styles.daysLeftNumber, { color: COLORS.primary, fontFamily: FONTS.bold }]}>
                                    {daysUntilSalary || 0}
                                </Text>
                                <Text style={[styles.daysLeftLabel, { color: COLORS.primary, fontFamily: FONTS.regular }]}>
                                    days
                                </Text>
                            </View>
                        </View>


                        {/* Main Amount */}
                        <View style={styles.mainAmountContainer}>
                            <Text style={[styles.mainAmountLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                Total Spent
                            </Text>
                            <Text style={[styles.mainAmount, { color: theme.text, fontFamily: FONTS.bold }]}>
                                ₹{totalSpent.toLocaleString()}
                            </Text>
                            <Text style={[styles.budgetLabel, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                                of ₹{budgetAmount.toLocaleString()}
                            </Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={[styles.largeProgressBar, { backgroundColor: theme.border }]}>
                            <View style={[
                                styles.largeProgressFill,
                                {
                                    width: `${Math.min(spentPercentage, 100)}%`,
                                    backgroundColor: isOverBudget ? COLORS.error : isWarning ? '#FF9500' : COLORS.primary,
                                }
                            ]} />
                        </View>

                        <View style={styles.statsGrid}>
                            <View style={styles.statColumn}>
                                <Text style={[styles.statValue, {
                                    color: remaining >= 0 ? COLORS.primary : COLORS.error,
                                    fontFamily: FONTS.bold
                                }]}>
                                    ₹{Math.abs(remaining).toLocaleString()}
                                </Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                    {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                                </Text>
                            </View>

                            <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                            <View style={styles.statColumn}>
                                <Text style={[styles.statValue, {
                                    color: isOverBudget ? COLORS.error : COLORS.primary,
                                    fontFamily: FONTS.bold
                                }]}>
                                    {Math.round(spentPercentage)}%
                                </Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                    Used
                                </Text>
                            </View>

                            <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                            <View style={styles.statColumn}>
                                <Text style={[styles.statValue, { color: theme.text, fontFamily: FONTS.bold }]}>
                                    ₹{dailyBurnRate.toFixed(0)}
                                </Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                    Daily
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Smart Insights */}
                    <View style={styles.insightsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                            Smart Insights
                        </Text>

                        {/* Burn Rate Insight */}
                        <View style={[styles.insightCard, {
                            backgroundColor: isOnPace ? COLORS.primary + '15' : '#FF9500' + '15'
                        }]}>
                            <Ionicons
                                name={isOnPace ? "trending-down" : "trending-up"}
                                size={24}
                                color={isOnPace ? COLORS.primary : '#FF9500'}
                            />
                            <View style={styles.insightContent}>
                                <Text style={[styles.insightTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                    Daily Spending Pace
                                </Text>
                                <Text style={[styles.insightText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                    You're spending ₹{dailyBurnRate.toFixed(0)}/day. {isOnPace
                                        ? `Great! Stay under ₹${safeDailyRate.toFixed(0)}/day to hit your budget.`
                                        : `Slow down! Try to stay under ₹${safeDailyRate.toFixed(0)}/day.`
                                    }
                                </Text>
                            </View>
                        </View>

                        {/* Projection Insight */}
                        <View style={[styles.insightCard, {
                            backgroundColor: projectedRemaining >= 0 ? COLORS.primary + '15' : COLORS.error + '15'
                        }]}>
                            <Ionicons
                                name="analytics-outline"
                                size={24}
                                color={projectedRemaining >= 0 ? COLORS.primary : COLORS.error}
                            />
                            <View style={styles.insightContent}>
                                <Text style={[styles.insightTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                    End of Cycle Forecast
                                </Text>
                                <Text style={[styles.insightText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                    At current pace, you'll spend ₹{projectedSpending.toFixed(0)} total.
                                    {projectedRemaining >= 0
                                        ? ` You'll save ₹${projectedRemaining.toFixed(0)}! 🎉`
                                        : ` You'll overspend by ₹${Math.abs(projectedRemaining).toFixed(0)} ⚠️`
                                    }
                                </Text>
                            </View>
                        </View>

                        {/* Next Salary Countdown */}
                        <View style={[styles.insightCard, { backgroundColor: theme.cardElevated }]}>
                            <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
                            <View style={styles.insightContent}>
                                <Text style={[styles.insightTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                    Next Salary
                                </Text>
                                <Text style={[styles.insightText, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                    {daysUntilSalary === 0
                                        ? 'Today! 💰'
                                        : daysUntilSalary === 1
                                            ? 'Tomorrow! 💸'
                                            : `In ${daysUntilSalary} days - ${currentCycle && format(currentCycle.endDate, 'MMM dd')}`
                                    }
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Category Breakdown */}
                    {cycleBudget?.allocations && (
                        <View style={styles.categoriesSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                                    Category Breakdown
                                </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('BudgetSetting')}>
                                    <Text style={[styles.editLink, { color: COLORS.primary, fontFamily: FONTS.medium }]}>
                                        Edit
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {cycleBudget.allocations.map((allocation, index) => {
                                const spent = spending[allocation.category] || 0;
                                const allocated = allocation.allocated_amount;
                                const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
                                const remaining = allocated - spent;

                                return (
                                    <View key={index} style={[styles.categoryCard, { backgroundColor: theme.card }]}>
                                        <View style={styles.categoryHeader}>
                                            <Text style={[styles.categoryName, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                                {allocation.category}
                                            </Text>
                                            <Text style={[styles.categoryAmount, {
                                                color: percentage > 100 ? COLORS.error : theme.text,
                                                fontFamily: FONTS.bold
                                            }]}>
                                                ₹{spent.toFixed(0)} / ₹{allocated.toLocaleString()}
                                            </Text>
                                        </View>

                                        {/* Progress Bar */}
                                        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                            <View style={[
                                                styles.progressFill,
                                                {
                                                    width: `${Math.min(percentage, 100)}%`,
                                                    backgroundColor: percentage > 100 ? COLORS.error : percentage > 80 ? '#FF9500' : COLORS.primary,
                                                }
                                            ]} />
                                        </View>

                                        <View style={styles.categoryFooter}>
                                            <Text style={[styles.categoryPercentage, {
                                                color: percentage > 100 ? COLORS.error : theme.textSecondary,
                                                fontFamily: FONTS.regular
                                            }]}>
                                                {Math.round(percentage)}% used
                                            </Text>
                                            <Text style={[styles.categoryRemaining, {
                                                color: remaining >= 0 ? theme.textTertiary : COLORS.error,
                                                fontFamily: FONTS.regular
                                            }]}>
                                                {remaining >= 0 ? `₹${remaining.toFixed(0)} left` : `₹${Math.abs(remaining).toFixed(0)} over`}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: { fontSize: FONT_SIZES.lg },
    loadingText: { marginTop: 15, fontSize: FONT_SIZES.base },
    scrollContent: { paddingHorizontal: 20 },
    cycleCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
    },
    cycleHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    cycleLabel: {
        fontSize: FONT_SIZES.xs,
        letterSpacing: 1,
        marginBottom: 4,
    },
    cycleDates: {
        fontSize: FONT_SIZES.base,
    },
    daysLeftBadge: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 60,
    },
    daysLeftNumber: {
        fontSize: 24,
        lineHeight: 28,
    },
    daysLeftLabel: {
        fontSize: FONT_SIZES.xs,
    },

    // Main amount display
    mainAmountContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    mainAmountLabel: {
        fontSize: FONT_SIZES.sm,
        marginBottom: 8,
    },
    mainAmount: {
        fontSize: 40,
        marginBottom: 4,
    },
    budgetLabel: {
        fontSize: FONT_SIZES.base,
    },

    // Large progress bar
    largeProgressBar: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 20,
    },
    largeProgressFill: {
        height: '100%',
        borderRadius: 6,
    },

    // Stats grid (3 columns)
    statsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statColumn: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: FONT_SIZES.lg,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: FONT_SIZES.xs,
    },
    verticalDivider: {
        width: 1,
        height: 40,
        marginHorizontal: 8,
    },
    divider: {
        height: 1,
        marginVertical: 8,
    },

    insightsSection: { marginBottom: 30 },
    sectionTitle: {
        fontSize: FONT_SIZES.xl,
        marginBottom: 15,
    },
    insightCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        gap: 12,
    },
    insightContent: { flex: 1 },
    insightTitle: {
        fontSize: FONT_SIZES.base,
        marginBottom: 4,
    },
    insightText: {
        fontSize: FONT_SIZES.sm,
        lineHeight: 20,
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

    // Empty state styles
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
    manualSetupButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 25,
    },
    manualSetupText: {
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