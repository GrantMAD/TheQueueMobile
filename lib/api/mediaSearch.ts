import type { MediaItem, MediaType } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { searchTMDB } from './tmdb'
import { searchOpenLibrary } from './openLibrary'
import { searchAniList } from './anilist'
import { searchSpotify } from './spotify'

export interface SearchOptions {
  query: string
  type?: MediaType | 'all'
}

/**
 * Unified media search.
 *
 * Routes the query to the correct API(s) based on the type filter.
 * All external API calls attempt to go through the Supabase Edge Function
 * `search-media` first; if unavailable, falls back to direct API calls.
 */
export async function searchMedia({ query, type = 'all' }: SearchOptions): Promise<MediaItem[]> {
  if (!query.trim()) return []

  // Try Edge Function first (keeps API keys server-side + caches results)
  try {
    const { data, error } = await supabase.functions.invoke('search-media', {
      body: { query, type },
    })
    if (!error && data?.results) return data.results as MediaItem[]
  } catch {
    // Edge function unavailable — fall through to direct API calls
  }

  // Direct API fallback
  const searches: Promise<MediaItem[]>[] = []

  if (type === 'all' || type === 'movie') searches.push(searchTMDB(query, 'movie'))
  if (type === 'all' || type === 'tv') searches.push(searchTMDB(query, 'tv'))
  if (type === 'all' || type === 'book') searches.push(searchOpenLibrary(query))
  if (type === 'all' || type === 'anime') searches.push(searchAniList(query))
  if (type === 'podcast') searches.push(searchSpotify(query, 'podcast'))
  if (type === 'album') searches.push(searchSpotify(query, 'album'))

  const results = await Promise.allSettled(searches)
  return results
    .filter((r): r is PromiseFulfilledResult<MediaItem[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}

/**
 * Ensure a MediaItem exists in the Supabase `media_items` cache table.
 * Upserts by (external_id, api_source) and returns the DB row UUID.
 */
export async function upsertMediaItem(item: MediaItem): Promise<string | null> {
  const { data, error } = await (supabase
    .from('media_items')
    .upsert(
      {
        external_id: item.external_id,
        api_source: item.api_source,
        type: item.type,
        title: item.title,
        cover_url: item.cover_url,
        release_year: item.release_year,
        description: item.description,
        genres: item.genres ?? [],
        metadata: item.metadata ?? {},
      },
      { onConflict: 'external_id,api_source' }
    )
    .select('id')
    .single() as any)

  if (error) {
    console.error('[upsertMediaItem]', error.message)
    return null
  }
  return data?.id ?? null
}
