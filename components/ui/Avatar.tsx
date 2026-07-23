import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { getInitials, stringToColor } from '@/lib/utils/helpers';

interface AvatarProps {
  url?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ringColor?: string;
}

export function Avatar({ url, name = 'User', size = 'md', ringColor }: AvatarProps) {
  const sizeValue =
    size === 'sm' ? 32 : size === 'md' ? 44 : size === 'lg' ? 64 : 96;

  const containerStyle = [
    styles.container,
    { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 },
    ringColor ? { borderWidth: 2, borderColor: ringColor } : null,
  ];

  if (url) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: url }}
          style={{ width: '100%', height: '100%', borderRadius: sizeValue / 2 }}
          transition={200}
        />
      </View>
    );
  }

  const fallbackBg = stringToColor(name);
  const initials = getInitials(name);
  const textFontSize =
    size === 'sm'
      ? FontSize.xs
      : size === 'md'
      ? FontSize.base
      : size === 'lg'
      ? FontSize.xl
      : FontSize['3xl'];

  return (
    <View style={[containerStyle, { backgroundColor: fallbackBg }]}>
      <Text style={[styles.initials, { fontSize: textFontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: FontFamily.bold,
    color: '#ffffff',
  },
});
