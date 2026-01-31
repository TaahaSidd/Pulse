import React, { createContext, useContext, useEffect, useState } from 'react';
import TransactionDB from '../database/TransactionDB';

const DatabaseContext = createContext(null);

export const DatabaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await TransactionDB.init();
      setIsInitialized(true);
      console.log('✅ Database ready');
    } catch (err) {
      console.error('❌ Database initialization error:', err);
      setError(err);
    }
  };

  return (
    <DatabaseContext.Provider value={{ isInitialized, error, db: TransactionDB }}>
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