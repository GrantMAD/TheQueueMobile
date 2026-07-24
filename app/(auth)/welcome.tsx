import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
            defaultSource={require('@/assets/icon.png')}
          />
          <Text style={styles.appName}>The Queue</Text>
          <Text style={styles.tagline}>Your watch list, your crew</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          text="Get Started"
          variant="primary"
          onPress={() => router.push('/register' as any)}
          style={styles.button}
        />
        <Button
          text="Log In"
          variant="secondary"
          onPress={() => router.push('/login' as any)}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['4xl'],
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: 16,
    width: '100%',
  },
  button: {
    width: '100%',
  },
});
