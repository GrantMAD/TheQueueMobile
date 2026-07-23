import type { Database } from './database'

export type MediaType = Database['public']['Enums']['media_type']
export type MediaStatus = Database['public']['Enums']['media_status']
export type GroupType = Database['public']['Enums']['group_type']
export type GroupRole = Database['public']['Enums']['group_role']
export type InviteStatus = Database['public']['Enums']['invite_status']
export type VotingStatus = Database['public']['Enums']['voting_status']
export type NotificationType = Database['public']['Enums']['notification_type']

export interface UserProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  is_public: boolean
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export interface MediaItem {
  id?: string
  external_id: string
  api_source: 'tmdb' | 'openlibrary' | 'anilist' | 'spotify'
  type: MediaType
  title: string
  cover_url?: string | null
  release_year?: number | null
  description?: string | null
  genres?: string[]
  metadata?: Record<string, unknown>
}

/** A user's personal library entry, joined with its media item */
export interface LibraryEntry {
  id: string
  user_id: string
  media_item_id: string
  status: MediaStatus
  current_episode?: number | null
  current_season?: number | null
  current_page?: number | null
  personal_rating?: number | null
  started_at?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
  media_item?: MediaItem
}

/** Activity feed item returned by get_friend_feed() */
export interface FeedActivity {
  activity_type: 'status_update' | 'review'
  actor_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  media_item_id: string
  media_title: string
  media_type: MediaType
  media_cover_url: string | null
  status: MediaStatus | null
  rating: number | null
  hook_text: string | null
  current_episode: number | null
  current_season: number | null
  occurred_at: string
}

export interface Review {
  id: string
  user_id: string
  media_item_id: string
  rating: number
  hook_text: string
  body_text?: string | null
  contains_spoilers: boolean
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  profile?: UserProfile
}

export interface Group {
  id: string
  name: string
  description?: string | null
  cover_image_url?: string | null
  type: GroupType
  owner_id: string
  voting_enabled: boolean
  voting_duration_minutes: number
  votes_per_member: number
  members_count: number
  created_at: string
  updated_at: string
}

export interface GroupMember {
  group_id: string
  user_id: string
  role: GroupRole
  joined_at: string
  profile?: UserProfile
}

export interface VotingRound {
  id: string
  group_id: string
  created_by: string
  status: VotingStatus
  started_at?: string | null
  ends_at?: string | null
  winner_pool_id?: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body?: string | null
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}
