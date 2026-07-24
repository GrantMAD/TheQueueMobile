import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { router } from 'expo-router';

export default function ProfileTab() {
  const { profile } = useUser();
  const signOutStore = useAuthStore((state) => state.signOut);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    signOutStore();
    router.replace('/(auth)/welcome');
  };

  const name = profile?.display_name ?? profile?.username ?? 'Anonymous';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <View style={styles.avatarRow}>
          <Avatar url={profile?.avatar_url} name={name} size="xl" ringColor={Colors.primary} />
          <View style={styles.profileMeta}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.username}>@{profile?.username}</Text>
          </View>
        </View>

        {profile?.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : (
          <Text style={styles.bioPlaceholder}>No bio provided yet.</Text>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.following_count ?? 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.followers_count ?? 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
      </Card>

      <Button
        text="Edit Profile"
        variant="secondary"
        onPress={() => router.push('/profile/settings')}
        style={styles.editBtn}
      />

      <Button
        text="Sign Out"
        variant="destructive"
        onPress={handleSignOut}
        style={styles.signOutBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    padding: 20,
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileMeta: {
    marginLeft: 20,
    flex: 1,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  username: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  bio: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginVertical: 12,
  },
  bioPlaceholder: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 16,
    marginTop: 10,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    marginTop: 20,
    marginBottom: 10,
  },
  signOutBtn: {
    marginTop: 10,
  },
});
