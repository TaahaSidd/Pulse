// screens/SalarySetupScreen.js
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { getThemedColors, COLORS } from '../constants/Colors';
import { FONTS, FONT_SIZES } from '../constants/Fonts';
import { useSalary } from '../hooks/useSalary';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

export default function SalarySetupScreen({ navigation, isDarkMode = true }) {
    const theme = getThemedColors(isDarkMode);
    const { detectedSalary, confirmDetectedSalary, setManualSalary, isLoading } = useSalary();
    const { toast, showSuccess, showError, hideToast } = useToast();

    const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
    const [amount, setAmount] = useState('');
    const [dayOfMonth, setDayOfMonth] = useState('');
    const [lastSalaryDate, setLastSalaryDate] = useState('');
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        const initializeScreen = async () => {
            if (detectedSalary) {
                // Auto-detected salary exists
                setAmount(detectedSalary.amount.toString());
                setDayOfMonth(detectedSalary.dayOfMonth.toString());
                setLastSalaryDate(detectedSalary.lastDate);
                setMode('auto');
            } else {
                // No auto-detection - default to manual
                setMode('manual');
                // Set default last salary date to today
                setLastSalaryDate(format(new Date(), 'yyyy-MM-dd'));
                // Set default day to 1st of month
                setDayOfMonth('1');
            }

            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        };

        initializeScreen();
    }, [detectedSalary]);

    const handleConfirm = async () => {
        try {
            const salaryAmount = parseInt(amount);
            const day = parseInt(dayOfMonth);

            // Validation
            if (!salaryAmount || salaryAmount < 1000) {
                showError('Invalid Amount', 'Please enter a valid salary amount');
                return;
            }

            if (!day || day < 1 || day > 31) {
                showError('Invalid Day', 'Day must be between 1 and 31');
                return;
            }

            if (!lastSalaryDate) {
                showError('Invalid Date', 'Please select when you last received salary');
                return;
            }

            let success = false;

            if (mode === 'auto' && detectedSalary) {
                success = await confirmDetectedSalary(salaryAmount);
            } else {
                success = await setManualSalary(salaryAmount, day, lastSalaryDate);
            }

            if (success) {
                showSuccess(
                    'Salary Configured! 🎉',
                    `₹${salaryAmount.toLocaleString()} on ${day}th of every month`
                );

                setTimeout(() => {
                    navigation.navigate('BudgetOverview');
                }, 1500);
            } else {
                showError('Setup Failed', 'Could not save salary information');
            }
        } catch (error) {
            console.error('❌ Error confirming salary:', error);
            showError('Error', 'An error occurred while setting up salary');
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                    Analyzing your transactions...
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
                    <Ionicons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                    Salary Setup
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Animated.View style={{ opacity: fadeAnim }}>

                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '20' }]}>
                            <Ionicons name="wallet" size={48} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.heroTitle, { color: theme.text, fontFamily: FONTS.bold }]}>
                            {detectedSalary ? 'We Found Your Salary!' : 'Set Up Your Salary'}
                        </Text>
                        <Text style={[styles.heroSubtitle, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                            {detectedSalary
                                ? 'We analyzed your transactions and detected a recurring income pattern'
                                : 'Tell us about your monthly salary to unlock smart budget tracking'}
                        </Text>
                    </View>

                    {/* Detection Result */}
                    {detectedSalary && (
                        <View style={[styles.detectionCard, { backgroundColor: theme.cardElevated }]}>
                            <View style={styles.detectionHeader}>
                                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                                <Text style={[styles.detectionTitle, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                    Auto-Detected Salary
                                </Text>
                            </View>

                            <View style={styles.detectionStats}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                        Amount
                                    </Text>
                                    <Text style={[styles.statValue, { color: theme.text, fontFamily: FONTS.bold }]}>
                                        ₹{detectedSalary.amount.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={styles.statDivider} />

                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                        Day of Month
                                    </Text>
                                    <Text style={[styles.statValue, { color: theme.text, fontFamily: FONTS.bold }]}>
                                        {detectedSalary.dayOfMonth}th
                                    </Text>
                                </View>

                                <View style={styles.statDivider} />

                                <View style={styles.statItem}>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: FONTS.regular }]}>
                                        Confidence
                                    </Text>
                                    <Text style={[styles.statValue, { color: COLORS.primary, fontFamily: FONTS.bold }]}>
                                        {Math.round(detectedSalary.confidence)}%
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.sourceInfo}>
                                <Ionicons name="information-circle-outline" size={16} color={theme.textTertiary} />
                                <Text style={[styles.sourceText, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                                    Source: {detectedSalary.source}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Mode Toggle */}
                    <View style={styles.modeToggle}>
                        <TouchableOpacity
                            style={[
                                styles.modeButton,
                                { backgroundColor: theme.card },
                                mode === 'auto' && styles.modeButtonActive,
                                mode === 'auto' && { backgroundColor: COLORS.primary + '20' },
                            ]}
                            onPress={() => setMode('auto')}
                            disabled={!detectedSalary}
                        >
                            <Ionicons
                                name="flash"
                                size={20}
                                color={mode === 'auto' ? COLORS.primary : theme.textSecondary}
                            />
                            <Text
                                style={[
                                    styles.modeButtonText,
                                    { color: mode === 'auto' ? COLORS.primary : theme.textSecondary, fontFamily: FONTS.medium },
                                ]}
                            >
                                Auto-Detected
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.modeButton,
                                { backgroundColor: theme.card },
                                mode === 'manual' && styles.modeButtonActive,
                                mode === 'manual' && { backgroundColor: COLORS.primary + '20' },
                            ]}
                            onPress={() => setMode('manual')}
                        >
                            <Ionicons
                                name="create-outline"
                                size={20}
                                color={mode === 'manual' ? COLORS.primary : theme.textSecondary}
                            />
                            <Text
                                style={[
                                    styles.modeButtonText,
                                    { color: mode === 'manual' ? COLORS.primary : theme.textSecondary, fontFamily: FONTS.medium },
                                ]}
                            >
                                Manual Entry
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.inputSection}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                                Monthly Salary Amount
                            </Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
                                <Text style={[styles.currencySymbol, { color: theme.textTertiary, fontFamily: FONTS.bold }]}>
                                    ₹
                                </Text>
                                <TextInput
                                    style={[styles.input, { color: theme.text, fontFamily: FONTS.semiBold }]}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    placeholder="50,000"
                                    placeholderTextColor={theme.textTertiary}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                                Salary Day (1-31)
                            </Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
                                <TextInput
                                    style={[styles.input, { color: theme.text, fontFamily: FONTS.semiBold }]}
                                    value={dayOfMonth}
                                    onChangeText={setDayOfMonth}
                                    keyboardType="numeric"
                                    placeholder="25"
                                    placeholderTextColor={theme.textTertiary}
                                    maxLength={2}
                                />
                                <Text style={[styles.inputSuffix, { color: theme.textTertiary, fontFamily: FONTS.regular }]}>
                                    of every month
                                </Text>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: theme.textSecondary, fontFamily: FONTS.medium }]}>
                                Last Salary Date
                            </Text>
                            <View style={[styles.inputWrapper, { backgroundColor: theme.card }]}>
                                <Ionicons name="calendar-outline" size={20} color={theme.textTertiary} />
                                <Text style={[styles.dateText, { color: theme.text, fontFamily: FONTS.semiBold }]}>
                                    {lastSalaryDate ? format(new Date(lastSalaryDate), 'dd MMM yyyy') : 'Select date'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Info Box */}
                    <View style={[styles.infoBox, { backgroundColor: COLORS.primary + '15' }]}>
                        <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
                        <Text style={[styles.infoText, { color: theme.text, fontFamily: FONTS.regular }]}>
                            We'll create budget cycles from salary to salary (e.g., 25th to 24th) instead of calendar months.
                            This helps you track spending aligned with your actual cash flow! 💰
                        </Text>
                    </View>

                    <View style={{ height: 120 }} />
                </Animated.View>
            </ScrollView>

            {/* Confirm Button */}
            <View style={[styles.footer, { backgroundColor: theme.bg }]}>
                <TouchableOpacity
                    style={[styles.confirmButton, { backgroundColor: COLORS.primary }]}
                    onPress={handleConfirm}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.confirmText, { fontFamily: FONTS.bold }]}>
                        Continue to Budget Setup
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#000" />
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
    loadingText: { marginTop: 15, fontSize: FONT_SIZES.base },
    scrollContent: { paddingHorizontal: 20 },
    heroSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: FONT_SIZES.xxl,
        textAlign: 'center',
        marginBottom: 10,
    },
    heroSubtitle: {
        fontSize: FONT_SIZES.base,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    detectionCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
    },
    detectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 10,
    },
    detectionTitle: { fontSize: FONT_SIZES.lg },
    detectionStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: FONT_SIZES.xs, marginBottom: 5 },
    statValue: { fontSize: FONT_SIZES.xl },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 10 },
    sourceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 10,
    },
    sourceText: { fontSize: FONT_SIZES.xs },
    modeToggle: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    modeButtonActive: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    modeButtonText: { fontSize: FONT_SIZES.base },
    inputSection: { gap: 20, marginBottom: 25 },
    inputGroup: {},
    inputLabel: {
        fontSize: FONT_SIZES.sm,
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 10,
    },
    currencySymbol: { fontSize: FONT_SIZES.xl },
    input: {
        flex: 1,
        fontSize: FONT_SIZES.xl,
    },
    inputSuffix: { fontSize: FONT_SIZES.sm },
    dateText: { flex: 1, fontSize: FONT_SIZES.lg },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        lineHeight: 20,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 20,
    },
    confirmButton: {
        flexDirection: 'row',
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    confirmText: { color: '#000', fontSize: FONT_SIZES.lg },
});