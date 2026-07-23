import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Group } from '@/types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
  onJoinPress?: () => void;
  isMember?: boolean;
  joining?: boolean;
}

export function GroupCard({ group, onPress, onJoinPress, isMember = false, joining = false }: GroupCardProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.coverContainer}>
          {group.cover_image_url ? (
            <Image
              source={{ uri: group.cover_image_url }}
              style={styles.cover}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholderCover}>
              <Text style={styles.placeholderText}>👥</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {group.name}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {group.description || 'No description provided.'}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.meta}>
              <Badge text={group.type.toUpperCase()} variant="default" />
              <Text style={styles.memberCount}>
                {group.members_count} {group.members_count === 1 ? 'member' : 'members'}
              </Text>
            </View>

            {!isMember && onJoinPress && (
              <Button
                text="Join"
                variant="primary"
                size="sm"
                loading={joining}
                onPress={onJoinPress}
                style={styles.joinBtn}
              />
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
  },
  coverContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FontSize.xl,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 6,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberCount: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  joinBtn: {
    height: 28,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
});
