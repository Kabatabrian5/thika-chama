/**
 * ============================================================
 * MAIN NAVIGATOR
 * ============================================================
 * This is the navigation boundary for ACTIVE members. The tabs
 * are introduced in Step 3 so every later feature has a stable
 * place to live without changing the auth/status gate.
 * ============================================================
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/main/DashboardScreen';
import MembersScreen from '../screens/main/MembersScreen';
import { colors } from '../lib/theme';

export type MainTabParamList = {
  Dashboard: undefined;
  Members: undefined;
  Contribute: undefined;
  Loans: undefined;
  Profile: undefined;
};

const Tabs = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tabs.Navigator initialRouteName="Dashboard" screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
    }}>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} />
      <Tabs.Screen name="Members" component={MembersScreen} />
      <Tabs.Screen name="Contribute" component={ComingSoonScreen} />
      <Tabs.Screen name="Loans" component={ComingSoonScreen} />
      <Tabs.Screen name="Profile" component={ComingSoonScreen} />
    </Tabs.Navigator>
  );
}

// These tabs establish the final navigation contract; each feature
// screen will replace this temporary view in its build-order step.
function ComingSoonScreen() {
  return null;
}
