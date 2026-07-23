import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Review } from '@/types';
import { Avatar } from '../ui/Avatar';
import { formatRating, relativeDate } from '@/lib/utils/formatters';

interface ReviewCardProps {
  review: Review;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onUserPress?: () => void;
  isLiked?: boolean;
}

export function ReviewCard({ review, onLikePress, onCommentPress, onUserPress, isLiked = false }: ReviewCardProps) {
  const [showSpoiler, setShowSpoiler] = useState(!review.contains_spoilers);
  const [expanded, setExpanded] = useState(false);

  const authorName = review.profile?.display_name ?? review.profile?.username ?? 'Anonymous';

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={onUserPress}>
        <Avatar url={review.profile?.avatar_url} name={authorName} size="sm" />
        <View style={styles.headerInfo}>
          <Text style={styles.author}>{authorName}</Text>
          <Text style={styles.date}>{relativeDate(review.created_at)}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingText}>{formatRating(review.rating)}</Text>
        </View>
      </Pressable>

      <View style={styles.body}>
        {review.contains_spoilers && !showSpoiler ? (
          <Pressable style={styles.spoilerCover} onPress={() => setShowSpoiler(true)}>
            <Text style={styles.spoilerText}>Review contains spoilers. Tap to reveal.</Text>
          </Pressable>
        ) : (
          <View>
            <Text style={styles.hook} numberOfLines={expanded ? undefined : 3}>
              "{review.hook_text}"
            </Text>

            {review.body_text && expanded && (
              <Text style={styles.extendedBody}>{review.body_text}</Text>
            )}

            {review.body_text && (
              <Pressable style={styles.expandBtn} onPress={() => setExpanded(!expanded)}>
                <Text style={styles.expandText}>{expanded ? 'Show Less' : 'Read More'}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.actionBtn} onPress={onLikePress}>
          <Text style={[styles.actionIcon, isLiked && styles.likedIcon]}>
            {isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            {review.likes_count}
          </Text>
        </Pressable>

        <Pressable style={styles.actionBtn} onPress={onCommentPress}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{review.comments_count}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  author: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  date: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryAlpha10,
    borderColor: Colors.primaryAlpha20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  star: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    marginRight: 4,
  },
  ratingText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.primary,
  },
  body: {
    marginBottom: 14,
  },
  hook: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  extendedBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
  expandBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Colors.primary,
  },
  spoilerCover: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  spoilerText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    fontSize: FontSize.md,
  },
  likedIcon: {
    // Red accent for active like icon
  },
  actionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  likedText: {
    color: Colors.error,
    fontFamily: FontFamily.semiBold,
  },
});
