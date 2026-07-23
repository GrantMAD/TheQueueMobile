import React from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { Stack, router } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import { useRealtime } from '@/hooks/useRealtime';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize } from '@/constants/typography';
import { Notification } from '@/types';
import { useAuthStore } from '@/store/authStore';

export default function NotificationsScreen() {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const session = useAuthStore((state) => state.session);

  // Subscribe to real-time notification updates
  useRealtime({
    channelName: `notifications-${session?.user?.id}`,
    tableName: 'notifications',
    filter: session?.user?.id ? `user_id=eq.${session.user.id}` : undefined,
    queryKeyToInvalidate: ['notifications', session?.user?.id || ''],
  });

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on type
    const data = notification.data as any;
    switch (notification.type) {
      case 'new_follower':
      case 'invite_accepted':
        if (data.username) router.push(`/profile/${data.username}`);
        break;
      case 'group_invite':
      case 'vote_started':
      case 'vote_ended':
      case 'progress_update':
      case 'group_join_request':
        if (data.group_id) router.push(`/groups/${data.group_id}`);
        break;
      case 'new_review':
        if (data.media_item_id) router.push(`/media/${data.media_item_id}`);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Notifications', 
          headerTitleStyle: { color: Colors.textPrimary }, 
          headerStyle: { backgroundColor: Colors.surface },
          headerRight: () => unreadCount > 0 ? (
            <Button 
              text="Mark all read" 
              variant="ghost" 
              size="sm" 
              onPress={() => markAllAsRead()} 
              style={{ paddingHorizontal: 0 }}
            />
          ) : null
        }} 
      />

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard 
              notification={item} 
              onPress={() => handleNotificationPress(item)} 
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>You're all caught up</Text>
              <Text style={styles.emptySubtitle}>No new notifications right now.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
