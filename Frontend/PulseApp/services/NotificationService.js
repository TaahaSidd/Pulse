/**
 * NotificationService.js
 * Handles all local notifications for Pace.
 *
 * Notifications:
 * 1. Transaction Alert — instant when a new SMS transaction is saved
 * 2. Budget 80% Alert — when monthly spending crosses 80% of budget
 * 3. Budget 100% Alert — when monthly spending exceeds budget
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

const PREFS_KEY = 'pace_notification_prefs';
const BUDGET_NOTIFIED_KEY = 'pace_budget_notified';
export const NOTIF_HISTORY_KEY = 'pace_notif_history';

const DEFAULT_PREFS = {
    pushEnabled: true,
    transactionAlerts: true,
    budgetAlerts: true,
};

class NotificationService {

    async getPrefs() {
        try {
            const saved = await AsyncStorage.getItem(PREFS_KEY);
            return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
        } catch {
            return DEFAULT_PREFS;
        }
    }

    // ── Save to in-app history ──────────────────────────────
    async saveToHistory(title, body, data = {}) {
        try {
            const raw = await AsyncStorage.getItem(NOTIF_HISTORY_KEY);
            const history = raw ? JSON.parse(raw) : [];
            const newNotif = {
                id: Date.now().toString(),
                title,
                message: body,
                time: new Date().toISOString(),
                isRead: false,
                type: data.type || 'general',
            };
            const updated = [newNotif, ...history].slice(0, 50); // keep last 50
            await AsyncStorage.setItem(NOTIF_HISTORY_KEY, JSON.stringify(updated));
        } catch (e) {
            console.log('saveToHistory error:', e);
        }
    }

    // ── Fire notification + save to history ─────────────────
    async send(title, body, data = {}) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: { title, body, data, sound: true },
                trigger: null,
            });
            await this.saveToHistory(title, body, data);
        } catch (e) {
            console.log('Notification send error:', e);
        }
    }

    // ── 1. Transaction Alert ────────────────────────────────
    async notifyNewTransaction(transaction) {
        const prefs = await this.getPrefs();
        if (!prefs.pushEnabled || !prefs.transactionAlerts) return;

        const { merchant, amount, type } = transaction;
        const sign = type === 'credit' ? '+' : '-';
        const merchantName = merchant && merchant !== 'Unknown' ? merchant : 'Unknown merchant';

        await this.send(
            `${sign}₹${amount?.toLocaleString('en-IN')} ${type === 'credit' ? 'received' : 'spent'}`,
            merchantName,
            { type: 'transaction', transactionId: transaction.id }
        );
    }

    // ── 2. Budget Alert (80% + 100%) ────────────────────────
    async checkAndNotifyBudget(db, BudgetDB) {
        const prefs = await this.getPrefs();
        if (!prefs.pushEnabled || !prefs.budgetAlerts) return;

        try {
            const now = new Date();
            const month = now.toLocaleString('en-US', { month: 'long' });
            const year = now.getFullYear();
            const monthKey = format(now, 'yyyy-MM');

            const budget = await BudgetDB.getBudget(month, year);
            if (!budget || !budget.total_amount) return;

            const monthStart = `${monthKey}-01`;
            const monthEnd = `${monthKey}-31`;

            const result = await db.getFirstAsync(
                `SELECT COALESCE(SUM(amount), 0) as total 
                 FROM transactions 
                 WHERE type = 'debit' 
                 AND date >= ? AND date <= ?`,
                [monthStart, monthEnd]
            );

            const spent = result?.total || 0;
            const budgetTotal = budget.total_amount;
            const percent = (spent / budgetTotal) * 100;

            const notifiedRaw = await AsyncStorage.getItem(BUDGET_NOTIFIED_KEY);
            const notified = notifiedRaw ? JSON.parse(notifiedRaw) : {};

            if (percent >= 100 && !notified[`${monthKey}_100`]) {
                await this.send(
                    '🚨 Budget exceeded!',
                    `You've spent ₹${Math.round(spent).toLocaleString('en-IN')} — over your ₹${Math.round(budgetTotal).toLocaleString('en-IN')} ${month} budget.`,
                    { type: 'budget_exceeded' }
                );
                notified[`${monthKey}_100`] = true;
                await AsyncStorage.setItem(BUDGET_NOTIFIED_KEY, JSON.stringify(notified));
            } else if (percent >= 80 && !notified[`${monthKey}_80`]) {
                await this.send(
                    '⚠️ 80% of budget used',
                    `You've spent ₹${Math.round(spent).toLocaleString('en-IN')} of your ₹${Math.round(budgetTotal).toLocaleString('en-IN')} ${month} budget.`,
                    { type: 'budget_80' }
                );
                notified[`${monthKey}_80`] = true;
                await AsyncStorage.setItem(BUDGET_NOTIFIED_KEY, JSON.stringify(notified));
            }
        } catch (e) {
            console.log('Budget notification check error:', e);
        }
    }

    // ── Mark one as read ────────────────────────────────────
    async markAsRead(id) {
        try {
            const raw = await AsyncStorage.getItem(NOTIF_HISTORY_KEY);
            const history = raw ? JSON.parse(raw) : [];
            const updated = history.map(n => n.id === id ? { ...n, isRead: true } : n);
            await AsyncStorage.setItem(NOTIF_HISTORY_KEY, JSON.stringify(updated));
        } catch (e) {
            console.log('markAsRead error:', e);
        }
    }

    // ── Mark all as read ────────────────────────────────────
    async markAllAsRead() {
        try {
            const raw = await AsyncStorage.getItem(NOTIF_HISTORY_KEY);
            const history = raw ? JSON.parse(raw) : [];
            const updated = history.map(n => ({ ...n, isRead: true }));
            await AsyncStorage.setItem(NOTIF_HISTORY_KEY, JSON.stringify(updated));
        } catch (e) {
            console.log('markAllAsRead error:', e);
        }
    }

    // ── Get history ─────────────────────────────────────────
    async getHistory() {
        try {
            const raw = await AsyncStorage.getItem(NOTIF_HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }
}

export default new NotificationService();