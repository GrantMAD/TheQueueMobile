import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
});
