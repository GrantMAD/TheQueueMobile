/**
 * Spotify API wrapper — DEFERRED at launch.
 * Scaffolded to satisfy imports; returns empty results until enabled.
 */
import type { MediaItem } from '@/types'

export async function searchSpotify(_query: string, _type: 'podcast' | 'album'): Promise<MediaItem[]> {
  // TODO: Implement Spotify search when Podcast/Album integration is enabled
  console.warn('[Spotify] Integration deferred — returning empty results')
  return []
}

export async function getSpotifyItem(_id: string): Promise<MediaItem | null> {
  // TODO: Implement Spotify item fetch when integration is enabled
  return null
}
