import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { MediaItem } from '@/types';
import { MediaCard } from '../media/MediaCard';
import { Button } from '../ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface GroupMediaPoolProps {
  poolItems: { id: string; media_item: MediaItem; added_by: string }[];
  onRemoveItem?: (poolItemId: string) => void;
  onAddItemPress: () => void;
  currentUserId: string;
  isOwner: boolean;
}

export function GroupMediaPool({
  poolItems,
  onRemoveItem,
  onAddItemPress,
  currentUserId,
  isOwner,
}: GroupMediaPoolProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={poolItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const canRemove = isOwner || item.added_by === currentUserId;
          return (
            <View style={styles.cardWrapper}>
              <MediaCard item={item.media_item} />
              {canRemove && onRemoveItem && (
                <Button
                  text="Remove"
                  variant="destructive"
                  size="sm"
                  onPress={() => onRemoveItem(item.id)}
                  style={styles.removeBtn}
                />
              )}
            </View>
          );
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Button
              text="Propose Media to Pool"
              variant="primary"
              onPress={onAddItemPress}
              style={styles.addBtn}
            />
            <Text style={styles.sectionTitle}>Group Media Pool ({poolItems.length})</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No titles in the pool yet. Start proposing!</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  addBtn: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  removeBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
    height: 28,
    borderRadius: 8,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
