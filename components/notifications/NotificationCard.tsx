import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Notification } from '@/types';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { relativeDate } from '@/lib/utils/formatters';

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
}

export function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'group_invite': return '📩';
      case 'vote_started': return '🗳️';
      case 'vote_ended': return '🏆';
      case 'new_follower': return '👤';
      case 'new_review': return '📝';
      case 'progress_update': return '📈';
      case 'group_join_request': return '👋';
      case 'invite_accepted': return '✅';
      default: return '🔔';
    }
  };

  return (
    <Pressable 
      style={[styles.card, !notification.is_read && styles.unreadCard]} 
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        {notification.body && <Text style={styles.body}>{notification.body}</Text>}
        <Text style={styles.date}>{relativeDate(notification.created_at)}</Text>
      </View>
      {!notification.is_read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: Colors.surfaceElevated,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  date: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginLeft: 12,
  },
});
