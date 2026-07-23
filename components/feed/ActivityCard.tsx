import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { FeedActivity } from '@/types';
import { Avatar } from '../ui/Avatar';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { relativeDate, formatRating } from '@/lib/utils/formatters';

interface ActivityCardProps {
  activity: FeedActivity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const isReview = activity.activity_type === 'review';
  const actorName = activity.display_name ?? activity.username ?? 'Someone';

  // Specific left accent bar color based on status/activity type
  let accentColor: string = Colors.primary;
  let subtitle = '';

  if (isReview) {
    accentColor = Colors.activityReview;
    subtitle = 'reviewed';
  } else if (activity.status) {
    const statusColors: Record<string, string> = {
      want: Colors.activityWant,
      current: Colors.activityWatching,
      completed: Colors.activityCompleted,
      dropped: Colors.activityDropped,
      paused: Colors.activityPaused,
    };
    accentColor = statusColors[activity.status] || Colors.primary;

    const actionText: Record<string, string> = {
      want: 'wants to watch',
      current: 'is watching',
      completed: 'completed',
      dropped: 'dropped',
      paused: 'paused',
    };
    subtitle = actionText[activity.status] ?? 'updated status for';
  }

  return (
    <Card style={styles.card}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Avatar
            url={activity.avatar_url}
            name={actorName}
            size="sm"
            ringColor={accentColor}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.actorText}>
              {actorName} <Text style={styles.actionText}>{subtitle}</Text>
            </Text>
            <Text style={styles.dateText}>{relativeDate(activity.occurred_at)}</Text>
          </View>
        </View>

        <View style={styles.mediaSection}>
          <Text style={styles.mediaTitle}>{activity.media_title}</Text>
          {isReview && activity.rating !== null && (
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.rating}>{formatRating(activity.rating)}</Text>
            </View>
          )}
        </View>

        {isReview && activity.hook_text ? (
          <View style={styles.quoteBlock}>
            <Text style={styles.quoteText}>"{activity.hook_text}"</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 14,
  },
  accentBar: {
    width: 5,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  actorText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  actionText: {
    fontFamily: FontFamily.regular,
    color: Colors.textSecondary,
  },
  dateText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  mediaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryAlpha10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  star: {
    color: Colors.primary,
    fontSize: FontSize.sm,
  },
  rating: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  quoteBlock: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.surfaceBorder,
    borderLeftWidth: 3,
    borderLeftColor: Colors.activityReview,
    borderStyle: 'solid',
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  quoteText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
