// database/SalaryDB.js
import * as SQLite from 'expo-sqlite';

class SalaryDB {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize salary tables
     */
    async init(database) {
        try {
            this.db = database;

            // Create salary_info table
            await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS salary_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          day_of_month INTEGER NOT NULL,
          last_salary_date TEXT NOT NULL,
          next_salary_date TEXT NOT NULL,
          source TEXT,
          confidence_score INTEGER,
          auto_detected INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT
        );
      `);

            // Create salary_based_budgets table (different from regular budgets)
            await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS salary_based_budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          salary_id INTEGER NOT NULL,
          cycle_start_date TEXT NOT NULL,
          cycle_end_date TEXT NOT NULL,
          total_amount REAL NOT NULL,
          savings_goal REAL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (salary_id) REFERENCES salary_info(id) ON DELETE CASCADE,
          UNIQUE(salary_id, cycle_start_date)
        );
      `);

            // Create salary_budget_allocations table
            await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS salary_budget_allocations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          salary_budget_id INTEGER NOT NULL,
          category TEXT NOT NULL,
          allocated_amount REAL NOT NULL,
          suggested_amount REAL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (salary_budget_id) REFERENCES salary_based_budgets(id) ON DELETE CASCADE,
          UNIQUE(salary_budget_id, category)
        );
      `);

            // Create indexes
            await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_salary_active ON salary_info(is_active);
        CREATE INDEX IF NOT EXISTS idx_salary_budgets_cycle ON salary_based_budgets(cycle_start_date, cycle_end_date);
      `);

            console.log('✅ Salary tables initialized');
            return true;
        } catch (error) {
            console.error('❌ Salary table initialization failed:', error);
            throw error;
        }
    }

    /**
     * Save detected or manually entered salary info
     */
    async saveSalaryInfo(salaryData) {
        try {
            if (!this.db) throw new Error('Database not initialized');

            const now = new Date().toISOString();

            const {
                amount,
                dayOfMonth,
                lastSalaryDate,
                nextSalaryDate,
                source = 'Manual',
                confidenceScore = 100,
                autoDetected = false,
            } = salaryData;

            // Deactivate any existing active salary
            await this.db.runAsync(
                'UPDATE salary_info SET is_active = 0, updated_at = ? WHERE is_active = 1',
                [now]
            );

            // Insert new salary info
            const result = await this.db.runAsync(
                `INSERT INTO salary_info (
          amount, day_of_month, last_salary_date, next_salary_date,
          source, confidence_score, auto_detected, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
                [
                    amount,
                    dayOfMonth,
                    lastSalaryDate,
                    nextSalaryDate,
                    source,
                    confidenceScore,
                    autoDetected ? 1 : 0,
                    now,
                ]
            );

            console.log('✅ Salary info saved with ID:', result.lastInsertRowId);
            return { success: true, salaryId: result.lastInsertRowId };
        } catch (error) {
            console.error('❌ Error saving salary info:', error);
            throw error;
        }
    }

    /**
     * Get active salary info
     */
    async getActiveSalary() {
        try {
            if (!this.db) throw new Error('Database not initialized');

            const salary = await this.db.getFirstAsync(
                'SELECT * FROM salary_info WHERE is_active = 1'
            );

            return salary;
        } catch (error) {
            console.error('❌ Error getting active salary:', error);
            return null;
        }
    }

    /**
     * Update next salary date (called when new salary is detected)
     */
    async updateNextSalaryDate(salaryId, newDate) {
        try {
            if (!this.db) throw new Error('Database not initialized');

            await this.db.runAsync(
                'UPDATE salary_info SET next_salary_date = ?, updated_at = ? WHERE id = ?',
                [newDate, new Date().toISOString(), salaryId]
            );

            console.log('✅ Next salary date updated');
            return true;
        } catch (error) {
            console.error('❌ Error updating next salary date:', error);
            throw error;
        }
    }

    /**
     * Create budget for current salary cycle
     */
    async createSalaryCycleBudget(salaryId, cycleStart, cycleEnd, totalAmount, allocations, savingsGoal = 0) {
        try {
            if (!this.db) throw new Error('Database not initialized');

            const now = new Date().toISOString();

            // Check if budget already exists for this cycle
            const existing = await this.db.getFirstAsync(
                'SELECT id FROM salary_based_budgets WHERE salary_id = ? AND cycle_start_date = ?',
                [salaryId, cycleStart]
            );

            let budgetId;

            if (existing) {
                // Update existing
                await this.db.runAsync(
                    'UPDATE salary_based_budgets SET total_amount = ?, savings_goal = ?, updated_at = ? WHERE id = ?',
                    [totalAmount, savingsGoal, now, existing.id]
                );
                budgetId = existing.id;

                // Delete old allocations
                await this.db.runAsync(
                    'DELETE FROM salary_budget_allocations WHERE salary_budget_id = ?',
                    [budgetId]
                );
            } else {
                // Insert new budget
                const result = await this.db.runAsync(
                    `INSERT INTO salary_based_budgets (
            salary_id, cycle_start_date, cycle_end_date, total_amount, savings_goal, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [salaryId, cycleStart, cycleEnd, totalAmount, savingsGoal, now]
                );
                budgetId = result.lastInsertRowId;
            }

            // Insert allocations
            for (const allocation of allocations) {
                await this.db.runAsync(
                    `INSERT INTO salary_budget_allocations (
            salary_budget_id, category, allocated_amount, suggested_amount, created_at
          ) VALUES (?, ?, ?, ?, ?)`,
                    [
                        budgetId,
                        allocation.category,
                        allocation.allocatedAmount,
                        allocation.suggestedAmount || null,
                        now,
                    ]
                );
            }

            console.log('✅ Salary cycle budget created with ID:', budgetId);
            return { success: true, budgetId };
        } catch (error) {
            console.error('❌ Error creating salary cycle budget:', error);
            throw error;
        }
    }

    /**
     * Get budget for current salary cycle
     */
    async getCurrentCycleBudget() {
        try {
            if (!this.db) throw new Error('Database not initialized');

            const salary = await this.getActiveSalary();
            if (!salary) return null;

            const now = new Date().toISOString().split('T')[0];

            // Find budget where current date is between cycle_start and cycle_end
            const budget = await this.db.getFirstAsync(
                `SELECT * FROM salary_based_budgets 
         WHERE salary_id = ? 
         AND cycle_start_date <= ? 
         AND cycle_end_date >= ?
         ORDER BY cycle_start_date DESC
         LIMIT 1`,
                [salary.id, now, now]
            );

            if (!budget) return null;

            // Get allocations
            const statement = await this.db.prepareAsync(
                'SELECT * FROM salary_budget_allocations WHERE salary_budget_id = ?'
            );
            const result = await statement.executeAsync([budget.id]);
            const allocations = await result.getAllAsync();
            await statement.finalizeAsync();

            return {
                ...budget,
                salary,
                allocations,
            };
        } catch (error) {
            console.error('❌ Error getting current cycle budget:', error);
            return null;
        }
    }

    /**
     * Delete salary info
     */
    async deleteSalary(salaryId) {
        try {
            if (!this.db) throw new Error('Database not initialized');

            await this.db.runAsync('DELETE FROM salary_info WHERE id = ?', [salaryId]);
            console.log('✅ Salary info deleted');
            return true;
        } catch (error) {
            console.error('❌ Error deleting salary:', error);
            throw error;
        }
    }
}

// Export singleton instance
export default new SalaryDB();