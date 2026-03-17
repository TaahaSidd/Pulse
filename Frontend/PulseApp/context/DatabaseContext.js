import React, { createContext, useContext, useEffect, useState } from 'react';
import TransactionDB from '../database/TransactionDB';

const DatabaseContext = createContext(null);

export const DatabaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await TransactionDB.init();
        setIsInitialized(true);
        console.log('✅ Database ready');
        return;
      } catch (err) {
        console.warn(`⚠️ DB init attempt ${i + 1} failed:`, err);
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 500));
        } else {
          console.error('❌ Database initialization error:', err);
          setError(err);
        }
      }
    }
  };

  return (
    // Only expose db when fully initialized — prevents NullPointerException
    <DatabaseContext.Provider value={{
      isInitialized,
      error,
      db: isInitialized ? TransactionDB : null,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
};