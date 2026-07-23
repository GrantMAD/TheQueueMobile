import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';

interface ProfileHeaderProps {
  profile: UserProfile;
  isSelf?: boolean;
  rightSlot?: React.ReactNode;
}

export function ProfileHeader({ profile, isSelf, rightSlot }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Avatar url={profile.avatar_url} name={profile.display_name ?? profile.username} size="xl" />
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.followers_count}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{profile.following_count}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.nameContainer}>
          <Text style={styles.displayName}>{profile.display_name ?? profile.username}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
        </View>
        {rightSlot && <View style={styles.rightSlot}>{rightSlot}</View>}
      </View>
      {profile.bio && (
        <Text style={styles.bio}>{profile.bio}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 16,
  },
  displayName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.textPrimary,
  },
  username: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rightSlot: {
    justifyContent: 'center',
  },
  bio: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
});
