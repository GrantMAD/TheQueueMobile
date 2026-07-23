import type { MediaItem } from '@/types'

const ANILIST_GQL = 'https://graphql.anilist.co'

const SEARCH_QUERY = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
      id
      title { romaji english }
      coverImage { large }
      startDate { year }
      description(asHtml: false)
      genres
      episodes
      seasonYear
      status
      nextAiringEpisode { episode }
    }
  }
}
`

const ITEM_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english }
    coverImage { large }
    startDate { year }
    description(asHtml: false)
    genres
    episodes
    seasonYear
    status
    nextAiringEpisode { episode }
  }
}
`

interface AniListMedia {
  id: number
  title: { romaji: string; english?: string | null }
  coverImage: { large?: string | null }
  startDate: { year?: number | null }
  description?: string | null
  genres?: string[]
  episodes?: number | null
  seasonYear?: number | null
  status?: string | null
  nextAiringEpisode?: { episode: number } | null
}

function normalizeAnime(media: AniListMedia): MediaItem {
  return {
    external_id: String(media.id),
    api_source: 'anilist',
    type: 'anime',
    title: media.title.english ?? media.title.romaji,
    cover_url: media.coverImage.large ?? null,
    release_year: media.startDate.year ?? media.seasonYear ?? null,
    description: media.description?.replace(/<[^>]+>/g, '') ?? null,
    genres: media.genres ?? [],
    metadata: {
      total_episodes: media.episodes ?? null,
      status: media.status ?? null,
      next_episode: media.nextAiringEpisode?.episode ?? null,
    },
  }
}

async function gqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
  const res = await fetch(ANILIST_GQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.data as T
}

export async function searchAniList(query: string): Promise<MediaItem[]> {
  const data = await gqlRequest<{ Page: { media: AniListMedia[] } }>(SEARCH_QUERY, {
    search: query,
    page: 1,
    perPage: 20,
  })
  return (data?.Page?.media ?? []).map(normalizeAnime)
}

export async function getAniListItem(id: string): Promise<MediaItem | null> {
  const data = await gqlRequest<{ Media: AniListMedia }>(ITEM_QUERY, { id: parseInt(id, 10) })
  return data?.Media ? normalizeAnime(data.Media) : null
}
