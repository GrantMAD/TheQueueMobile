import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useLibrary } from '@/hooks/useLibrary';
import { MediaCard } from '@/components/media/MediaCard';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Skeleton } from '@/components/ui/Skeleton';
import { MediaStatus, LibraryEntry } from '@/types';
import { statusLabel } from '@/lib/utils/formatters';

export default function LibraryTab() {
  const { library, isLoading, refetch } = useLibrary();
  const [activeTab, setActiveTab] = useState<MediaStatus | 'all'>('all');

  const tabs: { label: string; value: MediaStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Watching', value: 'current' },
    { label: 'Want', value: 'want' },
    { label: 'Completed', value: 'completed' },
    { label: 'Paused', value: 'paused' },
    { label: 'Dropped', value: 'dropped' },
  ];

  const filteredLibrary = library.filter((entry) => {
    if (activeTab === 'all') return true;
    return entry.status === activeTab;
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <FlatList
          data={tabs}
          horizontal
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
          renderItem={({ item }) => {
            const isActive = activeTab === item.value;
            return (
              <Pressable
                onPress={() => setActiveTab(item.value)}
                style={[
                  styles.tab,
                  isActive && styles.tabActive,
                ]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading && filteredLibrary.length === 0 ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((n) => (
            <View key={n} style={styles.skeletonCard}>
              <Skeleton width={80} height={120} style={{ borderRadius: 8 }} />
              <View style={styles.skeletonInfo}>
                <Skeleton width={150} height={20} />
                <Skeleton width={100} height={14} style={{ marginTop: 8 }} />
                <Skeleton width={60} height={24} style={{ marginTop: 16, borderRadius: 12 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredLibrary}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isLoading && filteredLibrary.length > 0} onRefresh={refetch} tintColor={Colors.primary} />}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          renderItem={({ item }) => {
            if (!item.media_item) return null;
            return (
              <MediaCard
                item={item.media_item}
                status={item.status}
                onPress={() => router.push(`/media/${item.media_item?.external_id}`)}
              />
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items in this section</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    backgroundColor: Colors.surface,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textInverse,
    fontFamily: FontFamily.bold,
  },
  skeletonContainer: {
    padding: 16,
    gap: 16,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  skeletonInfo: {
    marginLeft: 16,
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
