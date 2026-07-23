import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { MediaItem, MediaStatus } from '@/types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatRuntime, formatPageCount, mediaTypeLabel } from '@/lib/utils/formatters';

interface MediaDetailProps {
  item: MediaItem;
  status?: MediaStatus;
  onStatusPress?: () => void;
  actionButtonText?: string;
  onActionButtonPress?: () => void;
  children?: React.ReactNode;
}

export function MediaDetail({
  item,
  status,
  onStatusPress,
  actionButtonText,
  onActionButtonPress,
  children,
}: MediaDetailProps) {
  // Determine type specific secondary indicators
  let details: string[] = [];
  if (item.type === 'movie' && item.metadata?.runtime) {
    details.push(formatRuntime(item.metadata.runtime as number));
  } else if (item.type === 'book') {
    if (item.metadata?.author) details.push(`By ${item.metadata.author}`);
    if (item.metadata?.page_count) details.push(formatPageCount(item.metadata.page_count as number));
  } else if (item.type === 'tv' || item.type === 'anime') {
    if (item.metadata?.total_seasons) details.push(`${item.metadata.total_seasons} Seasons`);
    if (item.metadata?.total_episodes) details.push(`${item.metadata.total_episodes} Episodes`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.coverContainer}>
          {item.cover_url ? (
            <Image source={{ uri: item.cover_url }} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={styles.placeholderCover}>
              <Text style={styles.placeholderText}>No Cover</Text>
            </View>
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>{item.title}</Text>
          {item.release_year && <Text style={styles.year}>{item.release_year}</Text>}

          <View style={styles.badgeContainer}>
            <Badge text={mediaTypeLabel(item.type)} variant="default" />
            {status && <Badge text={status === 'current' ? 'Watching' : status === 'want' ? 'Want' : status.toUpperCase()} variant={status === 'current' ? 'watching' : status} />}
          </View>

          {details.length > 0 && (
            <Text style={styles.metadataText}>{details.join('  •  ')}</Text>
          )}

          <View style={styles.actions}>
            {onStatusPress && (
              <Button
                text={status ? 'Update Status' : 'Add to Library'}
                variant={status ? 'secondary' : 'primary'}
                onPress={onStatusPress}
                size="sm"
                style={styles.actionBtn}
              />
            )}
            {actionButtonText && onActionButtonPress && (
              <Button
                text={actionButtonText}
                variant="primary"
                onPress={onActionButtonPress}
                size="sm"
                style={styles.actionBtn}
              />
            )}
          </View>
        </View>
      </View>

      {item.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}

      {item.genres && item.genres.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genres</Text>
          <View style={styles.genresContainer}>
            {item.genres.map((genre) => (
              <View key={genre} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  coverContainer: {
    width: 110,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: FontFamily.medium,
    color: Colors.textMuted,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  year: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metadataText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  genreText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
