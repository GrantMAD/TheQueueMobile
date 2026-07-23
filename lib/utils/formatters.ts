import { formatDistanceToNow } from 'date-fns'
import type { MediaType, MediaStatus } from '@/types'

// ─── Date & Time ──────────────────────────────────────────────────────────────

export function relativeDate(isoString: string): string {
  try {
    return formatDistanceToNow(new Date(isoString), { addSuffix: true })
  } catch {
    return ''
  }
}

export function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

// ─── Rating ───────────────────────────────────────────────────────────────────

/** Formats a 0–10 rating to one decimal place (e.g., 8.5) */
export function formatRating(rating: number | null | undefined): string {
  if (rating == null) return '—'
  return rating.toFixed(1)
}

/** Returns a percentage string for star displays (e.g., "85%") */
export function ratingToPercent(rating: number): string {
  return `${Math.round((rating / 10) * 100)}%`
}

// ─── Media Labels ─────────────────────────────────────────────────────────────

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatEpisodeLabel(
  episode?: number | null,
  season?: number | null
): string {
  if (season && episode) return `S${season} E${episode}`
  if (episode) return `Ep. ${episode}`
  return ''
}

export function formatPageCount(pages: number | null | undefined): string {
  if (!pages) return ''
  return `${pages.toLocaleString()} pages`
}

export function mediaTypeLabel(type: MediaType): string {
  const labels: Record<MediaType, string> = {
    movie: 'Movie',
    tv: 'TV Show',
    book: 'Book',
    podcast: 'Podcast',
    anime: 'Anime',
    album: 'Album',
  }
  return labels[type] ?? type
}

export function statusLabel(status: MediaStatus): string {
  const labels: Record<MediaStatus, string> = {
    want: 'Want to Watch',
    current: 'Watching',
    completed: 'Completed',
    dropped: 'Dropped',
    paused: 'Paused',
  }
  return labels[status] ?? status
}

// ─── Text ─────────────────────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).trimEnd() + '…'
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
