import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { MediaItem, MediaType } from '@/types';
import { searchMedia, upsertMediaItem } from '@/lib/api/mediaSearch';

export function useMedia() {
  const queryClient = useQueryClient();

  // Hook to search for media items across APIs
  const useMediaSearch = (query: string, type: MediaType | 'all' = 'all') => {
    return useQuery({
      queryKey: ['mediaSearch', query, type],
      queryFn: () => searchMedia({ query, type }),
      enabled: query.trim().length > 0,
      staleTime: 1000 * 60 * 5, // Cache search results for 5 minutes
    });
  };

  // Hook to get a single media item from the local Supabase DB cache by UUID
  const useMediaItem = (id: string | undefined) => {
    return useQuery({
      queryKey: ['media', id],
      queryFn: async () => {
        if (!id) return null;
        const { data, error } = await supabase
          .from('media_items')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) throw error;
        return data as unknown as MediaItem;
      },
      enabled: !!id,
      staleTime: 1000 * 60 * 30, // Media item metadata rarely changes
    });
  };

  // Mutation to safely cache an external MediaItem to the DB and return its UUID
  const upsertMediaMutation = useMutation({
    mutationFn: (item: MediaItem) => upsertMediaItem(item),
    onSuccess: (id) => {
      if (id) {
        // Pre-invalidate so subsequent requests for this ID are fresh
        queryClient.invalidateQueries({ queryKey: ['media', id] });
      }
    },
  });

  return {
    useMediaSearch,
    useMediaItem,
    cacheMediaItem: upsertMediaMutation.mutateAsync,
    isCaching: upsertMediaMutation.isPending,
  };
}
