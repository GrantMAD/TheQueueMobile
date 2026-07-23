export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: any
    }
    Views: {
      [key: string]: any
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      media_type: 'movie' | 'tv' | 'book' | 'podcast' | 'anime' | 'album'
      media_status: 'want' | 'current' | 'completed' | 'dropped' | 'paused'
      group_type: 'private' | 'public'
      group_role: 'owner' | 'admin' | 'member'
      invite_status: 'pending' | 'accepted' | 'declined'
      voting_status: 'pending' | 'active' | 'completed'
      notification_type:
        | 'group_invite'
        | 'vote_started'
        | 'vote_ended'
        | 'new_follower'
        | 'new_review'
        | 'progress_update'
        | 'group_join_request'
        | 'invite_accepted'
    }
  }
}
