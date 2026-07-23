import React, { forwardRef, useState } from 'react';
import { View, StyleSheet, Text, Pressable, Switch } from 'react-native';
import { BottomSheet, BottomSheetRef } from '../ui/BottomSheet';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ReviewFormProps {
  initialRating?: number;
  initialHook?: string;
  initialBody?: string;
  initialSpoilers?: boolean;
  onSubmit: (data: { rating: number; hookText: string; bodyText: string; containsSpoilers: boolean }) => void;
  isEditing?: boolean;
}

export const ReviewForm = forwardRef<BottomSheetRef, ReviewFormProps>(
  ({ initialRating = 5, initialHook = '', initialBody = '', initialSpoilers = false, onSubmit, isEditing = false }, ref) => {
    const [rating, setRating] = useState(initialRating);
    const [hookText, setHookText] = useState(initialHook);
    const [bodyText, setBodyText] = useState(initialBody);
    const [containsSpoilers, setContainsSpoilers] = useState(initialSpoilers);

    const handleRatingSelect = (val: number) => {
      setRating(val);
    };

    const handleSubmit = () => {
      if (!hookText.trim()) return;
      onSubmit({
        rating,
        hookText: hookText.trim(),
        bodyText: bodyText.trim(),
        containsSpoilers,
      });
    };

    return (
      <BottomSheet ref={ref} title={isEditing ? 'Edit Review' : 'Write Review'} snapPoints={['65%', '90%']}>
        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Rating: {rating.toFixed(1)} / 10</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleRatingSelect(star)}
                style={styles.starBtn}
              >
                <Text style={[styles.starText, star <= rating && styles.starActive]}>★</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="One-sentence hook (280 chars max) *"
            placeholder="What did you think in one sentence?"
            value={hookText}
            onChangeText={setHookText}
            charLimit={280}
            multiline
            numberOfLines={2}
            style={styles.hookInput}
          />

          <Input
            label="Extended thoughts (Optional)"
            placeholder="Add detailed reviews, thoughts or explanations..."
            value={bodyText}
            onChangeText={setBodyText}
            multiline
            numberOfLines={4}
            style={styles.bodyInput}
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Contains Spoilers</Text>
              <Text style={styles.switchDesc}>Blur review content from feed by default</Text>
            </View>
            <Switch
              value={containsSpoilers}
              onValueChange={setContainsSpoilers}
              trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? undefined : Colors.textPrimary}
            />
          </View>

          <Button
            text={isEditing ? 'Save Changes' : 'Submit Review'}
            onPress={handleSubmit}
            disabled={!hookText.trim()}
            style={styles.submitBtn}
          />
        </View>
      </BottomSheet>
    );
  }
);

import { Platform } from 'react-native';

const styles = StyleSheet.create({
  form: {
    gap: 18,
  },
  sectionLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  starBtn: {
    padding: 4,
  },
  starText: {
    fontSize: FontSize['2xl'],
    color: Colors.surfaceBorder,
  },
  starActive: {
    color: Colors.primary,
  },
  hookInput: {
    height: 64,
    paddingTop: 12,
  },
  bodyInput: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  switchLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  switchDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  submitBtn: {
    marginTop: 10,
  },
});
