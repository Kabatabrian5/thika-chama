/**
 * ============================================================
 * MAIN NAVIGATOR (stub)
 * ============================================================
 * Shown only to ACTIVE members. Right now this just renders the
 * placeholder dashboard so the auth flow is fully testable.
 *
 * STEP 3 TODO: replace this with a bottom-tab navigator:
 *   Dashboard | Members | Contribute | Loans | Profile
 * (see docs/BUILD_ORDER.md)
 * ============================================================
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardPlaceholder from '../screens/main/DashboardPlaceholder';

export type MainStackParamList = {
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardPlaceholder} />
    </Stack.Navigator>
  );
}
