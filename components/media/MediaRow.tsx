import React from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import { MediaItem } from '@/types';
import { MediaCard } from './MediaCard';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  onItemPress: (item: MediaItem) => void;
}

export function MediaRow({ title, items, onItemPress }: MediaRowProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={items}
        horizontal
        keyExtractor={(item) => `${item.api_source}_${item.external_id}`}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <MediaCard item={item} onPress={() => onItemPress(item)} />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  cardContainer: {
    width: 280,
    marginRight: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
});
