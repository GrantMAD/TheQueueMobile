import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface ButtonProps {
  text: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  text,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const handlePress = () => {
    if (loading || disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const buttonStyles = [
    styles.button,
    (styles as any)[variant],
    (styles as any)[size],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    (styles as any)[`${variant}Text`],
    (styles as any)[`${size}Text`],
    textStyle,
  ];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        buttonStyles,
        pressed && !disabled && !loading && styles.pressed,
      ] as any}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.textInverse : Colors.textPrimary}
          size="small"
        />
      ) : (
        <Text style={textStyles as any}>{text}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: FontFamily.semiBold,
    textAlign: 'center',
  },
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  primaryText: {
    color: Colors.textInverse,
  },
  secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: Colors.textSecondary,
  },
  destructive: {
    backgroundColor: Colors.error,
  },
  destructiveText: {
    color: Colors.textPrimary,
  },
  // Sizes
  sm: {
    height: 38,
    paddingHorizontal: 16,
  },
  smText: {
    fontSize: FontSize.sm,
  },
  md: {
    height: 48,
    paddingHorizontal: 20,
  },
  mdText: {
    fontSize: FontSize.base,
  },
  lg: {
    height: 56,
    paddingHorizontal: 24,
  },
  lgText: {
    fontSize: FontSize.lg,
  },
});
