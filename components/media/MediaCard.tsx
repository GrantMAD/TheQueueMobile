import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { MediaItem, MediaStatus } from '@/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { mediaTypeLabel, formatRuntime, formatPageCount } from '@/lib/utils/formatters';

interface MediaCardProps {
  item: MediaItem;
  status?: MediaStatus;
  onPress?: () => void;
}

export function MediaCard({ item, status, onPress }: MediaCardProps) {
  // Determine type-specific secondary label
  let secondaryLabel = '';
  if (item.type === 'movie' && item.metadata?.runtime) {
    secondaryLabel = formatRuntime(item.metadata.runtime as number);
  } else if (item.type === 'book' && item.metadata?.page_count) {
    secondaryLabel = formatPageCount(item.metadata.page_count as number);
  } else if ((item.type === 'tv' || item.type === 'anime') && item.metadata?.total_episodes) {
    secondaryLabel = `${item.metadata.total_episodes} episodes`;
  }

  // Get color for type-specific badge
  const typeColors: Record<string, string> = {
    movie: Colors.typeMovie,
    tv: Colors.typeTv,
    book: Colors.typeBook,
    anime: Colors.typeAnime,
    podcast: Colors.typePodcast,
    album: Colors.typeAlbum,
  };
  const typeColor = typeColors[item.type] || Colors.primary;

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {item.cover_url ? (
            <Image
              source={{ uri: item.cover_url }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Cover</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            {item.release_year && (
              <Text style={styles.year}>({item.release_year})</Text>
            )}
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '15', borderColor: typeColor }]}>
              <Text style={[styles.typeText, { color: typeColor }]}>{mediaTypeLabel(item.type)}</Text>
            </View>
            {status && (
              <Badge
                text={status === 'want' ? 'Want to watch' : status === 'current' ? 'Watching' : status.toUpperCase()}
                variant={status === 'current' ? 'watching' : status}
              />
            )}
          </View>

          {secondaryLabel ? (
            <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 10,
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: 70,
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  year: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginVertical: 6,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs - 1,
  },
  secondaryLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
