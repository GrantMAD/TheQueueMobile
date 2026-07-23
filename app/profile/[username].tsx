import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, Text } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase/client';
import { UserProfile, LibraryEntry } from '@/types';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { FollowButton } from '@/components/profile/FollowButton';
import { MediaCard } from '@/components/media/MediaCard';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { useAuthStore } from '@/store/authStore';

export default function PublicProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const session = useAuthStore((state) => state.session);

  const fetchProfileAndLibrary = async () => {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (profileError || !profileData) {
        setLoading(false);
        return;
      }
      setProfile(profileData as any);

      // Check follow status if logged in
      let follows = false;
      const isSelf = session?.user?.id === (profileData as any).id;
      if (session?.user?.id && !isSelf) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', session.user.id)
          .eq('following_id', (profileData as any).id)
          .single();
        if (followData) follows = true;
      }
      setIsFollowing(follows);

      // Fetch library if public or following or self
      if ((profileData as any).is_public || follows || isSelf) {
        const { data: libData } = await supabase
          .from('library')
          .select('*, media_item:media_items(*)')
          .eq('user_id', (profileData as any).id)
          .order('created_at', { ascending: false });
        
        if (libData) {
          setLibrary(libData as any[]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) fetchProfileAndLibrary();
  }, [username, session]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  const isSelf = session?.user?.id === profile.id;
  const canViewLibrary = profile.is_public || isFollowing || isSelf;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: `@${profile.username}`, 
          headerTitleStyle: { color: Colors.textPrimary }, 
          headerStyle: { backgroundColor: Colors.surface } 
        }} 
      />
      <FlatList
        data={canViewLibrary ? library : []}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <ProfileHeader
              profile={profile}
              isSelf={isSelf}
              rightSlot={
                !isSelf && (
                  <FollowButton
                    userId={profile.id}
                    initialIsFollowing={isFollowing}
                    onToggle={setIsFollowing}
                  />
                )
              }
            />
            {!canViewLibrary && (
              <View style={styles.privateContainer}>
                <Text style={styles.privateTitle}>This account is private</Text>
                <Text style={styles.privateSubtitle}>Follow this user to see their library</Text>
              </View>
            )}
            {canViewLibrary && library.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Library is empty</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <MediaCard
              item={item.media_item!}
              status={item.status}
              onPress={() => router.push(`/media/${item.media_item_id}`)}
            />
          </View>
        )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
  headerWrapper: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  listItem: {
    paddingHorizontal: 16,
  },
  privateContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  privateTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  privateSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
  },
});
