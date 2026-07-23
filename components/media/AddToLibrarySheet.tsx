import React, { forwardRef } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { BottomSheet, BottomSheetRef } from '../ui/BottomSheet';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { MediaStatus } from '@/types';
import { statusLabel } from '@/lib/utils/formatters';

interface AddToLibrarySheetProps {
  currentStatus?: MediaStatus | null;
  onStatusSelect: (status: MediaStatus) => void;
  onRemove?: () => void;
}

export const AddToLibrarySheet = forwardRef<BottomSheetRef, AddToLibrarySheetProps>(
  ({ currentStatus, onStatusSelect, onRemove }, ref) => {
    const statuses: MediaStatus[] = ['want', 'current', 'completed', 'paused', 'dropped'];

    const getStatusColor = (status: MediaStatus) => {
      const colors: Record<MediaStatus, string> = {
        want: Colors.statusWant,
        current: Colors.statusWatching,
        completed: Colors.statusCompleted,
        paused: Colors.statusPaused,
        dropped: Colors.statusDropped,
      };
      return colors[status];
    };

    return (
      <BottomSheet ref={ref} title="Set Library Status" snapPoints={['45%', '60%']}>
        <View style={styles.list}>
          {statuses.map((status) => {
            const isSelected = currentStatus === status;
            const color = getStatusColor(status);
            return (
              <Pressable
                key={status}
                style={[
                  styles.item,
                  isSelected && { borderColor: color, backgroundColor: color + '10' },
                ]}
                onPress={() => onStatusSelect(status)}
              >
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={[styles.itemText, isSelected && { color: color, fontFamily: FontFamily.semiBold }]}>
                  {statusLabel(status)}
                </Text>
              </Pressable>
            );
          })}

          {currentStatus && onRemove && (
            <Pressable style={[styles.item, styles.removeItem]} onPress={onRemove}>
              <View style={[styles.dot, { backgroundColor: Colors.error }]} />
              <Text style={[styles.itemText, styles.removeText]}>Remove from Library</Text>
            </Pressable>
          )}
        </View>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 14,
  },
  itemText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  removeItem: {
    marginTop: 8,
    borderColor: Colors.error + '30',
  },
  removeText: {
    color: Colors.error,
    fontFamily: FontFamily.semiBold,
  },
});
