/**
 * ============================================================
 * WELCOME SCREEN
 * ============================================================
 * First screen for signed-out visitors. It introduces the chama
 * and provides the two intentional entry points into auth.
 * ============================================================
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, spacing } from '../../lib/theme';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const handshakeMotion = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentRise = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const handshakeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(handshakeMotion, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(handshakeMotion, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    handshakeLoop.start();
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 700, delay: 350, useNativeDriver: true }),
      Animated.spring(contentRise, { toValue: 0, friction: 8, tension: 45, delay: 350, useNativeDriver: true }),
    ]).start();

    return () => {
      handshakeLoop.stop();
    };
  }, [contentOpacity, contentRise, handshakeMotion]);

  const imageScale = handshakeMotion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1.02, 1.07, 1.02] });
  const imageOpacity = handshakeMotion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1, 0.92] });
  const badgeTranslate = handshakeMotion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -5, 0] });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.photoHero}>
        <Animated.Image
          accessibilityLabel="People shaking hands"
          source={require('../../../assets/handshake-hero.png')}
          style={[styles.heroImage, { opacity: imageOpacity, transform: [{ scale: imageScale }] }]}
        />
        <View style={styles.photoShade} />
        <View style={styles.topRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>TR</Text>
          </View>
          <Text style={styles.brandLabel}>THIKA ROAD CHAMA</Text>
        </View>
        <View style={styles.photoCopy}>
          <Text style={styles.photoKicker}>A COMMUNITY THAT MOVES TOGETHER</Text>
          <Text style={styles.photoTitle}>Stronger together.</Text>
        </View>
        <Animated.View style={[styles.photoBadge, { transform: [{ translateY: badgeTranslate }] }]}>
          <Text style={styles.photoBadgeNumber}>15</Text>
          <Text style={styles.photoBadgeLabel}>members</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.infoPanel, { opacity: contentOpacity, transform: [{ translateY: contentRise }] }]}>
        <Text style={styles.kicker}>WELCOME TO YOUR CHAMA</Text>
        <Text style={styles.title}>Thika Road Chama Group</Text>
        <Text style={styles.subtitle}>
          Save with purpose, support one another, and grow something lasting in our community.
        </Text>

        <View style={styles.promiseRow}>
          <View style={styles.promiseDot}><Text style={styles.promiseIcon}>✓</Text></View>
          <Text style={styles.promiseText}>Simple, secure community savings</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.actions, { opacity: contentOpacity, transform: [{ translateY: contentRise }] }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log in to your chama account"
          onPress={() => navigation.navigate('Login')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>Log in</Text>
          <Text style={styles.buttonArrow}>→</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create a chama account"
          onPress={() => navigation.navigate('Register')}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryButtonText}>Create an account</Text>
        </Pressable>
      </Animated.View>

      <Text style={styles.footer}>Secure savings for the Thika Road community</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  photoHero: { backgroundColor: colors.primaryDark, height: 430, overflow: 'hidden', position: 'relative', width: '100%' },
  heroImage: { height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' },
  photoShade: { backgroundColor: 'rgba(4, 35, 18, 0.48)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  topRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, left: spacing.lg, position: 'absolute', right: spacing.lg, top: 42 },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  brandMarkText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  brandLabel: { color: colors.white, fontSize: 12, fontWeight: '800', letterSpacing: 1.1 },
  photoCopy: { bottom: 48, left: spacing.lg, position: 'absolute', right: spacing.lg },
  photoKicker: { color: '#CDEBD8', fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  photoTitle: { color: colors.white, fontSize: 42, fontWeight: '900', marginTop: spacing.xs },
  photoBadge: { alignItems: 'center', backgroundColor: colors.primary, borderColor: colors.white, borderRadius: 34, borderWidth: 3, bottom: 32, height: 68, justifyContent: 'center', position: 'absolute', right: spacing.lg, width: 68 },
  photoBadgeNumber: { color: colors.white, fontSize: 19, fontWeight: '900' },
  photoBadgeLabel: { color: '#D9F3E2', fontSize: 9, fontWeight: '700' },
  infoPanel: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: spacing.lg, paddingBottom: spacing.md, width: '100%' },
  promiseRow: { alignItems: 'center', flexDirection: 'row', marginTop: spacing.md },
  promiseDot: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 14, height: 28, justifyContent: 'center', width: 28 },
  promiseIcon: { color: colors.primary, fontSize: 16, fontWeight: '900' },
  promiseText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700', marginLeft: spacing.sm },
  avatar: {
    alignItems: 'center',
    borderColor: colors.white,
    borderRadius: 34,
    borderWidth: 4,
    height: 68,
    justifyContent: 'center',
    position: 'absolute',
    top: 32,
    width: 64,
  },
  leftAvatar: { backgroundColor: '#4AAE72', left: 24 },
  rightAvatar: { backgroundColor: '#2D6CDF', right: 24 },
  avatarText: { color: colors.white, fontSize: 25, fontWeight: '800' },
  leftArm: {
    backgroundColor: '#4AAE72',
    height: 20,
    left: 50,
    position: 'absolute',
    top: 89,
    transform: [{ rotate: '18deg' }],
    width: 62,
  },
  rightArm: {
    backgroundColor: '#2D6CDF',
    height: 20,
    position: 'absolute',
    right: 50,
    top: 89,
    transform: [{ rotate: '-18deg' }],
    width: 62,
  },
  handshakeBubble: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: '#C3E5CF',
    borderRadius: 38,
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    left: 68,
    position: 'absolute',
    top: 75,
    width: 72,
  },
  handshake: { fontSize: 37 },
  communityBadge: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryLight,
    borderRadius: 30,
    borderWidth: 4,
    bottom: 14,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 56,
  },
  communityBadgeText: { color: colors.white, fontSize: 17, fontWeight: '900' },
  communityBadgeLabel: { color: '#CDEBD8', fontSize: 9, fontWeight: '700' },
  kicker: { color: colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1.8 },
  title: { color: colors.primaryDark, fontSize: 36, fontWeight: '900', lineHeight: 40, marginTop: spacing.sm, textAlign: 'center' },
  subtitle: { color: colors.textMuted, fontSize: 15, lineHeight: 23, marginTop: spacing.md, maxWidth: 320, textAlign: 'center' },
  actions: { alignSelf: 'center', gap: spacing.sm, marginTop: spacing.lg, maxWidth: 560, width: '100%' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
  buttonArrow: { color: colors.white, fontSize: 22, fontWeight: '400', marginLeft: spacing.sm },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 56,
  },
  secondaryButtonText: { color: colors.primaryDark, fontSize: 16, fontWeight: '800' },
  pressed: { opacity: 0.78 },
  footer: { color: colors.textMuted, fontSize: 11, marginTop: spacing.lg, textAlign: 'center' },
});