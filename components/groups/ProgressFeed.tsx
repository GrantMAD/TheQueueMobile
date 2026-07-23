import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { MediaItem } from '@/types';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { relativeDate, formatEpisodeLabel } from '@/lib/utils/formatters';

interface ProgressFeedItem {
  id: string;
  user_id: string;
  current_season?: number | null;
  current_episode?: number | null;
  current_page?: number | null;
  note?: string | null;
  created_at: string;
  media_item?: MediaItem | null;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ProgressFeedProps {
  progressUpdates: ProgressFeedItem[];
}

export function ProgressFeed({ progressUpdates }: ProgressFeedProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={progressUpdates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const authorName = item.profile?.display_name ?? item.profile?.username ?? 'Someone';
          
          let progressDetail = '';
          if (item.current_page) {
            progressDetail = `read page ${item.current_page}`;
          } else if (item.current_episode) {
            progressDetail = `watched ${formatEpisodeLabel(item.current_episode, item.current_season)}`;
          }

          return (
            <Card style={styles.card}>
              <View style={styles.header}>
                <Avatar url={item.profile?.avatar_url} name={authorName} size="sm" />
                <View style={styles.headerInfo}>
                  <Text style={styles.actorText}>
                    {authorName} <Text style={styles.actionText}>{progressDetail}</Text>
                  </Text>
                  <Text style={styles.date}>{relativeDate(item.created_at)}</Text>
                </View>
              </View>

              {item.media_item && (
                <Text style={styles.mediaTitle}>{item.media_item.title}</Text>
              )}

              {item.note && (
                <View style={styles.noteBlock}>
                  <Text style={styles.noteText}>"{item.note}"</Text>
                </View>
              )}
            </Card>
          );
        }}
        ListHeaderComponent={<Text style={styles.title}>Members Progress Feed</Text>}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No progress updates reported yet.</Text>
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
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  actorText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  actionText: {
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  date: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  mediaTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    marginLeft: 42,
    marginBottom: 6,
  },
  noteBlock: {
    backgroundColor: Colors.surfaceElevated,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    padding: 10,
    borderRadius: 6,
    marginLeft: 42,
  },
  noteText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
