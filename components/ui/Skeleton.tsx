import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  variant?: 'rect' | 'circle';
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, variant = 'rect', style }: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const combinedStyle = [
    styles.skeleton,
    variant === 'circle' ? styles.circle : null,
    { width, height, opacity: shimmerAnim },
    style,
  ];

  return <Animated.View style={combinedStyle as any} />;
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
  },
  circle: {
    borderRadius: 9999,
  },
});
