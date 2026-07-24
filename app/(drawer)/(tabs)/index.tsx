import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeed } from '@/hooks/useFeed';
import { ActivityFeed } from '@/components/feed/ActivityFeed';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useRealtime } from '@/hooks/useRealtime';

export default function FeedTab() {
  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeed();

  // Realtime sync for feed changes: invalidates feed query whenever reviews or user_media lists edit
  useRealtime({
    channelName: 'feed-updates-reviews',
    tableName: 'reviews',
    queryKeyToInvalidate: ['friend-feed'],
  });

  useRealtime({
    channelName: 'feed-updates-media',
    tableName: 'user_media',
    queryKeyToInvalidate: ['friend-feed'],
  });

  const activities = data?.pages.flatMap((page) => page) ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="albums-outline" size={28} color={Colors.textPrimary} style={styles.titleIcon} />
          <Text style={styles.title}>Your Feed</Text>
        </View>
        <Text style={styles.description}>
          See what your friends are watching and reviewing.
        </Text>
      </View>
      <ActivityFeed
        activities={activities}
        isLoading={isLoading}
        onRefresh={refetch}
        isRefreshing={isRefetching}
        onEndReached={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
});
