import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface BadgeProps {
  text: string;
  variant?: 'want' | 'watching' | 'completed' | 'dropped' | 'paused' | 'default';
  count?: number;
}

export function Badge({ text, variant = 'default', count }: BadgeProps) {
  const colorMap = {
    want: Colors.statusWant,
    watching: Colors.statusWatching,
    completed: Colors.statusCompleted,
    dropped: Colors.statusDropped,
    paused: Colors.statusPaused,
    default: Colors.surfaceBorder,
  };

  const selectedBg = colorMap[variant] || Colors.surfaceBorder;

  return (
    <View style={[styles.badge, { backgroundColor: selectedBg + '20', borderColor: selectedBg }]}>
      <Text style={[styles.text, { color: selectedBg }]}>
        {text}
        {count !== undefined && <Text style={styles.count}> ({count})</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
  },
  count: {
    fontFamily: FontFamily.regular,
  },
});
