import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { Notification } from '@/types'

export function useNotifications() {
  const session = useAuthStore((state) => state.session)
  const queryClient = useQueryClient()

  // Fetch user notifications
  const notificationsQuery = useQuery({
    queryKey: ['notifications', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as unknown as Notification[]) ?? []
    },
    enabled: !!session?.user?.id,
  })

  // Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', session?.user?.id] })
    },
  })

  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) return

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', session?.user?.id] })
    },
  })

  return {
    notifications: notificationsQuery.data ?? [],
    isLoading: notificationsQuery.isLoading,
    refetch: notificationsQuery.refetch,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    unreadCount: (notificationsQuery.data ?? []).filter((n) => !n.is_read).length,
  }
}
