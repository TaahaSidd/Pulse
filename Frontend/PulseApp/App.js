import React, { useEffect, useState, useRef } from 'react';
import { StatusBar, useColorScheme, AppState, Platform, PermissionsAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SMSProvider } from './context/SmsContext';

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';

import SplashScreenCustom from './screens/SplashScreen';
import Login from './screens/EmailLoginScreen';
import SignUp from './screens/SignUpScreen';
import VerifyOTPScreen from './screens/VerifyOTPScreen';
import SetupProfileScreen from './screens/SetupProfileScreen';
import Onboarding from './screens/OnboardingScreen';
import NameScreen from './screens/Namescreen';
import BudgetSetupScreen from './screens/Budgetsetupscreen';
import NotificationPermissionScreen from './screens/NotificationPermissionScreen';
import HomeScreen from './screens/HomeScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import AccountsAll from './screens/AccountsAll';
import SpecificBankDetail from './screens/SpecificBankDetail';
import InsightsScreen from './screens/InsightsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import TransactionDetail from './screens/TransactionDetailScreen';
import EditTransactionScreen from './screens/EditTransactionScreen';
import MerchantDetail from './screens/BreakDownScreen';
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
import AppearanceScreen from './screens/AppearanceScreen';
import BadgesScreen from './screens/BadgesScreen';
import StreakScreen from './screens/StreakScreen';
import WhatsNewScreen from './screens/WhatsNewScreen';
import NotificationPreferences from './screens/NotificationPreferencesScreen';
import SupportedBanksScreen from './screens/SupportedBanksScreen';
import LockScreen from './screens/LockScreen';

import { COLORS } from './constants/Colors';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import SMSService from './services/SMSListener';

const Stack = createNativeStackNavigator();
const TAB = { animation: 'none' };
const SLIDE = { animation: 'slide_from_right' };
const LOCK_TIMEOUT = 5 * 60 * 1000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

// Inner component so it can access DatabaseProvider context
function AppInner({ isDarkMode, isLocked, setIsLocked, toggleTheme, bg }) {
  const { db, isInitialized } = useDatabase();

  // Auto-init SMS if permission already granted (app restart / reopen)
  useEffect(() => {
    if (Platform.OS !== 'android' || !isInitialized || !db) return;
    const autoInit = async () => {
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );
      if (alreadyGranted && !SMSService.isInitialized) {
        await SMSService.initialize(db, (newTx) => {
          console.log('Live SMS transaction:', newTx.merchant);
        });
      }
    };
    autoInit();
  }, [isInitialized, db]);

  return (
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
            animation: 'none',
            contentStyle: { backgroundColor: bg },
          }}
        >
          <Stack.Screen name="Splash">
            {(props) => <SplashScreenCustom {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Onboarding">
            {(props) => <Onboarding {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="NameScreen">
            {(props) => <NameScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="BudgetSetup">
            {(props) => <BudgetSetupScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="NotificationPermissionScreen">
            {(props) => <NotificationPermissionScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>

          <Stack.Screen name="Home" options={TAB}>
            {(props) => <HomeScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Insights" options={TAB}>
            {(props) => <InsightsScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Transactions" options={TAB}>
            {(props) => <TransactionsScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Settings" options={TAB}>
            {(props) => <SettingsScreen {...props} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
          </Stack.Screen>
          <Stack.Screen name="UserProfile" options={TAB}>
            {(props) => <UserProfile {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>

          <Stack.Screen name="TransactionDetail" options={SLIDE}>
            {(props) => <TransactionDetail {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="MerchantDetail" options={SLIDE}>
            {(props) => <MerchantDetail {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="CategoryBreakdown" options={SLIDE}>
            {(props) => <CategoryBreakdown {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="BudgetOverview" options={SLIDE}>
            {(props) => <BudgetOverview {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="BudgetSetting" options={SLIDE}>
            {(props) => <BudgetSetting {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Notifications" options={SLIDE}>
            {(props) => <NotificationsScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="AccountsAll" options={SLIDE}>
            {(props) => <AccountsAll {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="SpecificBankDetail" options={SLIDE}>
            {(props) => <SpecificBankDetail {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="PersonalInfo" options={SLIDE}>
            {(props) => <PersonalInfo {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="EditProfile" options={SLIDE}>
            {(props) => <EditProfile {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="SalaryScreen" options={SLIDE}>
            {(props) => <SalaryScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="GhostMode" options={SLIDE}>
            {(props) => <GhostMode {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="SecurityPrivacy" options={SLIDE}>
            {(props) => <SecurityPrivacy {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Appearance" options={SLIDE}>
            {(props) => <AppearanceScreen {...props} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}
          </Stack.Screen>
          <Stack.Screen name="NotificationPreferences" options={SLIDE}>
            {(props) => <NotificationPreferences {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="EditTransaction" options={SLIDE}>
            {(props) => <EditTransactionScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="StreakScreen" options={SLIDE}>
            {(props) => <StreakScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="BadgesScreen" options={SLIDE}>
            {(props) => <BadgesScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="WhatsNew" options={SLIDE}>
            {(props) => <WhatsNewScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="HelpCenterScreen" options={SLIDE}>
            {(props) => <HelpCenterScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="FeedbackScreen" options={SLIDE}>
            {(props) => <FeedbackScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="SupportedBanks" options={SLIDE}>
            {(props) => <SupportedBanksScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="Login">
            {(props) => <Login {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp">
            {(props) => <SignUp {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="VerifyOTP" options={SLIDE}>
            {(props) => <VerifyOTPScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
          <Stack.Screen name="SetupProfile" options={SLIDE}>
            {(props) => <SetupProfileScreen {...props} isDarkMode={isDarkMode} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default function App() {
  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');
  const [isLocked, setIsLocked] = useState(false);

  const backgroundTime = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => { loadThemePreference(); }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');
    } catch (e) {
      console.log('Error loading theme:', e);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  // AppState — biometric lock
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (appStateRef.current === 'active' && nextState === 'background') {
        backgroundTime.current = Date.now();
      }
      if (appStateRef.current === 'background' && nextState === 'active') {
        const biometricEnabled = await SecureStore.getItemAsync('pulse_biometric_enabled');
        if (biometricEnabled === 'true' && backgroundTime.current) {
          const elapsed = Date.now() - backgroundTime.current;
          if (elapsed >= LOCK_TIMEOUT) setIsLocked(true);
        }
        backgroundTime.current = null;
      }
      appStateRef.current = nextState;
    });
    return () => subscription.remove();
  }, []);

  // ── Notification permission — delayed, asked on Home not on launch ──
  // Requested lazily from HomeScreen instead of here

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const bg = isDarkMode ? COLORS.dark.bg : COLORS.light.bg;

  if (isLocked) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: bg }}>
        <LockScreen isDarkMode={isDarkMode} onUnlock={() => setIsLocked(false)} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: bg }}>
      <DatabaseProvider>
        <SMSProvider>
          <AppInner
            isDarkMode={isDarkMode}
            isLocked={isLocked}
            setIsLocked={setIsLocked}
            toggleTheme={toggleTheme}
            bg={bg}
          />
        </SMSProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}