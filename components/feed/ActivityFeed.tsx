import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
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

/** Skeleton loader shaped like the new media-forward card */
function CardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      {/* Poster placeholder */}
      <Skeleton width={72} height={108} style={{ borderRadius: 10 }} />

      {/* Content */}
      <View style={styles.skeletonContent}>
        {/* User row */}
        <View style={styles.skeletonUserRow}>
          <Skeleton width={32} height={32} variant="circle" />
          <View style={{ gap: 6, flex: 1 }}>
            <Skeleton width={110} height={12} />
            <Skeleton width={60} height={10} />
          </View>
        </View>

        {/* Activity pill */}
        <Skeleton width={90} height={20} style={{ borderRadius: 20 }} />

        {/* Title */}
        <Skeleton width="90%" height={16} />
        <Skeleton width="60%" height={16} />
      </View>
    </View>
  );
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
          <CardSkeleton key={n} />
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
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
        />
      }
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
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>Feed is currently quiet.</Text>
          <Text style={styles.emptySubtext}>
            Follow your friends to see their activity here!
          </Text>
        </View>
      }
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  // ── Skeleton ────────────────────────────────────────────
  skeletonContainer: {
    padding: 16,
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
    justifyContent: 'flex-start',
  },
  skeletonUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },

  // ── Footer / empty ──────────────────────────────────────
  footerLoader: {
    marginVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
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
    lineHeight: 20,
  },

  // ── List content ────────────────────────────────────────
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
});
