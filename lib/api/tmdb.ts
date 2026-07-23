import type { MediaItem } from '@/types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY ?? ''

interface TMDBMovie {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  overview?: string
  genre_ids?: number[]
  media_type?: string
  runtime?: number
  number_of_seasons?: number
  number_of_episodes?: number
}

function normalizeMovie(item: TMDBMovie, forceType?: 'movie' | 'tv'): MediaItem {
  const type = forceType ?? (item.media_type === 'tv' ? 'tv' : 'movie')
  const rawDate = item.release_date ?? item.first_air_date ?? ''
  const year = rawDate ? parseInt(rawDate.slice(0, 4), 10) : null
  return {
    external_id: String(item.id),
    api_source: 'tmdb',
    type,
    title: item.title ?? item.name ?? 'Unknown',
    cover_url: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
    release_year: year || null,
    description: item.overview ?? null,
    genres: [],
    metadata: {
      runtime: item.runtime,
      total_seasons: item.number_of_seasons,
      total_episodes: item.number_of_episodes,
    },
  }
}

export async function searchTMDB(query: string, type?: 'movie' | 'tv'): Promise<MediaItem[]> {
  const endpoint = type
    ? `${TMDB_BASE}/search/${type}?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    : `${TMDB_BASE}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`

  const res = await fetch(endpoint)
  if (!res.ok) return []
  const data = await res.json()

  return (data.results ?? [])
    .filter((r: TMDBMovie) => r.media_type !== 'person')
    .map((r: TMDBMovie) => normalizeMovie(r))
}

export async function getTMDBItem(id: string, type: 'movie' | 'tv'): Promise<MediaItem | null> {
  const res = await fetch(`${TMDB_BASE}/${type}/${id}?api_key=${API_KEY}`)
  if (!res.ok) return null
  const data = await res.json()
  return normalizeMovie(data, type)
}
