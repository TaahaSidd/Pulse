import * as SQLite from 'expo-sqlite';

class BudgetDB {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize budget tables
     */
    async init(database) {
        try {
            this.db = database;

            // Create budgets table
            await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          month TEXT NOT NULL,
          year INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          UNIQUE(month, year)
        );
      `);

            // Create budget allocations table
            await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS budget_allocations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          budget_id INTEGER NOT NULL,
          category TEXT NOT NULL,
          allocated_amount REAL NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT,
          FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
          UNIQUE(budget_id, category)
        );
      `);

            // Create indexes
            await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);
        CREATE INDEX IF NOT EXISTS idx_allocations_budget ON budget_allocations(budget_id);
      `);

            console.log('✅ Budget tables initialized');
            return true;
        } catch (error) {
            console.error('❌ Budget table initialization failed:', error);
            throw error;
        }
    }

    /**
     * Save or update budget for a month
     */
    async saveBudget(month, year, totalAmount, allocations) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }

            const now = new Date().toISOString();

            // Check if budget exists for this month
            const existing = await this.db.getFirstAsync(
                'SELECT id FROM budgets WHERE month = ? AND year = ?',
                [month, year]
            );

            let budgetId;

            if (existing) {
                // Update existing budget
                await this.db.runAsync(
                    'UPDATE budgets SET total_amount = ?, updated_at = ? WHERE id = ?',
                    [totalAmount, now, existing.id]
                );
                budgetId = existing.id;

                // Delete old allocations
                await this.db.runAsync(
                    'DELETE FROM budget_allocations WHERE budget_id = ?',
                    [budgetId]
                );
            } else {
                // Insert new budget
                const result = await this.db.runAsync(
                    'INSERT INTO budgets (month, year, total_amount, created_at) VALUES (?, ?, ?, ?)',
                    [month, year, totalAmount, now]
                );
                budgetId = result.lastInsertRowId;
            }

            // Insert allocations
            for (const allocation of allocations) {
                await this.db.runAsync(
                    `INSERT INTO budget_allocations (budget_id, category, allocated_amount, created_at) 
           VALUES (?, ?, ?, ?)`,
                    [budgetId, allocation.category, allocation.amount, now]
                );
            }

            console.log('✅ Budget saved with ID:', budgetId);
            return { success: true, budgetId };
        } catch (error) {
            console.error('❌ Error saving budget:', error);
            throw error;
        }
    }

    /**
     * Get budget for specific month/year
     */
    async getBudget(month, year) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }

            const budget = await this.db.getFirstAsync(
                'SELECT * FROM budgets WHERE month = ? AND year = ?',
                [month, year]
            );

            if (!budget) {
                return null;
            }

            // Get allocations
            const statement = await this.db.prepareAsync(
                'SELECT * FROM budget_allocations WHERE budget_id = ?'
            );
            const result = await statement.executeAsync([budget.id]);
            const allocations = await result.getAllAsync();
            await statement.finalizeAsync();

            return {
                ...budget,
                allocations,
            };
        } catch (error) {
            console.error('❌ Error getting budget:', error);
            return null;
        }
    }

    /**
     * Get current month's budget
     */
    async getCurrentBudget() {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();

        return this.getBudget(month, year);
    }

    /**
     * Get budget summary (for insights/dashboard)
     */
    async getBudgetSummary(month, year) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }

            const budget = await this.getBudget(month, year);

            if (!budget) {
                return null;
            }

            // Get actual spending per category for this month
            // This would integrate with your transaction data

            return {
                totalBudget: budget.total_amount,
                allocations: budget.allocations,
            };
        } catch (error) {
            console.error('❌ Error getting budget summary:', error);
            return null;
        }
    }

    /**
     * Delete budget
     */
    async deleteBudget(month, year) {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }

            await this.db.runAsync(
                'DELETE FROM budgets WHERE month = ? AND year = ?',
                [month, year]
            );

            console.log('✅ Budget deleted');
            return true;
        } catch (error) {
            console.error('❌ Error deleting budget:', error);
            throw error;
        }
    }

    /**
     * Get all budgets
     */
    async getAllBudgets() {
        try {
            if (!this.db) {
                throw new Error('Database not initialized');
            }

            const statement = await this.db.prepareAsync(
                'SELECT * FROM budgets ORDER BY year DESC, month DESC'
            );
            const result = await statement.executeAsync();
            const budgets = await result.getAllAsync();
            await statement.finalizeAsync();

            return budgets;
        } catch (error) {
            console.error('❌ Error getting all budgets:', error);
            return [];
        }
    }
}

// Export singleton instance
export default new BudgetDB();