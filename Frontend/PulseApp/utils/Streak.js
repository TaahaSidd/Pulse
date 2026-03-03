import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = '@user_streak_data';

export const StreakService = {
    getStreak: async () => {
        const data = await AsyncStorage.getItem(STREAK_KEY);
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

        if (!data) return { count: 0, lastDate: null, history: [] };

        let parsed = JSON.parse(data);
        const lastDate = parsed.lastDate;

        // Check if they missed a day (Difference > 1 day)
        const last = new Date(lastDate);
        const now = new Date(today);
        const diffTime = Math.abs(now - last);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1 && lastDate !== today) {
            // Streak broken, reset count but keep history for the calendar
            parsed.count = 0;
            await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(parsed));
        }

        return parsed;
    },

    // Call this whenever a user completes a daily goal (e.g., checking the app)
    recordActivity: async () => {
        const today = new Date().toLocaleDateString('en-CA');
        const data = await StreakService.getStreak();

        if (data.lastDate === today) return data; // Already recorded today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('en-CA');

        const newCount = data.lastDate === yesterdayStr ? data.count + 1 : 1;

        const newData = {
            count: newCount,
            lastDate: today,
            history: [...data.history, today].slice(-7) // Keep last 7 active days
        };

        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newData));
        return newData;
    }
};