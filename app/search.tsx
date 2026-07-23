import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { MediaItem, MediaType, UserProfile } from '@/types';
import { searchMedia } from '@/lib/api/mediaSearch';
import { Input } from '@/components/ui/Input';
import { MediaCard } from '@/components/media/MediaCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { FollowButton } from '@/components/profile/FollowButton';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { debounce } from '@/lib/utils/helpers';
import { useAuthStore } from '@/store/authStore';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<MediaType | 'all'>('all');
  const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
  const [userResults, setUserResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const session = useAuthStore((state) => state.session);

  const performSearch = async (searchQuery: string, searchType: MediaType | 'all') => {
    if (!searchQuery.trim()) {
      setMediaResults([]);
      setUserResults([]);
      return;
    }
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        searchMedia({ query: searchQuery, type: searchType })
      ];

      // Only search users if type is 'all'
      if (searchType === 'all') {
        promises.push(
          supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
            .limit(5) as any
        );
      }

      const results = await Promise.all(promises);
      setMediaResults(results[0]);

      if (searchType === 'all' && results[1]) {
        const { data: users, error } = results[1];
        if (!error && users) setUserResults(users as UserProfile[]);
        else setUserResults([]);
      } else {
        setUserResults([]);
      }

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q: string, t: MediaType | 'all') => performSearch(q, t), 400),
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text, type);
  };

  const handleTypeChange = (newType: MediaType | 'all') => {
    setType(newType);
    performSearch(query, newType);
  };

  const handleMediaPress = async (item: MediaItem) => {
    try {
      // Upsert to DB cache first so we have a UUID to navigate to
      const { data: cachedItem, error } = await supabase
        .from('media_items')
        .upsert(
          {
            external_id: item.external_id,
            api_source: item.api_source,
            type: item.type,
            title: item.title,
            cover_url: item.cover_url,
            release_year: item.release_year,
            description: item.description,
            genres: item.genres ?? [],
            metadata: item.metadata ?? {},
          },
          { onConflict: 'external_id,api_source' }
        )
        .select('id')
        .single();

      if (error || !cachedItem) throw error;
      router.push(`/media/${(cachedItem as any).id}`);
    } catch (err) {
      console.error('Failed to cache media item', err);
    }
  };

  const filterChips: { label: string; value: MediaType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Movies', value: 'movie' },
    { label: 'TV', value: 'tv' },
    { label: 'Books', value: 'book' },
    { label: 'Anime', value: 'anime' },
  ];

  const renderUser = ({ item }: { item: UserProfile }) => (
    <Pressable style={styles.userCard} onPress={() => router.push(`/profile/${item.username}`)}>
      <Avatar url={item.avatar_url} name={item.display_name ?? item.username} size="sm" />
      <View style={styles.userInfo}>
        <Text style={styles.userDisplayName}>{item.display_name ?? item.username}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
      {session?.user?.id !== item.id && (
        <FollowButton userId={item.id} />
      )}
    </Pressable>
  );

  const renderMedia = ({ item }: { item: MediaItem }) => (
    <View style={styles.mediaCardWrapper}>
      <MediaCard item={item} onPress={() => handleMediaPress(item)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Search', headerTitleStyle: { color: Colors.textPrimary }, headerStyle: { backgroundColor: Colors.surface } }} />
      
      <View style={styles.searchHeader}>
        <Input
          placeholder="Search for movies, books, users..."
          value={query}
          onChangeText={handleQueryChange}
          style={styles.searchInput}
          autoFocus
        />
      </View>

      <View style={styles.chipScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterChips}
          keyExtractor={(item) => item.value}
          renderItem={({ item: chip }) => {
            const isActive = type === chip.value;
            return (
              <Button
                text={chip.label}
                variant={isActive ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => handleTypeChange(chip.value)}
                style={styles.chipButton}
                textStyle={isActive ? styles.chipTextActive : styles.chipText}
              />
            );
          }}
          contentContainerStyle={styles.chipContainer}
        />
      </View>

      {loading && query.trim() ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={[
            ...(userResults.length > 0 ? [{ type: 'header', title: 'Users' }] : []),
            ...userResults.map(u => ({ type: 'user', data: u })),
            ...(mediaResults.length > 0 ? [{ type: 'header', title: 'Media' }] : []),
            ...mediaResults.map(m => ({ type: 'media', data: m }))
          ] as any[]}
          keyExtractor={(item: any, index) => item.type === 'header' ? `header_${item.title}` : (item.type === 'user' ? `user_${item.data.id}` : `media_${item.data.external_id}_${index}`)}
          renderItem={({ item }: { item: any }) => {
            if (item.type === 'header') {
              return <Text style={styles.sectionHeader}>{item.title}</Text>;
            }
            if (item.type === 'user') {
              return renderUser({ item: item.data as UserProfile });
            }
            if (item.type === 'media') {
              return renderMedia({ item: item.data as MediaItem });
            }
            return null;
          }}
          ListEmptyComponent={
            query.trim() ? (
              <Text style={styles.emptyText}>No results found</Text>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Start typing to search...</Text>
              </View>
            )
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
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    marginBottom: 0,
  },
  chipScroll: {
    maxHeight: 56,
  },
  chipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chipButton: {
    borderRadius: 20,
    height: 32,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    fontSize: FontSize.xs,
    color: Colors.textInverse,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userDisplayName: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  userUsername: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  mediaCardWrapper: {
    marginBottom: 8,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
