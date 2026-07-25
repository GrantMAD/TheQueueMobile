import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeed } from '@/hooks/useFeed';
import { ActivityFeed } from '@/components/feed/ActivityFeed';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useRealtime } from '@/hooks/useRealtime';
import { FeedActivity } from '@/types';

type FilterKey = 'all' | 'reviews' | 'status';

const FILTERS: { key: FilterKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all',     label: 'All',            icon: 'apps-outline' },
  { key: 'reviews', label: 'Reviews',         icon: 'star-outline' },
  { key: 'status',  label: 'Status Updates',  icon: 'pulse-outline' },
];

export default function FeedTab() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const {
    data,
    isLoading,
    refetch,
    isRefetching,
    fetchNextPage,
    isFetchingNextPage,
  } = useFeed();

  // Realtime sync for feed changes
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

  const allActivities: FeedActivity[] = data?.pages.flatMap((page) => page) ?? [];

  const activities = useMemo(() => {
    if (activeFilter === 'reviews') {
      return allActivities.filter((a) => a.activity_type === 'review');
    }
    if (activeFilter === 'status') {
      return allActivities.filter((a) => a.activity_type === 'status_update');
    }
    return allActivities;
  }, [allActivities, activeFilter]);

  return (
    <View style={styles.container}>
      {/* ── Header ──────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="albums" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Your Feed</Text>
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
              >
                <Ionicons
                  name={f.icon}
                  size={13}
                  color={isActive ? Colors.primary : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Feed ────────────────────────────────────── */}
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

  // ── Header ──────────────────────────────────────────────
  header: {
    paddingTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryAlpha10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryAlpha20,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },

  // ── Filter chips ─────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryAlpha10,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontFamily: FontFamily.semiBold,
  },
});
