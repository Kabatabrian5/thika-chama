/**
 * ============================================================
 * AUTH NAVIGATOR
 * ============================================================
 * Stack of screens shown to anyone who is NOT yet an ACTIVE
 * member: Register, VerifyEmail, WaitingApproval, Login.
 *
 * RootNavigator.tsx decides whether to show THIS navigator or
 * MainNavigator (dashboard etc) based on session + profile status.
 * ============================================================
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import WaitingApprovalScreen from '../screens/auth/WaitingApprovalScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Typed route params — this is what gives us autocomplete + type
// safety on navigation.navigate('VerifyEmail', { email }) calls.
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  WaitingApproval: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen name="WaitingApproval" component={WaitingApprovalScreen} />
    </Stack.Navigator>
  );
}
