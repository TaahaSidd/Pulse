// utils/SalaryDetector.js

/**
 * Smart Salary Detection Engine
 * Analyzes transactions to identify recurring salary credits
 */

export class SalaryDetector {
    /**
     * Detect potential salary from transactions
     * @param {Array} transactions - All credit transactions
     * @returns {Object|null} - Detected salary info or null
     */
    static detectSalary(transactions) {
        // Filter only credit transactions
        const credits = transactions.filter(tx => tx.type === 'credit');

        if (credits.length < 2) {
            return null; // Need at least 2 credits to detect pattern
        }

        // Group credits by amount (with 10% tolerance)
        const amountGroups = this.groupByAmount(credits);

        // Find recurring amounts (appears 2+ times)
        const recurringGroups = amountGroups.filter(group => group.transactions.length >= 2);

        if (recurringGroups.length === 0) {
            return null;
        }

        // Score each group based on:
        // 1. Amount (higher = more likely salary)
        // 2. Regularity (monthly pattern)
        // 3. Keywords in merchant name
        // 4. Transaction count
        const scoredGroups = recurringGroups.map(group => ({
            ...group,
            score: this.calculateSalaryScore(group),
        }));

        // Sort by score
        scoredGroups.sort((a, b) => b.score - a.score);

        const topCandidate = scoredGroups[0];

        // Require minimum score of 50 to be confident
        if (topCandidate.score < 50) {
            return null;
        }

        // Extract salary details
        const salaryAmount = topCandidate.amount;
        const lastSalaryDate = topCandidate.transactions[0].date;
        const pattern = this.detectDatePattern(topCandidate.transactions);

        return {
            amount: salaryAmount,
            lastDate: lastSalaryDate,
            dayOfMonth: pattern.dayOfMonth,
            confidence: Math.min(topCandidate.score, 100),
            transactions: topCandidate.transactions,
            source: topCandidate.transactions[0].merchant || 'Unknown',
        };
    }

    /**
     * Group transactions by similar amounts (±10% tolerance)
     */
    static groupByAmount(transactions) {
        const groups = [];

        transactions.forEach(tx => {
            const amount = tx.amount;

            // Find existing group with similar amount
            let foundGroup = groups.find(group => {
                const diff = Math.abs(group.amount - amount);
                const tolerance = group.amount * 0.1; // 10% tolerance
                return diff <= tolerance;
            });

            if (foundGroup) {
                foundGroup.transactions.push(tx);
                // Update group amount to average
                foundGroup.amount = foundGroup.transactions.reduce((sum, t) => sum + t.amount, 0) / foundGroup.transactions.length;
            } else {
                groups.push({
                    amount,
                    transactions: [tx],
                });
            }
        });

        return groups;
    }

    /**
     * Calculate salary likelihood score (0-100)
     */
    static calculateSalaryScore(group) {
        let score = 0;

        // 1. Amount score (higher amounts more likely salary)
        if (group.amount >= 100000) score += 30; // ₹1L+
        else if (group.amount >= 50000) score += 25; // ₹50K+
        else if (group.amount >= 30000) score += 20; // ₹30K+
        else if (group.amount >= 20000) score += 15; // ₹20K+
        else if (group.amount >= 10000) score += 10; // ₹10K+
        else score += 5; // Less likely

        // 2. Regularity score (monthly pattern)
        const regularity = this.checkRegularity(group.transactions);
        score += regularity * 25; // Up to 25 points

        // 3. Keyword score (salary-related terms)
        const hasKeywords = group.transactions.some(tx =>
            /salary|payroll|wages|income|pay|neft|imps|transfer/i.test(tx.merchant || '') ||
            /salary|payroll|wages|income/i.test(tx.rawSms || '')
        );
        if (hasKeywords) score += 20;

        // 4. Recurrence count (more occurrences = more confident)
        const count = group.transactions.length;
        if (count >= 6) score += 15; // 6+ months
        else if (count >= 4) score += 12; // 4-5 months
        else if (count >= 3) score += 10; // 3 months
        else if (count >= 2) score += 8;  // 2 months

        // 5. Same day of month pattern
        const pattern = this.detectDatePattern(group.transactions);
        if (pattern.consistent) score += 10;

        return Math.round(score);
    }

    /**
     * Check if transactions occur at regular monthly intervals
     */
    static checkRegularity(transactions) {
        if (transactions.length < 2) return 0;

        const dates = transactions.map(tx => new Date(tx.date)).sort((a, b) => b - a);
        const intervals = [];

        for (let i = 0; i < dates.length - 1; i++) {
            const daysDiff = Math.abs((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
            intervals.push(daysDiff);
        }

        // Check if intervals are close to 30 days (±7 days tolerance)
        const monthlyIntervals = intervals.filter(days => days >= 23 && days <= 37);
        const regularityScore = monthlyIntervals.length / intervals.length;

        return regularityScore; // 0-1
    }

    /**
     * Detect the day of month pattern
     */
    static detectDatePattern(transactions) {
        const daysOfMonth = transactions.map(tx => {
            const date = new Date(tx.date);
            return date.getDate();
        });

        // Check if most transactions happen on the same day (±2 days)
        const dayGroups = {};
        daysOfMonth.forEach(day => {
            // Group days within ±2 range
            const key = Math.floor(day / 3) * 3; // Group in buckets of 3
            dayGroups[key] = (dayGroups[key] || 0) + 1;
        });

        const mostCommonGroup = Object.entries(dayGroups).sort((a, b) => b[1] - a[1])[0];
        const mostCommonDay = parseInt(mostCommonGroup[0]);
        const consistency = mostCommonGroup[1] / daysOfMonth.length;

        // Find the actual most common day
        const dayFrequency = {};
        daysOfMonth.forEach(day => {
            dayFrequency[day] = (dayFrequency[day] || 0) + 1;
        });
        const actualMostCommonDay = parseInt(
            Object.entries(dayFrequency).sort((a, b) => b[1] - a[1])[0][0]
        );

        return {
            dayOfMonth: actualMostCommonDay,
            consistent: consistency >= 0.7, // 70% on same day
            variance: Math.max(...daysOfMonth) - Math.min(...daysOfMonth),
        };
    }

    /**
     * Predict next salary date based on pattern
     */
    static predictNextSalary(lastSalaryDate, dayOfMonth) {
        const lastDate = new Date(lastSalaryDate);
        const currentDate = new Date();

        // Start with next month
        let nextSalary = new Date(lastDate);
        nextSalary.setMonth(nextSalary.getMonth() + 1);
        nextSalary.setDate(dayOfMonth);

        // If that's in the past, go to the month after
        if (nextSalary < currentDate) {
            nextSalary.setMonth(nextSalary.getMonth() + 1);
        }

        return nextSalary;
    }

    /**
     * Calculate days until next salary
     */
    static daysUntilNextSalary(nextSalaryDate) {
        const now = new Date();
        const next = new Date(nextSalaryDate);
        const diff = next - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return Math.max(0, days);
    }

    /**
     * Get current budget cycle dates (from last salary to next salary)
     */
    static getCurrentCycle(lastSalaryDate, dayOfMonth) {
        const lastDate = new Date(lastSalaryDate);
        const nextDate = this.predictNextSalary(lastSalaryDate, dayOfMonth);

        return {
            startDate: lastDate,
            endDate: nextDate,
            daysInCycle: Math.ceil((nextDate - lastDate) / (1000 * 60 * 60 * 24)),
            daysRemaining: this.daysUntilNextSalary(nextDate),
        };
    }

    /**
     * Suggest category budgets based on past spending
     */
    static suggestBudgetAllocations(salaryAmount, pastSpending) {
        const suggestions = [];
        const totalSpent = Object.values(pastSpending).reduce((sum, amt) => sum + amt, 0);

        // Calculate what % of salary was spent on each category
        Object.entries(pastSpending).forEach(([category, spent]) => {
            const percentage = spent / totalSpent;
            const suggested = Math.round(salaryAmount * percentage);

            suggestions.push({
                category,
                suggestedAmount: suggested,
                percentage: Math.round(percentage * 100),
                pastAverage: spent,
            });
        });

        return suggestions;
    }
}

export default SalaryDetector;