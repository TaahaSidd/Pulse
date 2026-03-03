import React, { createContext, useContext, useEffect, useState } from 'react';
import SMSService from '../services/SMSListener';
import { useDatabase } from './DatabaseContext';

const SMSContext = createContext(null);

export const SMSProvider = ({ children }) => {
    const { isInitialized: dbReady, db } = useDatabase();

    const [hasPermission, setHasPermission] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [syncStatus, setSyncStatus] = useState({
        isSyncing: false,
        lastResult: null, // { imported, duplicates, failed, total }
    });
    const [newTransactionCount, setNewTransactionCount] = useState(0);

    // Check permissions and initialize once DB is ready
    useEffect(() => {
        if (!dbReady) return;

        const init = async () => {
            setIsChecking(true);

            const permitted = await SMSService.checkPermissions();
            setHasPermission(permitted);

            if (permitted) {
                // Initialize with DB and new-transaction callback
                await SMSService.initialize(db, (newTx) => {
                    console.log('🔔 New transaction auto-detected:', newTx.merchant);
                    setNewTransactionCount(prev => prev + 1);
                });
            }

            setIsChecking(false);
        };

        init();

        // Cleanup listener on unmount
        return () => SMSService.stopLiveListener();
    }, [dbReady]);

    /**
     * Request permissions + initialize (called from onboarding)
     */
    const requestPermission = async () => {
        const granted = await SMSService.requestPermissions();
        setHasPermission(granted);

        if (granted && dbReady) {
            await SMSService.initialize(db, (newTx) => {
                setNewTransactionCount(prev => prev + 1);
            });
        }

        return granted;
    };

    /**
     * Manually sync new SMS (for pull-to-refresh or settings button)
     */
    const syncNow = async (onProgress = null) => {
        if (syncStatus.isSyncing) return;

        setSyncStatus(prev => ({ ...prev, isSyncing: true }));

        const result = await SMSService.syncNewSMS(onProgress);

        setSyncStatus({ isSyncing: false, lastResult: result });
        return result;
    };

    /**
     * Re-import all SMS (for settings "Re-scan all messages")
     */
    const reimportAll = async (onProgress = null) => {
        if (syncStatus.isSyncing) return;

        setSyncStatus(prev => ({ ...prev, isSyncing: true }));

        const result = await SMSService.resetAndReimport(onProgress);

        setSyncStatus({ isSyncing: false, lastResult: result });
        return result;
    };

    /**
     * Reset new transaction notification counter
     */
    const clearNewTransactionCount = () => setNewTransactionCount(0);

    return (
        <SMSContext.Provider value={{
            hasPermission,
            isChecking,
            syncStatus,
            newTransactionCount,
            requestPermission,
            syncNow,
            reimportAll,
            clearNewTransactionCount,
        }}>
            {children}
        </SMSContext.Provider>
    );
};

export const useSMS = () => {
    const context = useContext(SMSContext);
    if (!context) throw new Error('useSMS must be used within SMSProvider');
    return context;
};

export default SMSContext;