import { useState, useEffect } from 'react';
import BudgetDB from '../database/BudgetDB';
import { useDatabase } from '../context/DatabaseContext';

export const useBudget = () => {
    const { isInitialized } = useDatabase();
    const [budget, setBudget] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadBudget = async () => {
        try {
            setIsLoading(true);
            const currentBudget = await BudgetDB.getCurrentBudget();
            setBudget(currentBudget);
        } catch (error) {
            console.error('❌ Error loading budget in hook:', error);
            setBudget(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isInitialized) {
            loadBudget();
        }
    }, [isInitialized]);

    return {
        budget,
        isLoading,
        refresh: loadBudget,
    };
};