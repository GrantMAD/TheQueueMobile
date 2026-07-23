import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface ProgressTrackerProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function ProgressTracker({ label, value, onChange, max }: ProgressTrackerProps) {
  const handleDecrement = () => {
    if (value > 0) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {value}
          {max !== undefined && <Text style={styles.max}> / {max}</Text>}
        </Text>
      </View>

      <View style={styles.controls}>
        <Button
          text="−"
          variant="secondary"
          size="sm"
          onPress={handleDecrement}
          style={styles.btn}
          disabled={value <= 0}
        />
        <Button
          text="+"
          variant="secondary"
          size="sm"
          onPress={handleIncrement}
          style={styles.btn}
          disabled={max !== undefined && value >= max}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  max: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    width: 44,
    height: 38,
    borderRadius: 8,
  },
});
