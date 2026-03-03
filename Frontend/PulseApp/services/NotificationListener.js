// import { Platform } from 'react-native';
// import RNNotifListener from 'react-native-android-notification-listener';
// import BankPatterns from '../utils/BankPatterns';

// class NotificationListener {
//     constructor() {
//         this.isListening = false;
//     }

//     /**
//      * Start listening to notifications
//      */
//     async startListening(onTransactionDetected) {
//         if (Platform.OS !== 'android') {
//             console.log('⚠️ Notification listening only available on Android');
//             return;
//         }

//         try {
//             // Check permission first
//             const status = await RNNotifListener.getPermissionStatus();

//             if (status !== 'authorized') {
//                 console.log('⚠️ Notification listener permission not granted');
//                 return;
//             }

//             console.log('👂 Starting notification listener...');

//             // Listen for new notifications
//             RNNotifListener.onNotificationPosted((notification) => {
//                 const { packageName, title, text } = notification;

//                 console.log('📨 Notification received from:', packageName);
//                 console.log('📝 Title:', title);
//                 console.log('📝 Text:', text);

//                 // Check if it's a bank notification
//                 if (this.isBankNotification(packageName, title, text)) {
//                     // Parse the notification to extract transaction
//                     const transaction = this.parseTransaction(text, title, packageName);

//                     if (transaction) {
//                         console.log('💰 Transaction detected:', transaction);
//                         onTransactionDetected(transaction);
//                     }
//                 }
//             });

//             this.isListening = true;
//             console.log('✅ Notification listener started');

//         } catch (error) {
//             console.error('❌ Error starting notification listener:', error);
//         }
//     }

//     /**
//      * Stop listening to notifications
//      */
//     stopListening() {
//         if (this.isListening) {
//             // Note: react-native-android-notif-listener doesn't have explicit stop
//             // The listener continues as long as permission is granted
//             this.isListening = false;
//             console.log('🛑 Notification listener stopped');
//         }
//     }

//     /**
//      * Check if notification is from a bank app
//      */
//     isBankNotification(packageName, title, text) {
//         // Common bank app package names
//         const bankPackages = [
//             'com.phonepe.app',
//             'in.org.npci.upiapp', // BHIM
//             'com.google.android.apps.nbu.paisa.user', // Google Pay
//             'net.one97.paytm', // Paytm
//             'com.axis.mobile',
//             'com.sbi.SBIFreedomPlus',
//             'com.icicibank.pockets',
//             'com.infosys.finacle.hdfcbank',
//             'com.rblbank.mobank',
//             'com.csam.icici.bank.imobile',
//             'com.konylabs.IOBank', // IDFC First Bank
//             'com.fss.kotakpayapp', // Kotak
//             // Add more bank package names
//         ];

//         // Check package name
//         if (bankPackages.some(pkg => packageName.includes(pkg))) {
//             return true;
//         }

//         // Check title/text for bank-related keywords
//         const combinedText = `${title} ${text}`.toLowerCase();
//         const bankKeywords = [
//             'debited', 'credited', 'spent', 'paid', 'received',
//             'transaction', 'payment', 'transfer', 'upi', 'withdrawn',
//             'deposited', 'bank', 'account', 'balance', 'atm',
//         ];

//         return bankKeywords.some(keyword => combinedText.includes(keyword));
//     }

//     /**
//      * Parse notification to extract transaction details
//      */
//     parseTransaction(text, title, packageName) {
//         try {
//             // Combine title and text for parsing
//             const fullText = `${title} ${text}`;

//             // Use BankPatterns to parse the notification
//             const parsed = BankPatterns.parseTransaction(fullText);

//             if (!parsed) {
//                 return null;
//             }

//             return {
//                 ...parsed,
//                 source: 'notification',
//                 app: packageName,
//                 rawNotification: fullText,
//                 timestamp: new Date().toISOString(),
//             };
//         } catch (error) {
//             console.error('❌ Error parsing notification:', error);
//             return null;
//         }
//     }

//     /**
//      * Get all recent notifications (for initial sync)
//      * Note: This only works if permission was granted
//      */
//     async getRecentNotifications() {
//         if (Platform.OS !== 'android') {
//             console.log('⚠️ Notification reading only available on Android');
//             return [];
//         }

//         try {
//             const status = await RNNotifListener.getPermissionStatus();

//             if (status !== 'authorized') {
//                 console.log('⚠️ Notification listener permission not granted');
//                 return [];
//             }

//             console.log('📖 Reading recent notifications...');

//             // Get active notifications (limited to what's currently in notification tray)
//             const notifications = await RNNotifListener.getActiveNotifications();

//             console.log(`✅ Retrieved ${notifications.length} notifications`);

//             // Parse each notification to extract transactions
//             const transactions = [];
//             for (const notif of notifications) {
//                 if (this.isBankNotification(notif.packageName, notif.title, notif.text)) {
//                     const transaction = this.parseTransaction(notif.text, notif.title, notif.packageName);
//                     if (transaction) {
//                         transactions.push(transaction);
//                     }
//                 }
//             }

//             console.log(`💰 Found ${transactions.length} bank transactions`);
//             return transactions;

//         } catch (error) {
//             console.error('❌ Error reading notifications:', error);
//             return [];
//         }
//     }
// }

// // Export singleton instance
// export default new NotificationListener();