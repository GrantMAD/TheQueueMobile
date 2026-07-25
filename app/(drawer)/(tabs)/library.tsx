import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, Pressable, RefreshControl, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useLibrary } from '@/hooks/useLibrary';
import { MediaCard } from '@/components/media/MediaCard';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Skeleton } from '@/components/ui/Skeleton';
import { MediaStatus, LibraryEntry } from '@/types';
import { statusLabel } from '@/lib/utils/formatters';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
export default function LibraryTab() {
  const { library, isLoading, refetch } = useLibrary();
  const [activeTab, setActiveTab] = useState<MediaStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'rating'>('date');

  const tabs: { label: string; value: MediaStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Watching', value: 'current' },
    { label: 'Want', value: 'want' },
    { label: 'Completed', value: 'completed' },
    { label: 'Paused', value: 'paused' },
    { label: 'Dropped', value: 'dropped' },
  ];

  const filteredLibrary = library.filter((entry) => {
    // 1. Status filter
    if (activeTab !== 'all' && entry.status !== activeTab) return false;
    
    // 2. Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = entry.media_item?.title?.toLowerCase() || '';
      if (!title.includes(query)) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // 3. Sort
    if (sortBy === 'title') {
      return (a.media_item?.title || '').localeCompare(b.media_item?.title || '');
    }
    if (sortBy === 'rating') {
      return (b.personal_rating || 0) - (a.personal_rating || 0);
    }
    // default: date added
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="library-outline" size={28} color={Colors.textPrimary} style={styles.titleIcon} />
          <Text style={styles.title}>Your Library</Text>
        </View>
        <Text style={styles.description}>
          Keep track of everything you've watched, read, or want to explore.
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <Input
          placeholder="Search your library..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
            <Button 
              text="Date Added" 
              variant={sortBy === 'date' ? 'primary' : 'secondary'} 
              size="sm" 
              onPress={() => setSortBy('date')} 
              style={styles.sortBtn} 
            />
            <Button 
              text="Title A-Z" 
              variant={sortBy === 'title' ? 'primary' : 'secondary'} 
              size="sm" 
              onPress={() => setSortBy('title')} 
              style={styles.sortBtn} 
            />
            <Button 
              text="Rating" 
              variant={sortBy === 'rating' ? 'primary' : 'secondary'} 
              size="sm" 
              onPress={() => setSortBy('rating')} 
              style={styles.sortBtn} 
            />
          </ScrollView>
        </View>
      </View>

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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  sortScroll: {
    gap: 8,
  },
  sortBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
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
