import React from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { FeedActivity } from '@/types';
import { ActivityCard } from './ActivityCard';
import { Skeleton } from '../ui/Skeleton';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface ActivityFeedProps {
  activities: FeedActivity[];
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
}

export function ActivityFeed({
  activities,
  isLoading,
  onRefresh,
  isRefreshing,
  onEndReached,
  isFetchingNextPage,
}: ActivityFeedProps) {
  if (isLoading && activities.length === 0) {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={styles.skeletonCard}>
            <View style={styles.skeletonHeader}>
              <Skeleton width={32} height={32} variant="circle" />
              <View style={styles.skeletonHeaderInfo}>
                <Skeleton width={120} height={14} />
                <Skeleton width={60} height={10} style={{ marginTop: 6 }} />
              </View>
            </View>
            <Skeleton width="80%" height={16} />
            <Skeleton width="100%" height={48} style={{ marginTop: 12 }} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      keyExtractor={(item, index) => `${item.occurred_at}_${index}`}
      renderItem={({ item }) => <ActivityCard activity={item} />}
      onRefresh={undefined}
      refreshing={undefined}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator color={Colors.primary} style={styles.footerLoader} />
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Feed is currently quiet.</Text>
          <Text style={styles.emptySubtext}>Follow your friends to see their activity here!</Text>
        </View>
      }
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    padding: 16,
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonHeaderInfo: {
    marginLeft: 12,
  },
  footerLoader: {
    marginVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
