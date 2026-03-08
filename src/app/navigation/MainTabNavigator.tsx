import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../shared/theme';
import { ThemeColors } from '../../shared/constants/colors';
import { useUIStore } from '../../store/uiStore';

// Home
import { HomeScreen } from '../../features/home/screens/HomeScreen';
// Transactions
import { TransactionListScreen } from '../../features/transactions/screens/TransactionListScreen';
import { TransactionAddScreen } from '../../features/transactions/screens/TransactionAddScreen';
import { CalendarScreen } from '../../features/transactions/screens/CalendarScreen';
// Stats
import { StatsScreen } from '../../features/stats/screens/StatsScreen';
import { CategoryDetailScreen } from '../../features/stats/screens/CategoryDetailScreen';
import { MonthlyReportScreen } from '../../features/stats/screens/MonthlyReportScreen';
// More
import { MoreMenuScreen } from '../../features/settings/screens/MoreMenuScreen';
import { AssetScreen } from '../../features/assets/screens/AssetScreen';
import { AssetEditScreen } from '../../features/assets/screens/AssetEditScreen';
import { AssetAddScreen } from '../../features/assets/screens/AssetAddScreen';
import { AssetTrendScreen } from '../../features/assets/screens/AssetTrendScreen';
import { BudgetSettingScreen } from '../../features/budget/screens/BudgetSettingScreen';
import { RecurringListScreen } from '../../features/recurring/screens/RecurringListScreen';
import { RecurringFormScreen } from '../../features/recurring/screens/RecurringFormScreen';
import { SavingRateGoalScreen } from '../../features/settings/screens/SavingRateGoalScreen';
import { GoalSettingScreen } from '../../features/goals/screens/GoalSettingScreen';
import { NotificationSettingScreen } from '../../features/settings/screens/NotificationSettingScreen';
import { FamilyInfoScreen } from '../../features/settings/screens/FamilyInfoScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const TransactionStack = createNativeStackNavigator();
const StatsStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
  </HomeStack.Navigator>
);

const TransactionStackScreen = () => (
  <TransactionStack.Navigator screenOptions={{ headerShown: false }}>
    <TransactionStack.Screen
      name="TransactionList"
      component={TransactionListScreen}
    />
    <TransactionStack.Screen
      name="TransactionAdd"
      component={TransactionAddScreen}
    />
    <TransactionStack.Screen
      name="TransactionEdit"
      component={TransactionAddScreen}
    />
    <TransactionStack.Screen
      name="Calendar"
      component={CalendarScreen}
    />
  </TransactionStack.Navigator>
);

const StatsStackScreen = () => (
  <StatsStack.Navigator screenOptions={{ headerShown: false }}>
    <StatsStack.Screen name="StatsMain" component={StatsScreen} />
    <StatsStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    <StatsStack.Screen name="MonthlyReport" component={MonthlyReportScreen} />
  </StatsStack.Navigator>
);

const MoreStackScreen = () => (
  <MoreStack.Navigator screenOptions={{ headerShown: false }}>
    <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />
    <MoreStack.Screen name="BudgetSetting" component={BudgetSettingScreen} />
    <MoreStack.Screen name="Assets" component={AssetScreen} />
    <MoreStack.Screen name="AssetEdit" component={AssetEditScreen} />
    <MoreStack.Screen name="AssetAdd" component={AssetAddScreen} />
    <MoreStack.Screen name="AssetTrend" component={AssetTrendScreen} />
    <MoreStack.Screen name="RecurringList" component={RecurringListScreen} />
    <MoreStack.Screen name="RecurringForm" component={RecurringFormScreen} />
    <MoreStack.Screen name="SavingRateGoal" component={SavingRateGoalScreen} />
    <MoreStack.Screen name="GoalSetting" component={GoalSettingScreen} />
    <MoreStack.Screen name="NotificationSetting" component={NotificationSettingScreen} />
    <MoreStack.Screen name="FamilyInfo" component={FamilyInfoScreen} />
    <MoreStack.Screen name="Settings" component={SettingsScreen} />
  </MoreStack.Navigator>
);

const DummyScreen = () => null;

export const MainTabNavigator: React.FC = () => {
  const showAddModal = useUIStore(s => s.showAddModal);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: insets.bottom + 8,
          height: 64 + insets.bottom,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarButton: (props) => <TouchableOpacity {...props} activeOpacity={0.7} />,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionStackScreen}
        options={{
          tabBarLabel: '내역',
          tabBarIcon: ({ color, size }) => (
            <Icon name="receipt-long" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={DummyScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.fabContainer}>
              <View style={styles.fab}>
                <Icon name="add" size={28} color={colors.white} />
              </View>
            </View>
          ),
        }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            showAddModal();
          },
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsStackScreen}
        options={{
          tabBarLabel: '통계',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStackScreen}
        options={{
          tabBarLabel: '더보기',
          tabBarIcon: ({ color, size }) => (
            <Icon name="more-horiz" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: colors.surface,
      borderTopColor: colors.borderLight,
      paddingTop: 8,
    },
    tabBarLabel: {
      fontSize: 11,
      fontWeight: '600',
    },
    fabContainer: {
      position: 'absolute',
      bottom: 8,
      alignItems: 'center',
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
  });
