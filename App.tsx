/**
 * ============================================================
 * APP ENTRY POINT
 * ============================================================
 * Deliberately tiny — all real logic lives in RootNavigator,
 * which decides Auth vs Main based on session + profile status.
 * ============================================================
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}
