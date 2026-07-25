import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { FeedActivity } from '@/types';
import { Avatar } from '../ui/Avatar';
import { relativeDate, formatRating } from '@/lib/utils/formatters';

interface ActivityCardProps {
  activity: FeedActivity;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const MEDIA_TYPE_LABELS: Record<string, string> = {
  movie: 'Movie',
  tv: 'TV',
  book: 'Book',
  anime: 'Anime',
  podcast: 'Podcast',
  album: 'Album',
};

const MEDIA_TYPE_COLORS: Record<string, string> = {
  movie: Colors.typeMovie,
  tv: Colors.typeTv,
  book: Colors.typeBook,
  anime: Colors.typeAnime,
  podcast: Colors.typePodcast,
  album: Colors.typeAlbum,
};

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  want: {
    label: 'Want to Watch',
    icon: 'bookmark-outline',
    color: Colors.activityWant,
  },
  current: {
    label: 'Watching',
    icon: 'play-circle-outline',
    color: Colors.activityWatching,
  },
  completed: {
    label: 'Completed',
    icon: 'checkmark-circle-outline',
    color: Colors.activityCompleted,
  },
  dropped: {
    label: 'Dropped',
    icon: 'close-circle-outline',
    color: Colors.activityDropped,
  },
  paused: {
    label: 'Paused',
    icon: 'pause-circle-outline',
    color: Colors.activityPaused,
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ActivityCard({ activity }: ActivityCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isReview = activity.activity_type === 'review';
  const actorName = activity.display_name ?? activity.username ?? 'Someone';

  // Resolve accent colour + activity pill config
  let accentColor: string = Colors.primary;
  let pillLabel = '';
  let pillIcon: keyof typeof Ionicons.glyphMap = 'star-outline';

  if (isReview) {
    accentColor = Colors.activityReview;
    pillLabel = 'Reviewed';
    pillIcon = 'star-outline';
  } else if (activity.status && STATUS_CONFIG[activity.status]) {
    const cfg = STATUS_CONFIG[activity.status];
    accentColor = cfg.color;
    pillLabel = cfg.label;
    pillIcon = cfg.icon;
  }

  const mediaTypeColor: string =
    MEDIA_TYPE_COLORS[activity.media_type] ?? Colors.primary;
  const mediaTypeLabel =
    MEDIA_TYPE_LABELS[activity.media_type] ?? activity.media_type;

  const hasPoster = !!activity.media_cover_url;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.card,
          { borderLeftColor: accentColor, transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* ── Poster + content row ─────────────────────── */}
        <View style={styles.row}>
          {/* Poster */}
          {hasPoster ? (
            <View style={styles.posterWrapper}>
              <Image
                source={{ uri: activity.media_cover_url! }}
                style={styles.poster}
                contentFit="cover"
                transition={300}
              />
              {/* Media type badge pinned to bottom of poster */}
              <View
                style={[
                  styles.mediaTypeBadge,
                  { backgroundColor: mediaTypeColor },
                ]}
              >
                <Text style={styles.mediaTypeBadgeText}>{mediaTypeLabel}</Text>
              </View>
            </View>
          ) : (
            /* Fallback placeholder when no cover */
            <View
              style={[
                styles.posterWrapper,
                styles.posterPlaceholder,
                { borderColor: mediaTypeColor + '40' },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={22}
                color={mediaTypeColor}
                style={{ opacity: 0.5 }}
              />
              <View
                style={[
                  styles.mediaTypeBadge,
                  { backgroundColor: mediaTypeColor },
                ]}
              >
                <Text style={styles.mediaTypeBadgeText}>{mediaTypeLabel}</Text>
              </View>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>
            {/* User row */}
            <View style={styles.userRow}>
              <Avatar
                url={activity.avatar_url}
                name={actorName}
                size="sm"
                ringColor={accentColor}
              />
              <View style={styles.userInfo}>
                <Text style={styles.actorName} numberOfLines={1}>
                  {actorName}
                </Text>
                <Text style={styles.dateText}>
                  {relativeDate(activity.occurred_at)}
                </Text>
              </View>
            </View>

            {/* Activity pill */}
            <View
              style={[
                styles.activityPill,
                {
                  backgroundColor: accentColor + '18',
                  borderColor: accentColor + '50',
                },
              ]}
            >
              <Ionicons name={pillIcon} size={11} color={accentColor} />
              <Text style={[styles.activityPillText, { color: accentColor }]}>
                {pillLabel}
              </Text>
            </View>

            {/* Media title */}
            <Text style={styles.mediaTitle} numberOfLines={2}>
              {activity.media_title}
            </Text>

            {/* Rating (reviews) */}
            {isReview && activity.rating !== null && (
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = activity.rating! >= star;
                  const half =
                    !filled && activity.rating! >= star - 0.5;
                  return (
                    <Ionicons
                      key={star}
                      name={
                        filled
                          ? 'star'
                          : half
                          ? 'star-half'
                          : 'star-outline'
                      }
                      size={13}
                      color={Colors.activityReview}
                      style={{ marginRight: 1 }}
                    />
                  );
                })}
                <Text style={styles.ratingText}>
                  {formatRating(activity.rating)}
                </Text>
              </View>
            )}

            {/* Episode progress for 'watching' items */}
            {!isReview &&
              activity.status === 'current' &&
              activity.current_episode !== null && (
                <View style={styles.progressRow}>
                  <Ionicons
                    name="film-outline"
                    size={11}
                    color={Colors.textMuted}
                  />
                  <Text style={styles.progressText}>
                    {activity.current_season !== null
                      ? `S${activity.current_season} · E${activity.current_episode}`
                      : `Ep. ${activity.current_episode}`}
                  </Text>
                </View>
              )}
          </View>
        </View>

        {/* ── Review quote ─────────────────────────────── */}
        {isReview && activity.hook_text ? (
          <View style={styles.quoteBlock}>
            <Text style={styles.quoteOpen}>"</Text>
            <Text style={styles.quoteText}>{activity.hook_text}</Text>
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const POSTER_WIDTH = 72;
const POSTER_HEIGHT = 108; // 2:3 ratio

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderLeftWidth: 3,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.25)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  row: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
  },

  // ── Poster ────────────────────────────────────────
  posterWrapper: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaTypeBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 3,
    alignItems: 'center',
  },
  mediaTypeBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Content ───────────────────────────────────────
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userInfo: {
    flex: 1,
  },
  actorName: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  dateText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // ── Activity pill ─────────────────────────────────
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  activityPillText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
  },

  // ── Media title ───────────────────────────────────
  mediaTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    lineHeight: 20,
  },

  // ── Rating ────────────────────────────────────────
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    color: Colors.activityReview,
    marginLeft: 4,
  },

  // ── Episode progress ──────────────────────────────
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },

  // ── Quote block ───────────────────────────────────
  quoteBlock: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    alignItems: 'flex-start',
  },
  quoteOpen: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.activityReview,
    lineHeight: 22,
    opacity: 0.7,
  },
  quoteText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 19,
  },
});
