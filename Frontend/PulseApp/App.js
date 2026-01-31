import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import SplashScreenCustom from './screens/SplashScreen';
import Login from './screens/LoginScreen';
import Onboarding from './screens/OnboardingScreen';
import NotificationPermissionScreen from './screens/NotificationPermissionScreen';
import HomeScreen from './screens/HomeScreen';
import AccountsAll from './screens/AccountsAll';
import SpecificBankDetail from './screens/SpecificBankDetail';
import InsightsScreen from './screens/InsightsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import TransactionDetail from './screens/TransactionDetailScreen';
import CategoryBreakdown from './screens/CategoryBreakdownScreen';
import UserProfile from './screens/UserProfileScreen';
import PersonalInfo from './screens/PersonalInfoScreen';
import EditProfile from './screens/EditProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import SalaryScreen from './screens/SalarySetupScreen';
import BudgetSetting from './screens/BudgetSettingScreen';
import BudgetOverview from './screens/Budgetoverviewscreen';
import GhostMode from './screens/GhostModeScreen';
import HelpCenterScreen from './screens/HelpCenterScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import SecurityPrivacy from './screens/SecurityPrivacyScreen';
import BadgesScreen from './screens/BadgesScreen';
import StreakScreen from './screens/StreakScreen';
import NotificationPreferences from './screens/NotificationPreferencesScreen';
import SupportedBanksScreen from './screens/SupportedBanksScreen';
import { COLORS } from './constants/Colors';
import { DatabaseProvider } from './context/DatabaseContext';

const Stack = createNativeStackNavigator();

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <DatabaseProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor="transparent"
            translucent
          />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: {
                backgroundColor: isDarkMode ? COLORS.dark.bg : COLORS.light.bg,
              },
            }}
          >
            <Stack.Screen name="Splash">
              {(props) => <SplashScreenCustom {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="Login">
              {(props) => <Login {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="Onboarding">
              {(props) => <Onboarding {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="NotificationPermissionScreen">
              {(props) => <NotificationPermissionScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="AccountsAll">
              {(props) => <AccountsAll {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="SpecificBankDetail">
              {(props) => <SpecificBankDetail {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="Insights">
              {(props) => <InsightsScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="CategoryBreakdown">
              {(props) => <CategoryBreakdown {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="Transactions">
              {(props) => <TransactionsScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="TransactionDetail">
              {(props) => <TransactionDetail {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="SupportedBanks">
              {(props) => <SupportedBanksScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="BudgetSetting">
              {(props) => <BudgetSetting {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="SalaryScreen">
              {(props) => <SalaryScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="BudgetOverview">
              {(props) => <BudgetOverview {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>


            <Stack.Screen name="GhostMode">
              {(props) => <GhostMode {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="SecurityPrivacy">
              {(props) => <SecurityPrivacy {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="NotificationPreferences">
              {(props) => <NotificationPreferences {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="StreakScreen">
              {(props) => <StreakScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="BadgesScreen">
              {(props) => <BadgesScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="HelpCenterScreen">
              {(props) => <HelpCenterScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="FeedbackScreen">
              {(props) => <FeedbackScreen {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="UserProfile">
              {(props) => <UserProfile {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="PersonalInfo">
              {(props) => <PersonalInfo {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>

            <Stack.Screen name="EditProfile">
              {(props) => <EditProfile {...props} isDarkMode={isDarkMode} />}
            </Stack.Screen>
            <Stack.Screen name="Settings">
              {(props) => (
                <SettingsScreen
                  {...props}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </DatabaseProvider>
  );
}