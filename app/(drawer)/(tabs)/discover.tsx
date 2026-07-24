import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useGroups } from '@/hooks/useGroups';
import { supabase } from '@/lib/supabase/client';
import { Group, MediaItem } from '@/types';
import { Input } from '@/components/ui/Input';
import { GroupCard } from '@/components/groups/GroupCard';
import { MediaRow } from '@/components/media/MediaRow';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useUIStore } from '@/store/uiStore';

export default function DiscoverTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [trendingMedia, setTrendingMedia] = useState<MediaItem[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  const { groups: joinedGroups, joinGroup, refetch: refetchJoined } = useGroups();
  const showToast = useUIStore((state) => state.showToast);

  // Fetch public groups
  const fetchPublicGroups = async (query: string) => {
    setLoadingGroups(true);
    try {
      let req = supabase
        .from('groups')
        .select('*')
        .eq('type', 'public');

      if (query.trim()) {
        req = req.ilike('name', `%${query.trim()}%`);
      }

      const { data, error } = await req.limit(10);
      if (!error && data) setPublicGroups(data as unknown as Group[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch trending media (recently completed items)
  const fetchTrendingMedia = async () => {
    setLoadingTrending(true);
    try {
      // Find popular items from media_items
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .limit(10);

      if (!error && data) setTrendingMedia(data as unknown as MediaItem[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrending(false);
    }
  };

  useEffect(() => {
    fetchPublicGroups(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    fetchTrendingMedia();
  }, []);

  const handleJoin = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      showToast('Successfully joined group!', 'success');
      refetchJoined();
      fetchPublicGroups(searchQuery);
    } catch (err: any) {
      showToast(err.message || 'Failed to join group', 'error');
    }
  };

  const isUserMember = (groupId: string) => {
    return joinedGroups.some((jg) => jg.id === groupId);
  };

  return (
    <FlatList
      data={publicGroups}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.groupCardWrapper}>
          <GroupCard
            group={item}
            onPress={() => router.push(`/groups/${item.id}`)}
            onJoinPress={() => handleJoin(item.id)}
            isMember={isUserMember(item.id)}
          />
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Input
            placeholder="Search public crews..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            clearButtonMode="while-editing"
          />

          {loadingTrending ? (
            <ActivityIndicator color={Colors.primary} style={styles.loader} />
          ) : (
            <MediaRow
              title="Trending Picks"
              items={trendingMedia}
              onItemPress={(item) => router.push(`/media/${item.external_id}`)}
            />
          )}

          <Text style={styles.sectionTitle}>Public Groups</Text>
        </View>
      }
      ListEmptyComponent={
        loadingGroups ? (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        ) : (
          <Text style={styles.emptyText}>No groups found</Text>
        )
      }
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 12,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  loader: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  groupCardWrapper: {
    paddingHorizontal: 16,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});
