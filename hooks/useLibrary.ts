import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { LibraryEntry, MediaStatus } from '@/types'
import { upsertMediaItem } from '@/lib/api/mediaSearch'

export function useLibrary() {
  const session = useAuthStore((state) => state.session)
  const queryClient = useQueryClient()

  // Fetch full library
  const libraryQuery = useQuery({
    queryKey: ['library', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return []

      const { data, error } = await supabase
        .from('user_media')
        .select('*, media_item:media_items(*)')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return (data as unknown as LibraryEntry[]) ?? []
    },
    enabled: !!session?.user?.id,
  })

  // Add / Update item in library
  const updateLibraryMutation = useMutation({
    mutationFn: async ({
      mediaItem,
      status,
      currentEpisode,
      currentSeason,
      currentPage,
      personalRating,
    }: {
      mediaItem: any
      status: MediaStatus
      currentEpisode?: number
      currentSeason?: number
      currentPage?: number
      personalRating?: number
    }) => {
      if (!session?.user?.id) throw new Error('Not authenticated')

      // Ensure item is cached in media_items first
      const mediaItemId = await upsertMediaItem(mediaItem)
      if (!mediaItemId) throw new Error('Failed to cache media item')

      const payload: any = {
        user_id: session.user.id,
        media_item_id: mediaItemId,
        status,
        updated_at: new Date().toISOString(),
      }

      if (currentEpisode !== undefined) payload.current_episode = currentEpisode
      if (currentSeason !== undefined) payload.current_season = currentSeason
      if (currentPage !== undefined) payload.current_page = currentPage
      if (personalRating !== undefined) payload.personal_rating = personalRating

      const { data, error } = await supabase
        .from('user_media')
        .upsert(payload, { onConflict: 'user_id,media_item_id' })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', session?.user?.id] })
    },
  })

  // Remove item from library
  const removeLibraryMutation = useMutation({
    mutationFn: async (userMediaId: string) => {
      const { error } = await supabase
        .from('user_media')
        .delete()
        .eq('id', userMediaId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', session?.user?.id] })
    },
  })

  return {
    library: libraryQuery.data ?? [],
    isLoading: libraryQuery.isLoading,
    refetch: libraryQuery.refetch,
    updateLibrary: updateLibraryMutation.mutateAsync,
    isUpdating: updateLibraryMutation.isPending,
    removeFromLibrary: removeLibraryMutation.mutateAsync,
    isRemoving: removeLibraryMutation.isPending,
  }
}
