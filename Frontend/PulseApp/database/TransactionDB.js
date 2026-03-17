// database/TransactionDB.js
import * as SQLite from 'expo-sqlite';
import BudgetDB from './BudgetDB';
import SalaryDB from './SalaryDB';

/**
 * SQLite Database Service for Pulse
 * Handles all local transaction storage
 */

class TransactionDB {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize database connection and create tables
   */
  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('pulse.db');

      // Create transactions table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hash TEXT UNIQUE NOT NULL,
          
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          date TEXT NOT NULL,
          merchant TEXT,
          category TEXT,
          bank TEXT,
          transaction_method TEXT,
          
          raw_sms TEXT,
          sender_name TEXT,
          account_number TEXT,
          account_number_masked TEXT,
          ref_number TEXT,
          
          synced_to_backend INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT
        );
      `);

      // Create indexes for faster queries
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_hash ON transactions(hash);
        CREATE INDEX IF NOT EXISTS idx_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_category ON transactions(category);
        CREATE INDEX IF NOT EXISTS idx_type ON transactions(type);
      `);

      // Initialize budget tables
      await BudgetDB.init(this.db);

      // ✅ ADDED THIS LINE - Initialize salary tables
      await SalaryDB.init(this.db);

      console.log('✅ Database initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Save a parsed transaction (with duplicate check)
   */
  async saveTransaction(transaction) {
    try {
      const existing = await this.db.getFirstAsync(
        'SELECT id FROM transactions WHERE hash = ?',
        [transaction.hash]
      );

      if (existing) {
        console.log('⚠️ Duplicate transaction detected, skipping save');
        return { success: false, reason: 'duplicate', existingId: existing.id };
      }

      // Insert new transaction
      const result = await this.db.runAsync(
        `INSERT INTO transactions (
          hash, amount, type, date, merchant, category, bank, 
          transaction_method, raw_sms, sender_name, account_number, 
          account_number_masked, ref_number, synced_to_backend, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transaction.hash,
          transaction.amount,
          transaction.type,
          transaction.date,
          transaction.merchant || 'Unknown',
          transaction.category || 'Others',
          transaction.bank || 'Unknown',
          transaction.transactionMethod || 'Other',
          transaction.rawSms || null,
          transaction.senderName || null,
          transaction.accountNumber || null,
          transaction.accountNumberMasked || null,
          transaction.refNumber || null,
          0, // Not synced yet
          transaction.timestamp || new Date().toISOString(),
        ]
      );

      console.log('✅ Transaction saved with ID:', result.lastInsertRowId);
      return { success: true, id: result.lastInsertRowId };
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
      throw error;
    }
  }


  /**
   * Update an existing transaction (Merchant, Amount, Category, Date, etc.)
   */
  async updateTransaction(id, updatedData) {
    console.log('🔵 DB updateTransaction - id:', id, 'type:', updatedData.type); // <-- ADD

    try {
      if (!this.db) throw new Error('Database not initialized');

      const result = await this.db.runAsync(
        `UPDATE transactions
        SET amount = ?,
        merchant = ?,
        category = ?,
        type = ?,
        date = ?,
        bank = ?,
        updated_at = ?
        WHERE id = ?`,
        [
          updatedData.amount,
          updatedData.merchant,
          updatedData.category,
          updatedData.type,                        // ✅ 
          updatedData.date,
          updatedData.bank_name || updatedData.bank,
          new Date().toISOString(),
          id
        ]
      );

      console.log('✅ Transaction updated successfully');
      return { success: true, changes: result.changes };
    } catch (error) {
      console.error('❌ Error updating transaction in DB:', error);
      throw error;
    }
  }

  /**
   * Get all transactions (with optional filters)
   */
  async getAllTransactions(filters = {}) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      let query = 'SELECT * FROM transactions';
      const params = [];
      const conditions = [];

      // Add filters
      if (filters.category) {
        conditions.push('category = ?');
        params.push(filters.category);
      }

      if (filters.type) {
        conditions.push('type = ?');
        params.push(filters.type);
      }

      if (filters.startDate) {
        conditions.push('date >= ?');
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        conditions.push('date <= ?');
        params.push(filters.endDate);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Order by date descending (newest first)
      query += ' ORDER BY date DESC, created_at DESC';

      // Add limit if specified
      if (filters.limit) {
        query += ` LIMIT ${filters.limit}`;
      }

      const statement = await this.db.prepareAsync(query);
      const result = await statement.executeAsync(params);
      const transactions = await result.getAllAsync();
      await statement.finalizeAsync();

      return transactions;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Get transactions for a specific date range
   */
  async getTransactionsByDateRange(startDate, endDate) {
    return this.getAllTransactions({ startDate, endDate });
  }

  /**
   * Get today's transactions
   */
  async getTodayTransactions() {
    const today = new Date().toISOString().split('T')[0];
    return this.getAllTransactions({ startDate: today, endDate: today });
  }

  /**
   * Get this month's transactions
   */
  async getMonthTransactions() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    return this.getAllTransactions({ startDate: firstDay, endDate: lastDay });
  }

  /**
   * Get spending by category
   */
  async getSpendingByCategory(startDate, endDate) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      let query = `
        SELECT 
          category,
          SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as spent,
          SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as received,
          COUNT(*) as count
        FROM transactions
      `;

      const params = [];
      if (startDate && endDate) {
        query += ' WHERE date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      query += ' GROUP BY category ORDER BY spent DESC';

      const statement = await this.db.prepareAsync(query);
      const result = await statement.executeAsync(params);
      const categories = await result.getAllAsync();
      await statement.finalizeAsync();

      return categories;
    } catch (error) {
      console.error('❌ Error getting category spending:', error);
      return [];
    }
  }

  /**
   * Get total spending/income for a period
   */
  async getTotals(startDate, endDate) {
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      let query = `
        SELECT 
          SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_spent,
          SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_received,
          COUNT(*) as total_transactions
        FROM transactions
      `;

      const params = [];
      if (startDate && endDate) {
        query += ' WHERE date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      const statement = await this.db.prepareAsync(query);
      const result = await statement.executeAsync(params);
      const rows = await result.getAllAsync();
      await statement.finalizeAsync();

      return rows[0] || { total_spent: 0, total_received: 0, total_transactions: 0 };
    } catch (error) {
      console.error('❌ Error getting totals:', error);
      return { total_spent: 0, total_received: 0, total_transactions: 0 };
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id) {
    try {
      const transaction = await this.db.getFirstAsync(
        'SELECT * FROM transactions WHERE id = ?',
        [id]
      );
      return transaction;
    } catch (error) {
      console.error('❌ Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Update transaction category (for manual corrections)
   */
  async updateCategory(id, newCategory) {
    try {
      await this.db.runAsync(
        'UPDATE transactions SET category = ?, updated_at = ? WHERE id = ?',
        [newCategory, new Date().toISOString(), id]
      );
      console.log('✅ Transaction category updated');
      return true;
    } catch (error) {
      console.error('❌ Error updating category:', error);
      throw error;
    }
  }

  /**
   * Mark transaction as synced to backend
   */
  async markAsSynced(id) {
    try {
      await this.db.runAsync(
        'UPDATE transactions SET synced_to_backend = 1, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );
      return true;
    } catch (error) {
      console.error('❌ Error marking as synced:', error);
      throw error;
    }
  }

  /**
   * Get unsynced transactions (for backend sync)
   */
  async getUnsyncedTransactions() {
    try {
      const transactions = await this.db.getAllAsync(
        'SELECT * FROM transactions WHERE synced_to_backend = 0 ORDER BY created_at ASC'
      );
      return transactions;
    } catch (error) {
      console.error('❌ Error fetching unsynced transactions:', error);
      throw error;
    }
  }

  /**
   * Delete transaction
   */
  async deleteTransaction(id) {
    try {
      await this.db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
      console.log('✅ Transaction deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Delete all transactions (use with caution!)
   */
  async deleteAllTransactions() {
    try {
      await this.db.runAsync('DELETE FROM transactions');
      console.log('✅ All transactions deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting all transactions:', error);
      throw error;
    }
  }

  //Get Accounts.
  async getDetectedAccounts() {
    try {
      const allData = await this.getAllTransactions();
      const accountMap = {};

      allData.forEach(t => {
        const bankName = t.bank || 'Other';
        if (!accountMap[bankName]) {
          accountMap[bankName] = {
            id: bankName,
            name: bankName,
            accNo: t.account_number ? `XX${t.account_number.slice(-4)}` : 'Digital Wallet',
            lastAmount: t.amount,
            type: t.type,
            lastDate: t.date
          };
        }
      });

      return Object.values(accountMap);
    } catch (error) {
      console.error("Error grouping accounts:", error);
      return [];
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      const result = await this.db.getFirstAsync(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN synced_to_backend = 1 THEN 1 END) as synced,
          COUNT(CASE WHEN synced_to_backend = 0 THEN 1 END) as unsynced
        FROM transactions
      `);
      return result;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new TransactionDB();