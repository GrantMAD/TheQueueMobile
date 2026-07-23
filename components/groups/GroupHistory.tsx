import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { MediaItem } from '@/types';
import { MediaCard } from '../media/MediaCard';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { formatDate } from '@/lib/utils/formatters';

interface GroupHistoryProps {
  historyItems: { id: string; media_item: MediaItem; decided_at: string }[];
}

export function GroupHistory({ historyItems }: GroupHistoryProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemWrapper}>
            <View style={styles.timeline}>
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.date}>{formatDate(item.decided_at)}</Text>
              <MediaCard item={item.media_item} />
            </View>
          </View>
        )}
        ListHeaderComponent={<Text style={styles.title}>History Timeline</Text>}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No winning picks logged in history yet.</Text>
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
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  itemWrapper: {
    flexDirection: 'row',
  },
  timeline: {
    width: 24,
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: Colors.surfaceBorder,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 20,
    zIndex: 1,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 20,
  },
  date: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
