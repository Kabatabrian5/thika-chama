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
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/main/DashboardScreen';
import MembersScreen from '../screens/main/MembersScreen';
import ContributeScreen from '../screens/main/ContributeScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
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
        tabBarStyle: { borderTopColor: '#DCE9E0', height: 68, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
    }}>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ color }) => <TabIcon glyph="⌂" color={color} /> }} />
      <Tabs.Screen name="Members" component={MembersScreen} options={{ tabBarIcon: ({ color }) => <TabIcon glyph="♧" color={color} /> }} />
      <Tabs.Screen name="Contribute" component={ContributeScreen} options={{ tabBarIcon: ({ color }) => <TabIcon glyph="＋" color={color} /> }} />
      <Tabs.Screen name="Loans" component={ComingSoonScreen} options={{ tabBarIcon: ({ color }) => <TabIcon glyph="▤" color={color} /> }} />
      <Tabs.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <TabIcon glyph="●" color={color} /> }} />
    </Tabs.Navigator>
  );
}

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ color, fontSize: 22, fontWeight: '700', lineHeight: 24 }}>{glyph}</Text>;
}

// These tabs establish the final navigation contract; each feature
// screen will replace this temporary view in its build-order step.
function ComingSoonScreen() {
  return null;
}
