import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

interface RealtimeSubscriptionProps {
  channelName: string
  tableName: string
  filter?: string
  queryKeyToInvalidate: string[]
}

export function useRealtime({
  channelName,
  tableName,
  filter,
  queryKeyToInvalidate,
}: RealtimeSubscriptionProps) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter,
        },
        () => {
          // Invalidate React Query caches to trigger automatic UI updates on change
          queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, tableName, filter, queryKeyToInvalidate, queryClient])
}
