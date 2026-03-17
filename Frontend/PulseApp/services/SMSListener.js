/**
 * SMSService.js
 * The brain of Pace's automatic expense tracking.
 *
 * Pipeline:
 * Permission → Bulk Import → isTransactionSMS() filter → parse → clean merchant → save to DB → notify
 */

import { Platform, PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-android-sms-listener';
import SmsModule from 'react-native-get-sms-android';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmsParserService } from './SmsParserService';
import { MerchantMapper } from '../utils/MerchantMapper';
import NotificationService from './NotificationService';
import BudgetDB from '../database/BudgetDB';

const LAST_SYNC_KEY = 'pace_last_sms_sync';
const HAS_DONE_BULK_IMPORT = 'pace_bulk_import_done';

const BLOCKED_SENDERS = [
    'vk-icicih',
    'vm-vodafn',
    'ad-msgind',
    'bp-promos',
    'dm-offers',
    'info',
    'alerts',
    'offers',
    'promo',
    'sales',
];

class SMSService {
    constructor() {
        this.db = null;
        this.subscription = null;
        this.onNewTransaction = null;
        this.isInitialized = false;
    }

    async initialize(db, onNewTransaction = null) {
        if (Platform.OS !== 'android') {
            console.log('⚠️ SMS tracking only available on Android');
            return { success: false, reason: 'not_android' };
        }

        this.db = db;
        this.onNewTransaction = onNewTransaction;

        const hasPermission = await this.checkPermissions();
        if (!hasPermission) {
            console.log('⚠️ SMS permission not granted yet');
            return { success: false, reason: 'no_permission' };
        }

        await this.runBulkImportIfNeeded();
        this.startLiveListener();

        this.isInitialized = true;
        console.log('✅ SMSService fully initialized');
        return { success: true };
    }

    async requestPermissions() {
        if (Platform.OS !== 'android') return false;
        try {
            const results = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.READ_SMS,
                PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
            ]);
            const readGranted = results[PermissionsAndroid.PERMISSIONS.READ_SMS] === 'granted';
            const receiveGranted = results[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === 'granted';
            return readGranted && receiveGranted;
        } catch (error) {
            console.error('❌ Permission request failed:', error);
            return false;
        }
    }

    async checkPermissions() {
        if (Platform.OS !== 'android') return false;
        const readGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
        const receiveGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
        return readGranted && receiveGranted;
    }

    async runBulkImportIfNeeded() {
        const alreadyDone = await AsyncStorage.getItem(HAS_DONE_BULK_IMPORT);
        if (alreadyDone === 'true') {
            console.log('⏭️ Bulk import already done, skipping');
            return;
        }

        console.log('📥 Running first-time bulk SMS import...');
        const result = await this.bulkImport({ daysBack: 90, maxCount: 1000 });
        console.log(`✅ Bulk import done: ${result.imported} imported, ${result.duplicates} duplicates, ${result.failed} failed`);

        await AsyncStorage.setItem(HAS_DONE_BULK_IMPORT, 'true');
        await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    }

    async bulkImport(options = {}, onProgress = null) {
        const { daysBack = 90, maxCount = 2000 } = options;
        const stats = { imported: 0, duplicates: 0, failed: 0, total: 0 };

        if (Platform.OS !== 'android') return stats;

        try {
            const boxes = ['inbox', 'sent', 'draft'];
            let allMessages = [];

            for (const box of boxes) {
                try {
                    const messages = await new Promise((resolve) => {
                        SmsModule.list(
                            JSON.stringify({ box, maxCount }),
                            (fail) => { console.log(`⚠️ Box ${box} failed:`, fail); resolve([]); },
                            (count, smsList) => resolve(JSON.parse(smsList))
                        );
                    });
                    allMessages = [...allMessages, ...messages];
                } catch (e) {
                    console.log(`⚠️ Could not read box: ${box}`);
                }
            }

            const seen = new Set();
            const messages = allMessages.filter(m => {
                if (seen.has(m._id)) return false;
                seen.add(m._id);
                return true;
            });

            stats.total = messages.length;

            const bankMessages = messages.filter(sms =>
                !this.isBlockedSender(sms.address) &&
                SmsParserService.isTransactionSMS(sms.body)
            );

            console.log(`💳 ${bankMessages.length} bank transaction SMS found`);

            for (let i = 0; i < bankMessages.length; i++) {
                const sms = bankMessages[i];
                if (onProgress) onProgress(i + 1, bankMessages.length);
                // Bulk import: save only, no notifications (don't spam on first import)
                const result = await this.processSMS(sms.body, sms.address, false);
                if (result === 'saved') stats.imported++;
                else if (result === 'duplicate') stats.duplicates++;
                else stats.failed++;
            }

            return stats;
        } catch (error) {
            console.error('❌ Bulk import error:', error);
            return stats;
        }
    }

    startLiveListener() {
        if (this.subscription) return;

        this.subscription = SmsAndroid.addListener(async (message) => {
            const { originatingAddress, body } = message;
            if (this.isBlockedSender(originatingAddress)) return;
            if (!SmsParserService.isTransactionSMS(body)) return;

            console.log('📨 New bank SMS from:', originatingAddress);
            // Live SMS: notify = true
            const result = await this.processSMS(body, originatingAddress, true);
            console.log('📨 Live SMS result:', result);
        });

        console.log('👂 Live SMS listener started');
    }

    stopLiveListener() {
        if (this.subscription) {
            this.subscription.remove();
            this.subscription = null;
        }
    }

    /**
     * @param {boolean} notify — true for live SMS, false for bulk import
     */
    async processSMS(smsBody, sender = '', notify = true) {
        try {
            const parsed = SmsParserService.parse(smsBody);

            if (!parsed.success) {
                console.warn('⚠️ Parse failed:', parsed.error);
                return 'failed';
            }

            const transaction = parsed.local;

            if (transaction.merchant && transaction.merchant !== 'Unknown') {
                transaction.merchant = MerchantMapper.cleanName(transaction.merchant);
            }

            const saveResult = await this.db.saveTransaction(transaction);

            if (!saveResult.success && saveResult.reason === 'duplicate') {
                return 'duplicate';
            }

            if (saveResult.success) {
                const savedTx = { ...transaction, id: saveResult.id };

                if (this.onNewTransaction) {
                    this.onNewTransaction(savedTx);
                }

                // Fire notifications only for live SMS (not bulk import)
                if (notify) {
                    // 1. Transaction alert
                    await NotificationService.notifyNewTransaction(savedTx);

                    // 2. Budget check — only for debit transactions
                    if (transaction.type === 'debit') {
                        await NotificationService.checkAndNotifyBudget(this.db, BudgetDB);
                    }
                }

                return 'saved';
            }

            return 'failed';
        } catch (error) {
            console.error('❌ processSMS error:', error);
            return 'failed';
        }
    }

    isBlockedSender(sender = '') {
        if (!sender) return false;
        const lower = sender.toLowerCase();
        if (BLOCKED_SENDERS.some(s => lower.includes(s))) return true;
        if (/^\+?\d{7,}$/.test(sender)) return true;
        return false;
    }

    async syncNewSMS(onProgress = null) {
        const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
        const daysBack = lastSync
            ? Math.ceil((Date.now() - new Date(lastSync).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 7;
        const result = await this.bulkImport({ daysBack, maxCount: 500 }, onProgress);
        await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        return result;
    }

    async resetAndReimport(onProgress = null) {
        await AsyncStorage.removeItem(HAS_DONE_BULK_IMPORT);
        await AsyncStorage.removeItem(LAST_SYNC_KEY);
        return this.bulkImport({ daysBack: 90, maxCount: 1000 }, onProgress);
    }

    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isListening: !!this.subscription,
            platform: Platform.OS,
        };
    }
}

export default new SMSService();