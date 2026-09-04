/**
 * ============================================================
 * APP SPLASH SCREEN
 * ============================================================
 * Wordless launch screen shown briefly before the signed-out
 * member reaches Login. Keeping this route lightweight makes the
 * first app frame feel like a real mobile launch experience.
 * ============================================================
 */
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../lib/theme';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const SPLASH_DURATION_MS = 1400;

export default function WelcomeScreen({ navigation }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]);

    entrance.start();
    const timer = setTimeout(() => navigation.replace('Login'), SPLASH_DURATION_MS);

    return () => {
      entrance.stop();
      clearTimeout(timer);
    };
  }, [logoOpacity, logoScale, navigation]);

  return (
    <View style={styles.screen}>
      <Animated.Image
        accessibilityLabel="Thika Road Chama app logo"
        source={require('../../../assets/icon.png')}
        style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      />
      <ActivityIndicator color={colors.primary} size="small" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    borderRadius: 28,
    height: 148,
    width: 148,
  },
  loader: {
    marginTop: 34,
  },
});
