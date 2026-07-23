import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Group } from '@/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface GroupHeaderProps {
  group: Group;
  isOwner: boolean;
  onSettingsPress?: () => void;
  onLeavePress?: () => void;
}

export function GroupHeader({ group, isOwner, onSettingsPress, onLeavePress }: GroupHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        {group.cover_image_url ? (
          <Image source={{ uri: group.cover_image_url }} style={styles.banner} contentFit="cover" />
        ) : (
          <View style={styles.placeholderBanner}>
            <Text style={styles.placeholderLogo}>👥</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{group.name}</Text>
          <View style={styles.badgeRow}>
            <Badge text={group.type.toUpperCase()} variant="default" />
            <Text style={styles.memberText}>
              {group.members_count} {group.members_count === 1 ? 'member' : 'members'}
            </Text>
          </View>
        </View>

        {group.description && <Text style={styles.description}>{group.description}</Text>}

        <View style={styles.actionRow}>
          {isOwner && onSettingsPress && (
            <Button
              text="Settings"
              variant="secondary"
              size="sm"
              onPress={onSettingsPress}
              style={styles.actionBtn}
            />
          )}
          {!isOwner && onLeavePress && (
            <Button
              text="Leave Group"
              variant="destructive"
              size="sm"
              onPress={onLeavePress}
              style={styles.actionBtn}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  bannerContainer: {
    height: 120,
    width: '100%',
    backgroundColor: Colors.surfaceElevated,
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  placeholderBanner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLogo: {
    fontSize: FontSize['4xl'],
  },
  content: {
    padding: 16,
  },
  titleRow: {
    marginBottom: 8,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  memberText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
  },
});
