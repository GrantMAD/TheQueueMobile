import type { MediaItem } from '@/types'

const OL_BASE = 'https://openlibrary.org'
const COVER_BASE = 'https://covers.openlibrary.org/b/id'

interface OLSearchDoc {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  cover_i?: number
  number_of_pages_median?: number
  subject?: string[]
}

function normalizeBook(doc: OLSearchDoc): MediaItem {
  const id = doc.key.replace('/works/', '')
  return {
    external_id: id,
    api_source: 'openlibrary',
    type: 'book',
    title: doc.title,
    cover_url: doc.cover_i ? `${COVER_BASE}/${doc.cover_i}-M.jpg` : null,
    release_year: doc.first_publish_year ?? null,
    description: null,
    genres: doc.subject?.slice(0, 5) ?? [],
    metadata: {
      author: doc.author_name?.[0] ?? null,
      page_count: doc.number_of_pages_median ?? null,
    },
  }
}

export async function searchOpenLibrary(query: string): Promise<MediaItem[]> {
  const res = await fetch(`${OL_BASE}/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median,subject`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.docs ?? []).map(normalizeBook)
}

export async function getOpenLibraryItem(id: string): Promise<MediaItem | null> {
  const [workRes, searchRes] = await Promise.all([
    fetch(`${OL_BASE}/works/${id}.json`),
    fetch(`${OL_BASE}/search.json?q=${id}&limit=1&fields=cover_i,number_of_pages_median,author_name,first_publish_year`),
  ])
  if (!workRes.ok) return null
  const work = await workRes.json()
  const search = searchRes.ok ? await searchRes.json() : { docs: [] }
  const doc = search.docs?.[0] ?? {}
  return {
    external_id: id,
    api_source: 'openlibrary',
    type: 'book',
    title: work.title ?? 'Unknown',
    cover_url: doc.cover_i ? `${COVER_BASE}/${doc.cover_i}-M.jpg` : null,
    release_year: doc.first_publish_year ?? null,
    description: typeof work.description === 'string'
      ? work.description
      : work.description?.value ?? null,
    genres: work.subjects?.slice(0, 5) ?? [],
    metadata: {
      author: doc.author_name?.[0] ?? null,
      page_count: doc.number_of_pages_median ?? null,
    },
  }
}
