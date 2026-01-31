// hooks/useSalary.js
import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import SalaryDB from '../database/SalaryDB';
import SalaryDetector from '../utils/SalaryDetector';

/**
 * Custom hook for salary detection and management
 */
export const useSalary = () => {
    const { isInitialized, db } = useDatabase();
    const [salary, setSalary] = useState(null);
    const [detectedSalary, setDetectedSalary] = useState(null);
    const [currentCycle, setCurrentCycle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isInitialized) {
            loadSalaryData();
        }
    }, [isInitialized]);

    /**
     * Load existing salary info or try to detect it
     */
    const loadSalaryData = async () => {
        try {
            setIsLoading(true);

            // Check if user already has salary configured
            const existingSalary = await SalaryDB.getActiveSalary();

            if (existingSalary) {
                setSalary(existingSalary);

                // Calculate current cycle
                const cycle = SalaryDetector.getCurrentCycle(
                    existingSalary.last_salary_date,
                    existingSalary.day_of_month
                );
                setCurrentCycle(cycle);
            } else {
                // Try to auto-detect salary from transactions
                await detectSalaryFromTransactions();
            }
        } catch (error) {
            console.error('❌ Error loading salary data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Attempt to auto-detect salary from existing transactions
     */
    const detectSalaryFromTransactions = async () => {
        try {
            // Get all transactions from the last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const startDate = sixMonthsAgo.toISOString().split('T')[0];

            const transactions = await db.getAllTransactions({
                startDate,
                type: 'credit',
            });

            if (transactions.length < 2) {
                console.log('📊 Not enough transactions to detect salary');
                return null;
            }

            // Run detection algorithm
            const detected = SalaryDetector.detectSalary(transactions);

            if (detected && detected.confidence >= 60) {
                console.log('✅ Salary detected with confidence:', detected.confidence);
                setDetectedSalary(detected);
                return detected;
            } else {
                console.log('📊 No clear salary pattern detected');
                return null;
            }
        } catch (error) {
            console.error('❌ Error detecting salary:', error);
            return null;
        }
    };

    /**
     * Confirm detected salary and save to database
     */
    const confirmDetectedSalary = async (adjustedAmount = null) => {
        try {
            if (!detectedSalary) {
                throw new Error('No detected salary to confirm');
            }

            const amount = adjustedAmount || detectedSalary.amount;
            const nextSalaryDate = SalaryDetector.predictNextSalary(
                detectedSalary.lastDate,
                detectedSalary.dayOfMonth
            );

            const result = await SalaryDB.saveSalaryInfo({
                amount,
                dayOfMonth: detectedSalary.dayOfMonth,
                lastSalaryDate: detectedSalary.lastDate,
                nextSalaryDate: nextSalaryDate.toISOString().split('T')[0],
                source: detectedSalary.source,
                confidenceScore: detectedSalary.confidence,
                autoDetected: true,
            });

            if (result.success) {
                await loadSalaryData(); // Reload
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error confirming salary:', error);
            throw error;
        }
    };

    /**
     * Manually set salary (when auto-detection fails or user prefers manual)
     */
    const setManualSalary = async (amount, dayOfMonth, lastSalaryDate) => {
        try {
            const lastDate = new Date(lastSalaryDate);
            const nextSalaryDate = SalaryDetector.predictNextSalary(
                lastSalaryDate,
                dayOfMonth
            );

            const result = await SalaryDB.saveSalaryInfo({
                amount,
                dayOfMonth,
                lastSalaryDate: lastDate.toISOString().split('T')[0],
                nextSalaryDate: nextSalaryDate.toISOString().split('T')[0],
                source: 'Manual Entry',
                confidenceScore: 100,
                autoDetected: false,
            });

            if (result.success) {
                await loadSalaryData(); // Reload
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error setting manual salary:', error);
            throw error;
        }
    };

    /**
     * Update salary info
     */
    const updateSalary = async (newAmount, newDayOfMonth) => {
        try {
            if (!salary) {
                throw new Error('No active salary to update');
            }

            // Calculate new next salary date
            const nextSalaryDate = SalaryDetector.predictNextSalary(
                salary.last_salary_date,
                newDayOfMonth
            );

            await SalaryDB.saveSalaryInfo({
                amount: newAmount,
                dayOfMonth: newDayOfMonth,
                lastSalaryDate: salary.last_salary_date,
                nextSalaryDate: nextSalaryDate.toISOString().split('T')[0],
                source: salary.source,
                confidenceScore: salary.confidence_score,
                autoDetected: salary.auto_detected === 1,
            });

            await loadSalaryData();
            return true;
        } catch (error) {
            console.error('❌ Error updating salary:', error);
            throw error;
        }
    };

    /**
     * Delete salary configuration
     */
    const deleteSalary = async () => {
        try {
            if (!salary) return false;

            await SalaryDB.deleteSalary(salary.id);
            setSalary(null);
            setCurrentCycle(null);
            return true;
        } catch (error) {
            console.error('❌ Error deleting salary:', error);
            throw error;
        }
    };

    /**
     * Get days until next salary
     */
    const getDaysUntilSalary = () => {
        if (!salary) return null;
        return SalaryDetector.daysUntilNextSalary(salary.next_salary_date);
    };

    /**
     * Check if salary date has passed (time to update)
     */
    const isSalaryDatePassed = () => {
        if (!salary) return false;
        const now = new Date();
        const nextSalary = new Date(salary.next_salary_date);
        return now >= nextSalary;
    };

    return {
        salary,
        detectedSalary,
        currentCycle,
        isLoading,
        hasSalary: !!salary,
        hasDetectedSalary: !!detectedSalary,
        daysUntilSalary: getDaysUntilSalary(),
        isSalaryDatePassed: isSalaryDatePassed(),

        // Actions
        detectSalary: detectSalaryFromTransactions,
        confirmDetectedSalary,
        setManualSalary,
        updateSalary,
        deleteSalary,
        refresh: loadSalaryData,
    };
};

export default useSalary;