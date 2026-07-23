/**
 * The Queue — Design System Colour Tokens
 *
 * A dark-first design system with an indigo/violet primary palette.
 * All colours are defined as string values for use with StyleSheet.
 */

export const Colors = {
  // ─── Brand ─────────────────────────────────────────────────────────────
  primary: '#6366f1',        // indigo-500
  primaryLight: '#818cf8',   // indigo-400
  primaryDark: '#4f46e5',    // indigo-600
  secondary: '#8b5cf6',      // violet-500
  accent: '#a78bfa',         // violet-400

  // ─── Backgrounds ───────────────────────────────────────────────────────
  background: '#0f0f14',     // near-black with a hint of indigo
  surface: '#16161f',        // card background
  surfaceElevated: '#1e1e2a', // elevated card / sheet
  surfaceBorder: '#2a2a3a',  // subtle border

  // ─── Text ──────────────────────────────────────────────────────────────
  textPrimary: '#f1f1f8',    // near-white
  textSecondary: '#a0a0b8',  // muted
  textMuted: '#6b6b84',      // very muted / placeholder
  textInverse: '#0f0f14',    // for text on light backgrounds

  // ─── Status / Library ──────────────────────────────────────────────────
  statusWant: '#ec4899',      // pink-500 — Want to Watch
  statusWatching: '#6366f1',  // indigo-500 — Watching/Reading/Listening
  statusCompleted: '#10b981', // emerald-500 — Completed
  statusDropped: '#ef4444',   // red-500 — Dropped
  statusPaused: '#f59e0b',    // amber-500 — Paused

  // ─── Activity Feed Colours (matching web spec) ─────────────────────────
  activityWatching: '#6366f1',  // indigo
  activityCompleted: '#10b981', // emerald
  activityWant: '#ec4899',      // pink
  activityReview: '#8b5cf6',    // violet
  activityPaused: '#f59e0b',    // amber
  activityDropped: '#ef4444',   // red

  // ─── Media Type Colours ────────────────────────────────────────────────
  typeMovie: '#3b82f6',    // blue-500
  typeTv: '#8b5cf6',       // violet-500
  typeBook: '#10b981',     // emerald-500
  typeAnime: '#ec4899',    // pink-500
  typePodcast: '#f59e0b',  // amber-500
  typeAlbum: '#06b6d4',    // cyan-500

  // ─── Semantic ──────────────────────────────────────────────────────────
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // ─── Gradients (start / end pairs) ────────────────────────────────────
  gradientPrimary: ['#6366f1', '#8b5cf6'] as const,
  gradientDark: ['#16161f', '#0f0f14'] as const,
  gradientCard: ['#1e1e2a', '#16161f'] as const,

  // ─── Transparency helpers ──────────────────────────────────────────────
  overlay: 'rgba(0, 0, 0, 0.6)',
  backdropDim: 'rgba(0, 0, 0, 0.75)',
  primaryAlpha10: 'rgba(99, 102, 241, 0.10)',
  primaryAlpha20: 'rgba(99, 102, 241, 0.20)',
} as const;

export type ColorKey = keyof typeof Colors;
