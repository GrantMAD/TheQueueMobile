import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { FeedActivity } from '@/types'

export function useFeed() {
  const session = useAuthStore((state) => state.session)

  return useInfiniteQuery({
    queryKey: ['friend-feed', session?.user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!session?.user?.id) return []

      const { data, error } = await supabase.rpc('get_friend_feed', {
        p_user_id: session.user.id,
        p_limit: 10,
        p_offset: pageParam,
      })

      if (error) {
        console.error('Error fetching friend feed:', error)
        throw error
      }

      return (data as unknown as FeedActivity[]) ?? []
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If last page had fewer items than limit, we reached the end
      if (lastPage.length < 10) return undefined
      return allPages.length * 10
    },
    enabled: !!session?.user?.id,
  })
}
